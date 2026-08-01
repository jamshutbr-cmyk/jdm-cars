/**
 * Получает URL аватарки пользователя через Telegram Bot API.
 * Кешируем в памяти на 1 час чтобы не спамить API.
 */

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
    // Получаем список фото профиля
    const photosRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${numericId}&limit=1`,
    );
    const photosData = await photosRes.json();

    if (!photosData.ok || !photosData.result.photos.length) {
      cache.set(numericId, { url: null, expiresAt: Date.now() + TTL });
      return null;
    }

    // Берём файл среднего размера (индекс 1, или последний если меньше)
    const photos = photosData.result.photos[0];
    const fileId = photos[Math.min(1, photos.length - 1)].file_id;

    // Получаем file_path
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
    return url;
  } catch {
    return null;
  }
}
