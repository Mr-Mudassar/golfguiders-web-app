import { gql } from '@apollo/client';

export const CreatePostMedia = gql`
  mutation CreatePostMedia($mediaInput: PostMediasInput!, $files: [Upload!]) {
    createPostMedia(createPostMediaInput: $mediaInput, medias: $files)
  }
`;
