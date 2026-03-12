import type { User } from '@/lib/definitions';

export interface GetUserFriendRecommendationsQueryType {
  getUserFriendRecommendation: {
    values: User[];
    next_page: number;
  };
}

export interface GetFriendRecommendVariableType {
  latitude: number;
  longitude: number;
  distance: number;
  searchInput?: string;
  page: number;
}

export interface GetDistanceUserQueryType {
  getUserByDistance: {
    values: User[];
    next_page: number;
  }
}