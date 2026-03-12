import type { User } from '@/lib/definitions';

export interface GetUserDetailsType {
  getUser: User[];
}

//  Variables Types

export interface GetUserDetailsVariablesType {
  userId?: string;
  email?: string;
}
