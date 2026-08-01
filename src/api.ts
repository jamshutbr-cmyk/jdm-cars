import type { CarPost, FeedSort, Profile, PublicProfile, UserLeaderboardEntry } from '@/types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8787';

/**
 * Resolves how this browser identifies itself to the API.
 *
 * - Inside real Telegram: `window.Telegram.WebApp.initData` is a signed string
 *   the server verifies with the bot token (never exposed to the client).
 * - Outside Telegram (plain browser, during local development): there is no
 *   signed initData, so we fall back to a per-browser "dev identity" so you
 *   can still test uploads/likes/leaderboards before wiring up real Telegram.
 *   This path is rejected by the server unless DEV_MODE=true in its .env.
 */
function getAuthHeaders(): Record<string, string> {
  const tg = (window as any).Telegram?.WebApp;
  const initData: string | undefined = tg?.initData;

  if (initData) {
    return { Authorization: `tma ${initData}` };
  }

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('devUser');
  let devUser = fromQuery || localStorage.getItem('jdm_dev_user');
  if (!devUser) {
    devUser = `guest-${Math.random().toString(36).slice(2, 8)}`;
  }
  localStorage.setItem('jdm_dev_user', devUser);

  return { 'X-Dev-User': devUser };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Ошибка запроса (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore, keep default message
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function resolveImageUrl(imageUrl: string) {
  return `${API_BASE}${imageUrl}`;
}

export const api = {
  getFeed: (sort: FeedSort, page = 1, limit = 12) =>
    request<{ items: CarPost[]; total: number; page: number; limit: number; hasMore: boolean }>(
      `/api/feed?sort=${sort}&page=${page}&limit=${limit}`
    ),

  uploadCar: (form: FormData) =>
    request<CarPost>('/api/cars', { method: 'POST', body: form }),

  deleteCar: (id: string) => request<{ ok: true }>(`/api/cars/${id}`, { method: 'DELETE' }),

  updateCar: (id: string, data: { brand: string; model: string; year: number; category: string; caption: string }) =>
    request<CarPost>(`/api/cars/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  toggleLike: (id: string) =>
    request<{ likesCount: number; likedByMe: boolean }>(`/api/cars/${id}/like`, { method: 'POST' }),

  toggleFavorite: (id: string) =>
    request<{ favoritedByMe: boolean }>(`/api/cars/${id}/favorite`, { method: 'POST' }),

  recordView: (id: string) =>
    request<{ viewsCount: number }>(`/api/cars/${id}/view`, { method: 'POST' }),

  getLeaderboardCars: () => request<CarPost[]>('/api/leaderboard/cars'),

  getLeaderboardUsers: () => request<UserLeaderboardEntry[]>('/api/leaderboard/users'),

  getProfile: () => request<Profile>('/api/profile/me'),

  getPublicProfile: (userId: string) =>
    request<PublicProfile>(`/api/profile/${userId}`),

  followUser: (userId: string) =>
    request<{ isFollowing: boolean; followersCount: number }>(`/api/users/${userId}/follow`, { method: 'POST' }),

  unfollowUser: (userId: string) =>
    request<{ isFollowing: boolean; followersCount: number }>(`/api/users/${userId}/follow`, { method: 'DELETE' }),
};
