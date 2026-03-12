import { gql } from '@apollo/client';

export const SharePost = gql`
  mutation SharePost(
    $postUserId: String!
    $createdAt: String!
    $visibility: String!
    $lat: Float!
    $lng: Float!
  ) {
    sharePost(
      postUserId: $postUserId
      postCreated: $createdAt
      visibility: $visibility
      latitude: $lat
      longitude: $lng
    )
  }
`;
