import { gql } from '@apollo/client';

export const GetUserFriendList = gql`
  query GetUserFriendList($page: Float!) {
    getUserFriendList(pageState: $page) {
      values {
        friend_user_id
        created
        userInfo {
          userid
          first_name
          last_name
          photo_profile
          type
          handicap
        }
      }
      pageState
    }
  }
`;

export const GetFriendListById = gql`
  query GetUserFriendListByFriendId($friendId: String!, $page: Float!) {
    getUserFriendListByFriendId(friendId: $friendId, pageState: $page) {
      values {
        user_id
        created
        friend_user_id
        room_id
        userInfo {
          userid
          first_name
          last_name
          photo_profile
          type
          handicap
          city
          country
        }
      }
      pageState
    }
  }
`;

export const GetBlockList = gql`
  query GetBlockList($page: Float!) {
    getBlockedListByUser(page: $page) {
      user_id
      block_user_id
      created
      userInfo: user {
        userid
        first_name
        last_name
        photo_profile
        type
        handicap
        city
        country
      }
    }
  }
`;

export const GetIsBlocked = gql`
  query GetIsBlocked($userId: String!) {
    isBlockedUser(user_id: $userId)
  }
`