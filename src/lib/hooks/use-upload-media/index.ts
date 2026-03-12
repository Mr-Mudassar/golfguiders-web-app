import { useMutation } from '@apollo/client/react';
import type { FileWithPath } from 'react-dropzone';

import { CreatePostMedia } from './_mutation';
import type {
  CreatePostMediaMutationType,
  CreatePostMediaMutationVariablesType,
} from './_interface';

interface UploadPostMediaType {
  postId: string;
  createdAt: string;
  media: FileWithPath[];
}

export function useUploadMedia() {
  const [createPostMedia, createPostMediaState] = useMutation<
    CreatePostMediaMutationType,
    CreatePostMediaMutationVariablesType
  >(CreatePostMedia, { context: { useMultipart: true } });

  async function uploadPostMedia({ postId, media }: UploadPostMediaType) {
    try {
      if (media.length === 0) {
        return;
      }

      const filesWithoutPath = media.map(
        (f) => new File([f], f.name, { type: f.type })
      );
      const { data, error } = await createPostMedia({
        variables: {
          files: filesWithoutPath,
          mediaInput: {
            post_id: postId,
            created: new Date().toISOString(),
          },
        },
      });

      if (error) {
        throw error;
      }

      return data?.createPostMedia;
    } catch (error) {
      console.error('Error uploading images', error);
    }
  }

  return {
    uploadPostMedia,
    status: {
      uploadPostMedia: createPostMediaState,
    },
  };
}
