import type { BuddyPost, CourseCoords, CourseScoreCard, CourseTeeDetails, IGolfCoursesEntity, Post } from '@/lib/definitions';
import type { PostInputType } from '.';

export interface CreatePostMutationType {
  createPost: Post;
}

export interface GolfCoursesByDistanceType {
  getGolfCoursesByDistance: IGolfCoursesEntity[];
}

export interface GolfCourseDetails {
  getGolfCourseCoordinates: {
    golfCourseCoordinates: CourseCoords[];
    golfCourseTeeDetails: CourseTeeDetails[];
    golfCourseScorecard: CourseScoreCard;
  };
}

export interface GolfCourseDetailsVariables {
  // getGolfCourseCoordinates: {
  id_course: string;
}

export interface GetHoleCountByCourseType {
  getHoleCountByCourse: number;
}

export interface GetHoleCountByCourseVariablesType {
  id_course: string;
}
// }

//#region Variables

export interface CreatePostMutationVariablesType {
  createPost: PostInputType;
}

export interface GolfCoursesByDistanceVariablesType {
  latitude: number;
  longitude: number;
  distance: number;
  courseName?: string;
}

export interface UpdatePostMutationVariablesType {
  postInput: PostInputType;
  postGroupTags: string[];
  postUserTags: string[];
}

export interface UpdatePostMutationType {
  postInput: Post;
  postGroupTags: string[];
  postUserTags: string[];
}

export interface EditPostResponse {
  editPost: Post;
}

export interface GetUserPostDetailType {
  getUserPostDetail: BuddyPost[];
}

export interface GetUserPostDetailVariablesType {
  userId: string;
  created: string;
}
