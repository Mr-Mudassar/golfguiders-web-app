import { gql } from '@apollo/client';

export const CreatePost = gql`
  mutation ($createPost: PostInput!) {
    createPost(createPost: $createPost) {
      postid
      user_id
      geohash
      friend_id
      created
      feeling_emoji
      description
      background_color
      visibility
      latitude
      longitude
      date_from
      date_to
      has_buddy_accepted
      is_draft
      location
      modified
      golfcourse_json
      has_media
      thumbnail_preview
      shared_by_user_id
      shared_by_postid
      shared_of_user_id
      shared_at
      tee_time
      type
      like_Count
      comment_count
      share_Count
      user_favorites
      user_saves
      user_tags
      user_likes
      group_tags
      youtube_url
      youtube_channel_name
      userInfo {
        first_name
        last_name
        photo_profile
      }
      sharedOfUserInfo {
        first_name
        last_name
        photo_profile
        
      }
    }
  }
`;

export const EditPost = gql`
  mutation ($postUserTags: [String!] $postGroupTags: [String!] $postInput: UpdatePostInput!) {
    editPost(postUserTags: $postUserTags postGroupTags: $postGroupTags postInput: $postInput) {
       postid
      user_id
      geohash
      friend_id
      created
      feeling_emoji
      description
      visibility
      background_color
      latitude
      longitude
      date_from
      date_to
      has_buddy_accepted
      is_draft
      location
      modified
      golfcourse_json
      has_media
      thumbnail_preview
      shared_by_user_id
      shared_by_postid
      shared_of_user_id
      shared_at
      tee_time
      type
      like_Count
      comment_count
      share_Count
      user_favorites
      user_saves
      user_tags
      user_likes
      group_tags
      youtube_url
      youtube_channel_name
      userInfo {
        first_name
        last_name
        photo_profile
      }
      sharedOfUserInfo {
        first_name
        last_name
        photo_profile
        
      }
    }
  }
`;


// postid
// created