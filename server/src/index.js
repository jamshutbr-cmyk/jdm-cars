import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createAuthMiddleware } from './telegramAuth.js';
import { carsRouter, UPLOADS_DIR } from './routes/cars.js';

const app = express();
const PORT = process.env.PORT || 8787;
const BOT_TOKEN = process.env.BOT_TOKEN;
const DEV_MODE = process.env.DEV_MODE === 'true';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

if (!BOT_TOKEN && !DEV_MODE) {
  console.warn('[jdm-cars-server] BOT_TOKEN не задан и DEV_MODE выключен — реальные запросы из Telegram будут отклоняться.');
}

app.use(cors({ origin: CLIENT_ORIGIN.split(',').map((s) => s.trim()) }));
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api', createAuthMiddleware({ botToken: BOT_TOKEN, devMode: DEV_MODE }));
app.use('/api', carsRouter(BOT_TOKEN));

// Multer / generic error handler — keeps API responses JSON instead of HTML stack traces.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'bad_request' });
});

app.listen(PORT, () => {
  console.log(`[jdm-cars-server] слушает http://localhost:${PORT} (DEV_MODE=${DEV_MODE})`);
});
