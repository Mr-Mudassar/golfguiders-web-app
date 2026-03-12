import { gql } from '@apollo/client';

export const UploadMedia = gql`
  mutation UploadMedia($files: [Upload!]!) {
    createMedias(medias: $files) {
      id
      url
      mimeType
      createdAt
      }
      }
      `;
// thumbnailUrl

export const UpdateUser = gql`
  mutation UpdateUser($userInput: CassandraUpdateUserInput!) {
    updateUser(updateUserInput: $userInput) {
      userid
    }
  }
`;
