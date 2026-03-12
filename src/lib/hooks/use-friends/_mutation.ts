import { gql } from '@apollo/client';

export const SendFriendRequest = gql`
  mutation SendFriendRequest($userId: String!) {
    sendUserFriendReq(toUserId: $userId) {
      to_user_id
      status
      created
    }
  }
`;

export const CancelFriendRequest = gql`
  mutation CancelFriendRequest($userId: String!, $createdAt: String!) {
    cancelFriendReqSent(toUserId: $userId, created: $createdAt)
  }
`;

export const AcceptFriendRequest = gql`
  mutation AcceptFriendRequest($userId: String!, $createdAt: String!) {
    acceptFriendReq(fromUserId: $userId, created: $createdAt)
  }
`;

export const RejectFriendRequest = gql`
  mutation RejectFriendRequest($userId: String!, $createdAt: String!) {
    rejectFriendReq(pendingReqUserId: $userId, created: $createdAt)
  }
`;

export const RemoveFriend = gql`
  mutation RemoveFriend($friendId: String!, $createdAt: String!) {
    removeUserFriend(friendId: $friendId, created: $createdAt) {
      friend_user_id
    }
  }
`;

export const BlockUser = gql`
 mutation BlockUser($userId: String!) {
  blockUser(user_id: $userId) {
    user_id
    block_user_id
    created
    user {
      userid
      first_name
      last_name
      fcm_token
      photo_profile
      type
      is_deleted
    }
  }
 }
`
export const UnBlockUser = gql`
 mutation UnBlockUser($userId: String!, $createdAt: String!) {
  unBlockUser(block_user_id: $userId, created: $createdAt) {
    user_id
    block_user_id
    created
    user {
      userid
      first_name
      last_name
      fcm_token
      photo_profile
      type
      is_deleted
    }
  }
 }
`