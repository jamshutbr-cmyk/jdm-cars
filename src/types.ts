export type CarCategory = 'JDM Legends' | 'Drift' | 'Tuner' | 'Kei' | 'GT';

export interface CarPost {
  id: string;
  imageUrl: string;
  imageUrls: string[];
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  caption: string;
  authorId: string;
  authorName: string;
  authorUsername: string | null;
  likesCount: number;
  likedByMe: boolean;
  favoritedByMe: boolean;
  isMine: boolean;
  createdAt: string;
  viewsCount: number;
}

export interface UserLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username: string | null;
  totalLikes: number;
  postsCount: number;
  topCar: string | null;
  topCarLikes: number;
}

export interface Profile {
  id: string;
  name: string;
  username: string | null;
  postsCount: number;
  totalLikes: number;
  favoritesCount: number;
  leaderboardRank: number | null;
  totalUsers: number;
  followersCount: number;
  followingCount: number;
  posts: CarPost[];
  favorites: CarPost[];
}

export interface PublicProfile {
  id: string;
  name: string;
  username: string | null;
  postsCount: number;
  totalLikes: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  posts: CarPost[];
}

export type TabKey = 'feed' | 'leaderboard' | 'upload' | 'profile';

export type FeedSort = 'new' | 'top' | 'following';
