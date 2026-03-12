import type { Media, User } from '@/lib/definitions';

export interface UploadMediaMutationType {
  createMedias: Media[];
}

export interface UpdateUserMutationType {
  updateUser: User;
}

//#region Variables

export interface UploadMediaMutationVariablesType {
  files: File[];
}

export interface UpdateUserMutationVariablesType {
  userInput: {
    email: string;
    first_name: string;
    last_name: string;
    bio?: string;
    photo_profile?: string;
    photo_cover?: string;
    address?: string;
    city?: string;
    postalcode?: number;
    state?: string;
    country?: string;
  };
}
