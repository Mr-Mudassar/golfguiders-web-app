import { gql } from '@apollo/client';

export const GetSentFriendRequests = gql`
  query GetSentFriendRequests($page: Float!) {
    getUserFriendReqSent(pageState: $page) {
      count
      values {
        to_user_id
        created
        status
        userInfo {
          userid
          first_name
          last_name
          photo_profile
        }
      }
      pageState
    }
  }
`;
