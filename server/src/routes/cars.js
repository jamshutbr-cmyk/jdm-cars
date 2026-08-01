import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '../db.js';
import { anriCheck } from '../anri.js';
import { getAvatarUrl } from '../avatarCache.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${nanoid(12)}${ext}`);
  },
});

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error('unsupported_file_type'));
    }
    cb(null, true);
  },
});

export function carsRouter(botToken) {
  const router = Router();

  function serialize(car, db, userId) {
    const likesCount = db.likes.filter((l) => l.carId === car.id).length;
    const likedByMe = db.likes.some((l) => l.carId === car.id && l.userId === userId);
    const favoritedByMe = db.favorites.some((f) => f.carId === car.id && f.userId === userId);
    const imageFiles = car.imageFiles?.length ? car.imageFiles : [car.imageFile];
    const imageUrls = imageFiles.map((f) => `/uploads/${f}`);
    const viewsCount = (db.views || []).filter((v) => v.carId === car.id).length;
    return {
      id: car.id,
      imageUrl: imageUrls[0],
      imageUrls,
      brand: car.brand,
      model: car.model,
      year: car.year,
      category: car.category,
      caption: car.caption,
      authorId: car.authorId,
      authorName: car.authorName,
      authorUsername: car.authorUsername,
      likesCount,
      likedByMe,
      favoritedByMe,
      isMine: car.authorId === userId,
      createdAt: car.createdAt,
      viewsCount,
    };
  }

  router.get('/me/avatar', async (req, res) => {
    const url = await getAvatarUrl(req.user.id, botToken);
    res.json({ url });
  });

  router.get('/feed', async (req, res) => {
    const db = await readDb();
    const sort = req.query.sort === 'top' ? 'top' : req.query.sort === 'following' ? 'following' : 'new';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 12);
    let list = db.cars.map((c) => serialize(c, db, req.user.id));

    if (sort === 'following') {
      const followingIds = (db.follows || [])
        .filter((f) => f.followerId === req.user.id)
        .map((f) => f.followingId);
      list = list.filter((c) => followingIds.includes(c.authorId));
      list = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === 'top') {
      list = list.sort((a, b) => b.likesCount - a.likesCount || b.createdAt.localeCompare(a.createdAt));
    } else {
      list = list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    const total = list.length;
    const items = list.slice((page - 1) * limit, page * limit);
    res.json({ items, total, page, limit, hasMore: page * limit < total });
  });

  router.post('/cars', upload.array('photos', 5), async (req, res) => {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'photo_required' });
    }
    const { brand, model, year, caption, category } = req.body;
    if (!brand?.trim() || !model?.trim() || !year) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    // Модерация Анри
    const check = anriCheck({ brand, model, year, caption });
    if (!check.ok) {
      return res.status(422).json({ error: check.reason });
    }

    const car = {
      id: nanoid(14),
      imageFiles: req.files.map((f) => f.filename),
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      category: category || 'JDM Legends',
      caption: (caption || '').trim(),
      authorId: req.user.id,
      authorName: req.user.firstName,
      authorUsername: req.user.username,
      createdAt: new Date().toISOString(),
    };

    const db = await writeDb((state) => {
      state.cars.push(car);
      return state;
    });

    res.status(201).json(serialize(car, db, req.user.id));
  });

  router.delete('/cars/:id', async (req, res) => {
    const db = await readDb();
    const car = db.cars.find((c) => c.id === req.params.id);
    if (!car) return res.status(404).json({ error: 'not_found' });
    if (car.authorId !== req.user.id) return res.status(403).json({ error: 'forbidden' });

    await writeDb((state) => {
      state.cars = state.cars.filter((c) => c.id !== req.params.id);
      state.likes = state.likes.filter((l) => l.carId !== req.params.id);
      state.favorites = state.favorites.filter((f) => f.carId !== req.params.id);
      return state;
    });

    res.json({ ok: true });
  });

  router.patch('/cars/:id', async (req, res) => {
    const db = await readDb();
    const car = db.cars.find((c) => c.id === req.params.id);
    if (!car) return res.status(404).json({ error: 'not_found' });
    if (car.authorId !== req.user.id) return res.status(403).json({ error: 'forbidden' });

    const { brand, model, year, category, caption } = req.body;

    // Модерация Анри для обновлённых данных
    const check = anriCheck({
      brand: brand !== undefined ? brand : car.brand,
      model: model !== undefined ? model : car.model,
      year: year !== undefined ? year : car.year,
      caption: caption !== undefined ? caption : car.caption,
    });
    if (!check.ok) {
      return res.status(422).json({ error: check.reason });
    }

    const updatedDb = await writeDb((state) => {
      const carToUpdate = state.cars.find((c) => c.id === req.params.id);
      if (carToUpdate) {
        if (brand !== undefined) carToUpdate.brand = brand.trim();
        if (model !== undefined) carToUpdate.model = model.trim();
        if (year !== undefined) carToUpdate.year = Number(year);
        if (category !== undefined) carToUpdate.category = category;
        if (caption !== undefined) carToUpdate.caption = caption.trim();
      }
      return state;
    });

    const updatedCar = updatedDb.cars.find((c) => c.id === req.params.id);
    res.json(serialize(updatedCar, updatedDb, req.user.id));
  });

  router.post('/cars/:id/view', async (req, res) => {
    const carId = req.params.id;
    const userId = req.user.id;
    const db = await writeDb((state) => {
      if (!state.views) state.views = [];
      const alreadyViewed = state.views.some((v) => v.carId === carId && v.userId === userId);
      if (!alreadyViewed) {
        state.views.push({ carId, userId, createdAt: new Date().toISOString() });
      }
      return state;
    });
    const viewsCount = (db.views || []).filter((v) => v.carId === carId).length;
    res.json({ viewsCount });
  });

  router.post('/cars/:id/like', async (req, res) => {
    const carId = req.params.id;
    const userId = req.user.id;
    const db = await writeDb((state) => {
      const exists = state.likes.some((l) => l.carId === carId && l.userId === userId);
      if (exists) {
        state.likes = state.likes.filter((l) => !(l.carId === carId && l.userId === userId));
      } else {
        state.likes.push({ carId, userId, createdAt: new Date().toISOString() });
      }
      return state;
    });
    const likesCount = db.likes.filter((l) => l.carId === carId).length;
    const likedByMe = db.likes.some((l) => l.carId === carId && l.userId === userId);
    res.json({ likesCount, likedByMe });
  });

  router.post('/cars/:id/favorite', async (req, res) => {
    const carId = req.params.id;
    const userId = req.user.id;
    const db = await writeDb((state) => {
      const exists = state.favorites.some((f) => f.carId === carId && f.userId === userId);
      if (exists) {
        state.favorites = state.favorites.filter((f) => !(f.carId === carId && f.userId === userId));
      } else {
        state.favorites.push({ carId, userId, createdAt: new Date().toISOString() });
      }
      return state;
    });
    const favoritedByMe = db.favorites.some((f) => f.carId === carId && f.userId === userId);
    res.json({ favoritedByMe });
  });

  router.get('/leaderboard/cars', async (req, res) => {
    const db = await readDb();
    const list = db.cars
      .map((c) => serialize(c, db, req.user.id))
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, 20);
    res.json(list);
  });

  router.get('/leaderboard/users', async (req, res) => {
    const db = await readDb();
    const byUser = new Map();
    for (const car of db.cars) {
      const likesCount = db.likes.filter((l) => l.carId === car.id).length;
      const key = car.authorId;
      const entry = byUser.get(key) || {
        userId: key,
        name: car.authorName,
        username: car.authorUsername,
        totalLikes: 0,
        postsCount: 0,
        topCar: null,
        topCarLikes: -1,
      };
      entry.totalLikes += likesCount;
      entry.postsCount += 1;
      if (likesCount > entry.topCarLikes) {
        entry.topCarLikes = likesCount;
        entry.topCar = `${car.brand} ${car.model}`;
      }
      byUser.set(key, entry);
    }
    const list = [...byUser.values()]
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));
    res.json(list);
  });

  router.post('/users/:userId/follow', async (req, res) => {
    const followingId = req.params.userId;
    const followerId = req.user.id;
    if (followerId === followingId) return res.status(400).json({ error: 'cannot_follow_self' });

    const db = await writeDb((state) => {
      if (!state.follows) state.follows = [];
      const exists = state.follows.some((f) => f.followerId === followerId && f.followingId === followingId);
      if (!exists) state.follows.push({ followerId, followingId, createdAt: new Date().toISOString() });
      return state;
    });

    const followersCount = (db.follows || []).filter((f) => f.followingId === followingId).length;
    res.json({ isFollowing: true, followersCount });
  });

  router.delete('/users/:userId/follow', async (req, res) => {
    const followingId = req.params.userId;
    const followerId = req.user.id;

    const db = await writeDb((state) => {
      if (!state.follows) state.follows = [];
      state.follows = state.follows.filter(
        (f) => !(f.followerId === followerId && f.followingId === followingId),
      );
      return state;
    });

    const followersCount = (db.follows || []).filter((f) => f.followingId === followingId).length;
    res.json({ isFollowing: false, followersCount });
  });

  router.get('/profile/me', async (req, res) => {
    const db = await readDb();
    const mine = db.cars.filter((c) => c.authorId === req.user.id).map((c) => serialize(c, db, req.user.id));
    const favoriteIds = db.favorites.filter((f) => f.userId === req.user.id).map((f) => f.carId);
    const favorites = db.cars.filter((c) => favoriteIds.includes(c.id)).map((c) => serialize(c, db, req.user.id));
    const totalLikes = mine.reduce((sum, c) => sum + c.likesCount, 0);

    // Считаем место в рейтинге среди всех пользователей
    const byUser = new Map();
    for (const car of db.cars) {
      const likesCount = db.likes.filter((l) => l.carId === car.id).length;
      const entry = byUser.get(car.authorId) || { totalLikes: 0 };
      entry.totalLikes += likesCount;
      byUser.set(car.authorId, entry);
    }
    const sorted = [...byUser.entries()].sort((a, b) => b[1].totalLikes - a[1].totalLikes);
    const rankIndex = sorted.findIndex(([uid]) => uid === req.user.id);
    const leaderboardRank = rankIndex >= 0 ? rankIndex + 1 : null;
    const totalUsers = byUser.size;

    const followersCount = (db.follows || []).filter((f) => f.followingId === req.user.id).length;
    const followingCount = (db.follows || []).filter((f) => f.followerId === req.user.id).length;

    res.json({
      id: req.user.id,
      name: req.user.firstName,
      username: req.user.username,
      postsCount: mine.length,
      totalLikes,
      favoritesCount: favorites.length,
      leaderboardRank,
      totalUsers,
      followersCount,
      followingCount,
      posts: mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      favorites: favorites.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  });

  router.get('/profile/:userId', async (req, res) => {
    const db = await readDb();
    const { userId } = req.params;
    const userCars = db.cars.filter((c) => c.authorId === userId);
    if (!userCars.length) return res.status(404).json({ error: 'not_found' });

    const posts = userCars.map((c) => serialize(c, db, req.user.id));
    const totalLikes = posts.reduce((sum, c) => sum + c.likesCount, 0);
    const firstCar = userCars[0];
    const followersCount = (db.follows || []).filter((f) => f.followingId === userId).length;
    const followingCount = (db.follows || []).filter((f) => f.followerId === userId).length;
    const isFollowing = (db.follows || []).some(
      (f) => f.followerId === req.user.id && f.followingId === userId,
    );

    res.json({
      id: userId,
      name: firstCar.authorName,
      username: firstCar.authorUsername,
      postsCount: posts.length,
      totalLikes,
      followersCount,
      followingCount,
      isFollowing,
      posts: posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    });
  });

  return router;
}

export { UPLOADS_DIR };
