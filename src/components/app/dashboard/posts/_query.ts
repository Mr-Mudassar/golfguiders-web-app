import { gql } from '@apollo/client';

export const GetSavedPosts = gql`
  query GetSavedPosts($page: Float!) {
    getSavePostByUserId(pageState: $page) {
      values {
        postid
        title
        created
        feeling_emoji
        postal_code
        type
        user_likes
        user_favorites
        user_saves
        description
        user_shares
        user_id
        shared_of_user_id
        background_color
        user_tags
        group_tags
        golfcourse_json
        tee_time
        date_from
        date_to
        has_media
        userInfo {
          first_name
          last_name
          photo_profile
          userid
        }
        post_activity_created
      }
      pageState
    }
  }
`;
