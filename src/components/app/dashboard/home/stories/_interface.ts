import type { UserInfo } from '@/lib/definitions';

export interface CreateStoryMutationType {
  createStory: ISubStory;
}

export interface GenerateSignedUrlMutationType {
  generateSignedUrl: {
    signedUrl: string;
    filePath: string;
    authFileUrl: string;
  };
}

export interface GenerateSignedUrlMutationVariablesType {
  input: {
    fileName: string;
    contentType: string;
  };
}

export interface CreateStoryMutationVariablesType {
  latitude: number;
  longitude: number;
  trim_start?: number;
  trim_end?: number;
  url: string;
  extension?: string;
}

export interface GetStoryByDistanceType {
  getStoryByDistance: {
    story: IStory[];
    next_page: number;
  };
}

export interface GetStoryByDistanceVariablesType {
  page: number;
  latitude: number;
  longitude: number;
}

export interface IStory {
  userInfo: {
    userid: string;
    first_name: string;
    last_name: string;
    photo_profile: string;
  };
  stories: ISubStory[];
}

export interface ISubStory {
  user_id: string;
  created: string;
  geo_hash: string;
  mime_type: string;
  story_url: string;
  story_thumbnail: string;
  friend_id: string;
  story_id: string;
  likes: string;
  views: string[];
}

export interface MessageInput {
  message: string;
  message_to: string;
  sender_thread_type: string;
  thread_type: string;
  userInfo: UserInfo;
  message_type?: string;
  media_url?: string;
  media_thumbnail_url?: string;
  media_duration?: number;
  media_mime_type?: string;
}
