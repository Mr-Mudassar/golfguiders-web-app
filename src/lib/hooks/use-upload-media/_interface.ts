export interface CreatePostMediaMutationType {
  createPostMedia: boolean;
}

//#region Variables
export interface CreatePostMediaMutationVariablesType {
  mediaInput: {
    post_id: string;
    created: string;
  };
  files: File[];
}
