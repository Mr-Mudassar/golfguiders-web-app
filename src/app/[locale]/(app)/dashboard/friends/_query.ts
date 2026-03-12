import { gql } from '@apollo/client';

export const GetUserFriendsCount = gql`
  query GetUserFriendsCount($userId: String!) {
    getUserFriendsCount(userId: $userId)
  }
`;
