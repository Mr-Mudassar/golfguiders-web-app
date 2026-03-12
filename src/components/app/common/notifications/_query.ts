import { gql } from '@apollo/client';

export const GetAllNotifications = gql`
  query GetAllNotifications($pageState: Float!) {
    getBellNotificationByUser(pageState: $pageState) {
      id
      type
      content {
        message
        created
        url
      }
      metadata {
        action_id
        action_created
      }
      sender {
        userid
        first_name
        last_name
        photo_profile
      }
      read
      seen
      __typename
    }
  }
`;

export const GetUnseenBellNotificationCount = gql`
  query GetUnseenBellNotificationCount {
    getUnSeenBellNotificationCount
  }
`;

export const UpdateBellNotificationRead = gql`
  mutation UpdateBellNotificationRead(
    $notification_user_id: String!
    $created: String!
  ) {
    updateBellNotificationRead(
      notification_user_id: $notification_user_id
      created: $created
    )
  }
`;
