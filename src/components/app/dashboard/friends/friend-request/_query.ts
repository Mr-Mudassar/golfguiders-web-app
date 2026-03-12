import { gql } from '@apollo/client';

export const GetReceivedFriendRequests = gql`
  query GetReceivedFriendRequests($page: Float!) {
    getUserFriendReqReceived(pageState: $page) {
      values {
        created
        from_user_id
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
