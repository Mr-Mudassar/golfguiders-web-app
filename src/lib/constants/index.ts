import type { Locale } from '@/i18n/config';

export * from './navigation';
export * from './countries';
export * from './notifications';

export const Auth = {
  Tokens: {
    AccessToken: 'golfguiders.auth-token',
    RefreshToken: 'golfguiders.refresh-token',
    ExpirationTime: 2, // days
  },
};

export const Locales = {
  Default: {
    Locale: 'en' satisfies Locale as Locale,
  },
};

export enum AccountType {
  Golfer = 'GOLFER',
  Coach = 'COACH',
  Trainer = 'TRAINER',
  Storefund = 'STOREFUND',
}

export enum ProTournamentRounds {
  Round1 = '462',
  Round2 = '463',
  Round3 = '464',
  Round4 = '465',
}

export const PostVisibility = {
  Public: 'PUBLIC',
  Circle: 'CIRCLE',
  Private: 'PRIVATE',
} as const;

export const PostStatus = {
  Draft: 'DRAFT',
  Published: 'PUBLISHED',
} as const;

export const PostAcitivity = {
  Save: 'SAVE',
} as const;

export const PostType = {
  Friends: 'FRIENDS',
  GolfBuddy: 'GOLF_BUDDY',
  Resort: 'RESORT',
  News: 'NEWS',
  Subscription: 'SUBSCRIPTION',
  ShotShaper: 'SHOT_SHAPER',
  GolfCaddy: 'SHOT_SHAPER',
  Instructor: 'INSTRUCTOR',
} as const;

export const PerPageLimit = 10;

export const MaxPostsDistance = 510000;
export const MaxCoursesDistance = 510000;

export const ChatRoles = {
  User: 'user',
  Assistant: 'assistant',
} as const;

export const BuddyRequestStatus = {
  Requested: 'REQUESTED',
  Accepted: 'ACCEPTED',
  Rejected: 'REJECTED',
} as const;

export const MAX_TOTAL_SIZE_MB = 200;
export const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;