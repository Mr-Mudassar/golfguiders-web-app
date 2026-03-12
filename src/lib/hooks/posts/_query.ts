import { gql } from '@apollo/client';

export const GetPostMedia = gql`
  query GetPostMedia($postId: String!) {
    getPostMediaByPostId(postId: $postId) {
      post_id
      created
      json
      mime_type
      modified
      postmediaid
      thumbnail_url
      type
      url
      file_id
      thumbnail_file_id
    }
  }
`;

export const getPostByCricle = gql`
  query getPostByCricle($page: Float!) {
    getPostByCricle(page: $page) {
      values {
        postid
        title
        friend_id
        user_id
        created
        feeling_emoji
        postal_code
        type
        shared_of_user_id
        shared_by_postid
        user_likes
        user_favorites
        user_saves
        description
        user_shares
        background_color
        user_tags
        group_tags
        is_deleted
        golfcourse_json
        tee_time
        visibility
        date_from
        date_to
        has_media
        userInfo {
          first_name
          last_name
          photo_profile
          userid
        }
        sharedOfUserInfo {
          first_name
          last_name
          photo_profile
          userid
        }
      }
      pageState
    }
  }
`;

export const GetToDayBuddyPostByUser = gql`
  query getToDayBuddyPostByUser($local_date_time: String! $time_zone: String!, $page:Float!){
    getToDayBuddyPostByUser(local_date_time: $local_date_time time_zone: $time_zone page: $page){
      values {
        user_id
        created
        post_id
        date_from
        date_to
        post_user_id
        golfcourse_json
        tee_time
        userInfo {
          first_name
          last_name
          photo_profile
        }
      }
      pageState
    }
  }
`;

export const GetUpcomingBuddyPostByUser = gql`
  query getUpcomingBuddyPostByUser($local_date_time: String! $time_zone: String!, $page:Float!){
    getUpcomingBuddyPostByUser(local_date_time: $local_date_time time_zone: $time_zone page: $page){
      values {
        user_id
        created
        post_id
        date_from
        date_to
        post_user_id
        golfcourse_json
        tee_time
        userInfo {
          first_name
          last_name
          userid
          photo_profile
        }
      }
      pageState
    }
  }
`;

export const GetPostsByDistance = gql`
  query getPostsByDistance($lat:Float!, $lng:Float!, $distance: Float!, $page:Float!){
  getPostsByDistance(latitude:$lat, longitude:$lng, distance:$distance, page: $page){
    values {
      postid
      user_id
      geohash
      friend_id
      created
      feeling_emoji
      description
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
      is_deleted
      visibility
      youtube_url
      youtube_channel_name
      userInfo {
        userid
        first_name
        last_name
        photo_profile
      }
      sharedOfUserInfo {
        first_name
        last_name
        photo_profile
        
      }
      post_activity_created
    }
    pageState
  }
}
`;

export const GetPostsByUserId = gql`
  query GetPostsByUserId($userId: String!, $page: Float!) {
    getPostsByUserId(userId: $userId, page: $page) {
      values {
        postid
        title
        created
        comment_count
        feeling_emoji
        postal_code
        latitude
        longitude
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
        is_deleted
        golfcourse_json
        tee_time
        date_from
        visibility
        date_to
        has_media
        youtube_url
        thumbnail_preview
        youtube_channel_name
        userInfo {
          first_name
          last_name
          photo_profile
          userid
        }
        sharedOfUserInfo {
          first_name
          last_name
          userid
          photo_profile
        }
      }
      pageState
    }
  }
`;

export const GetPostsByType = gql`
  query GetPostsByType(
    $lat: Float!
    $lng: Float!
    $distance: Float!
    $type: String!
    $page: Float!
  ) {
    getPostsByType(
      latitude: $lat
      longitude: $lng
      distance: $distance
      type: $type
      page: $page
    ) {
      postid
      title
      created
      feeling_emoji
      postal_code
      type
      shared_of_user_id
      user_likes
      user_favorites
      user_saves
      description
      user_shares
      user_id
      background_color
      user_tags
      group_tags
      golfcourse_json
      tee_time
      date_from
      date_to
      userInfo {
        first_name
        last_name
        photo_profile
        userid
      }
    }
  }
`;

export const GetCommentsByPost = gql`
  query GetCommentsByPost($postId: String!, $page: Float!) {
    getCommentByPost(postId: $postId, page: $page) {
      created
      comment_id
      comment
      parent_id
      reply_count
      modified
      user_id
      likes
      userInfo {
        first_name
        last_name
        photo_profile
        userid
      }
    }
  }
`;

export const GetCommentReplies = gql`
  query GetCommentReplies($parentId: String!, $page: Float!) {
    getCommentByParentId(parentId: $parentId, page: $page) {
      created
      comment_id
      comment
      parent_id
      reply_count
      modified
      user_id
      likes
      userInfo {
        first_name
        last_name
        photo_profile
        userid
      }
    }
  }
`;

