import crypto from 'node:crypto';
import { getAvatarUrl } from './avatarCache.js';
import { writeDb } from './db.js';

/**
 * Validates the `initData` string Telegram gives every Mini App on launch.
 * Docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * The check uses HMAC-SHA256 with a secret derived from the bot token, so the
 * bot token must live only on the server (env var), never in client code.
 */
function verifyInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (computedHash !== hash) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    const user = JSON.parse(userRaw);
    return {
      id: String(user.id),
      firstName: user.first_name ?? 'Пользователь',
      username: user.username ?? null,
    };
  } catch {
    return null;
  }
}

export function createAuthMiddleware({ botToken, devMode }) {
  return async (req, res, next) => {
    const authHeader = req.header('authorization') || '';
    const devUser = req.header('x-dev-user');

    if (authHeader.startsWith('tma ')) {
      const initData = authHeader.slice(4);
      const user = botToken ? verifyInitData(initData, botToken) : null;
      if (user) {
        req.user = user;
        // Фоново кешируем аватарку пользователя в БД
        getAvatarUrl(user.id, botToken).then((avatarUrl) => {
          if (avatarUrl) {
            writeDb((state) => {
              if (!state.avatars) state.avatars = {};
              state.avatars[user.id] = avatarUrl;
              return state;
            }).catch(() => {});
          }
        }).catch(() => {});
        return next();
      }
      if (!devMode) {
        return res.status(401).json({ error: 'invalid_telegram_signature' });
      }
    }

    // Dev fallback — only for local testing outside Telegram (BotFather-less browser tab).
    if (devMode && devUser) {
      req.user = { id: `dev:${devUser}`, firstName: devUser, username: devUser };
      return next();
    }

    return res.status(401).json({ error: 'unauthorized' });
  };
}
