import { gql } from '@apollo/client';

export const GetBuddyRequestsByPost = gql`
  query GetBuddyRequestsByPost($post_user_id: String!, $postId:   String!, $page: Float!) {
    getBuddyPostRequestByUser(post_user_id: $post_user_id, postId: $postId, page: $page) {
        post_id
        created
        user_id
        post_created
        status
        userInfo {
          first_name
          last_name
          photo_profile
          userid
        }
    }
  }
`;
