import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Инициализация таблиц при старте
export async function initDb() {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS cars (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS likes (
      carId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (carId, userId)
    )`,
    `CREATE TABLE IF NOT EXISTS favorites (
      carId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (carId, userId)
    )`,
    `CREATE TABLE IF NOT EXISTS views (
      carId TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (carId, userId)
    )`,
    `CREATE TABLE IF NOT EXISTS follows (
      followerId TEXT NOT NULL,
      followingId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      PRIMARY KEY (followerId, followingId)
    )`,
    `CREATE TABLE IF NOT EXISTS avatars (
      userId TEXT PRIMARY KEY,
      url TEXT NOT NULL
    )`,
  ], 'deferred');
  console.log('[db] Turso tables ready');
}

/**
 * Читает всю БД в формате совместимом со старым db.json.
 */
export async function readDb() {
  const [carsRes, likesRes, favsRes, viewsRes, followsRes, avatarsRes] = await Promise.all([
    client.execute('SELECT data FROM cars ORDER BY createdAt DESC'),
    client.execute('SELECT carId, userId, createdAt FROM likes'),
    client.execute('SELECT carId, userId, createdAt FROM favorites'),
    client.execute('SELECT carId, userId, createdAt FROM views'),
    client.execute('SELECT followerId, followingId, createdAt FROM follows'),
    client.execute('SELECT userId, url FROM avatars'),
  ]);

  const cars = carsRes.rows.map((r) => JSON.parse(r.data));
  const likes = likesRes.rows.map((r) => ({ carId: r.carId, userId: r.userId, createdAt: r.createdAt }));
  const favorites = favsRes.rows.map((r) => ({ carId: r.carId, userId: r.userId, createdAt: r.createdAt }));
  const views = viewsRes.rows.map((r) => ({ carId: r.carId, userId: r.userId, createdAt: r.createdAt }));
  const follows = followsRes.rows.map((r) => ({ followerId: r.followerId, followingId: r.followingId, createdAt: r.createdAt }));
  const avatars = Object.fromEntries(avatarsRes.rows.map((r) => [r.userId, r.url]));

  return { cars, likes, favorites, views, follows, avatars };
}

/**
 * Применяет мутацию к состоянию и сохраняет изменения в Turso.
 * Совместим с существующим кодом routes/cars.js.
 */
export async function writeDb(mutator) {
  const state = await readDb();
  const next = await mutator(state);
  await syncToDb(state, next);
  return next;
}

async function syncToDb(prev, next) {
  const stmts = [];

  // Cars — upsert новых/изменённых
  const prevCarIds = new Set(prev.cars.map((c) => c.id));
  const nextCarIds = new Set(next.cars.map((c) => c.id));

  for (const car of next.cars) {
    if (!prevCarIds.has(car.id)) {
      stmts.push({
        sql: 'INSERT OR REPLACE INTO cars (id, data, createdAt) VALUES (?, ?, ?)',
        args: [car.id, JSON.stringify(car), car.createdAt],
      });
    }
  }
  // Удалённые машины
  for (const car of prev.cars) {
    if (!nextCarIds.has(car.id)) {
      stmts.push({ sql: 'DELETE FROM cars WHERE id = ?', args: [car.id] });
      stmts.push({ sql: 'DELETE FROM likes WHERE carId = ?', args: [car.id] });
      stmts.push({ sql: 'DELETE FROM favorites WHERE carId = ?', args: [car.id] });
    }
  }

  // Обновление данных машины (PATCH)
  for (const car of next.cars) {
    if (prevCarIds.has(car.id)) {
      const prevCar = prev.cars.find((c) => c.id === car.id);
      if (JSON.stringify(prevCar) !== JSON.stringify(car)) {
        stmts.push({
          sql: 'INSERT OR REPLACE INTO cars (id, data, createdAt) VALUES (?, ?, ?)',
          args: [car.id, JSON.stringify(car), car.createdAt],
        });
      }
    }
  }

  // Likes
  const prevLikeKeys = new Set(prev.likes.map((l) => `${l.carId}:${l.userId}`));
  const nextLikeKeys = new Set(next.likes.map((l) => `${l.carId}:${l.userId}`));
  for (const l of next.likes) {
    if (!prevLikeKeys.has(`${l.carId}:${l.userId}`)) {
      stmts.push({ sql: 'INSERT OR IGNORE INTO likes (carId, userId, createdAt) VALUES (?, ?, ?)', args: [l.carId, l.userId, l.createdAt] });
    }
  }
  for (const l of prev.likes) {
    if (!nextLikeKeys.has(`${l.carId}:${l.userId}`)) {
      stmts.push({ sql: 'DELETE FROM likes WHERE carId = ? AND userId = ?', args: [l.carId, l.userId] });
    }
  }

  // Favorites
  const prevFavKeys = new Set(prev.favorites.map((f) => `${f.carId}:${f.userId}`));
  const nextFavKeys = new Set(next.favorites.map((f) => `${f.carId}:${f.userId}`));
  for (const f of next.favorites) {
    if (!prevFavKeys.has(`${f.carId}:${f.userId}`)) {
      stmts.push({ sql: 'INSERT OR IGNORE INTO favorites (carId, userId, createdAt) VALUES (?, ?, ?)', args: [f.carId, f.userId, f.createdAt] });
    }
  }
  for (const f of prev.favorites) {
    if (!nextFavKeys.has(`${f.carId}:${f.userId}`)) {
      stmts.push({ sql: 'DELETE FROM favorites WHERE carId = ? AND userId = ?', args: [f.carId, f.userId] });
    }
  }

  // Views
  const prevViewKeys = new Set(prev.views.map((v) => `${v.carId}:${v.userId}`));
  for (const v of next.views) {
    if (!prevViewKeys.has(`${v.carId}:${v.userId}`)) {
      stmts.push({ sql: 'INSERT OR IGNORE INTO views (carId, userId, createdAt) VALUES (?, ?, ?)', args: [v.carId, v.userId, v.createdAt] });
    }
  }

  // Follows
  const prevFollowKeys = new Set(prev.follows.map((f) => `${f.followerId}:${f.followingId}`));
  const nextFollowKeys = new Set(next.follows.map((f) => `${f.followerId}:${f.followingId}`));
  for (const f of next.follows) {
    if (!prevFollowKeys.has(`${f.followerId}:${f.followingId}`)) {
      stmts.push({ sql: 'INSERT OR IGNORE INTO follows (followerId, followingId, createdAt) VALUES (?, ?, ?)', args: [f.followerId, f.followingId, f.createdAt] });
    }
  }
  for (const f of prev.follows) {
    if (!nextFollowKeys.has(`${f.followerId}:${f.followingId}`)) {
      stmts.push({ sql: 'DELETE FROM follows WHERE followerId = ? AND followingId = ?', args: [f.followerId, f.followingId] });
    }
  }

  // Avatars
  if (next.avatars) {
    for (const [userId, url] of Object.entries(next.avatars)) {
      if (prev.avatars?.[userId] !== url) {
        stmts.push({ sql: 'INSERT OR REPLACE INTO avatars (userId, url) VALUES (?, ?)', args: [userId, url] });
      }
    }
  }

  if (stmts.length > 0) {
    await client.batch(stmts, 'write');
  }

  return next;
}

// Прямой доступ к клиенту для avatarCache
export { client as tursoClient };
