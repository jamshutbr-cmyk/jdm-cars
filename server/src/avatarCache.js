/**
 * Получает URL аватарки пользователя через Telegram Bot API.
 * Кешируем в памяти на 1 час чтобы не спамить API.
 * Также сохраняем в Turso для долгосрочного хранения.
 */

import { tursoClient } from './db.js';

const cache = new Map(); // userId -> { url, expiresAt }
const TTL = 60 * 60 * 1000; // 1 час

export async function getAvatarUrl(telegramUserId, botToken) {
  if (!botToken || !telegramUserId || telegramUserId.startsWith('dev:')) {
    return null;
  }

  const numericId = telegramUserId.replace('dev:', '');
  const cached = cache.get(numericId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    // Сначала смотрим в Turso
    const dbRes = await tursoClient.execute({ sql: 'SELECT url FROM avatars WHERE userId = ?', args: [numericId] });
    if (dbRes.rows.length > 0 && dbRes.rows[0].url) {
      const url = dbRes.rows[0].url;
      cache.set(numericId, { url, expiresAt: Date.now() + TTL });
      return url;
    }
  } catch {
    // если Turso недоступен — продолжаем
  }

  try {
    const photosRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${numericId}&limit=1`,
    );
    const photosData = await photosRes.json();

    if (!photosData.ok || !photosData.result.photos.length) {
      cache.set(numericId, { url: null, expiresAt: Date.now() + TTL });
      return null;
    }

    const photos = photosData.result.photos[0];
    const fileId = photos[Math.min(1, photos.length - 1)].file_id;

    const fileRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`,
    );
    const fileData = await fileRes.json();

    if (!fileData.ok) {
      cache.set(numericId, { url: null, expiresAt: Date.now() + TTL });
      return null;
    }

    const url = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
    cache.set(numericId, { url, expiresAt: Date.now() + TTL });

    // Сохраняем в Turso
    tursoClient.execute({ sql: 'INSERT OR REPLACE INTO avatars (userId, url) VALUES (?, ?)', args: [numericId, url] }).catch(() => {});

    return url;
  } catch {
    return null;
  }
}
