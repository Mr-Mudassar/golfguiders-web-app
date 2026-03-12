import { gql } from '@apollo/client';

export const GetStoryByDistance = gql`
  query ($page: Float! $latitude: Float! $longitude: Float!){
    getStoryByDistance (page: $page, latitude: $latitude longitude: $longitude) {
      story {
        userInfo {
          userid
          first_name
          last_name
          photo_profile
        }
        stories {
          user_id
          created
          geo_hash
          mime_type
          story_url
          story_thumbnail
          friend_id
          story_id
          likes
          views
        }
      }
      next_page
    }
  }
`;

export const DeleteStory = gql`
  mutation DeleteStory($created: String!) {
    deleteStory(created: $created)
  }
`;

export const LikeStory = gql`
  mutation LikeStory($created: String! $story_user_id: String! $reaction: String) {
    likeStory(created: $created story_user_id: $story_user_id reaction: $reaction)
  }
`;

export const ViewStory = gql`
  mutation ViewStory($created: String! $story_user_id: String!) {
    viewStory(created: $created story_user_id: $story_user_id)
  }
`;

export const SendMessage = gql`
  mutation sendMessage($messageInput: CreateMessageInput!){
    sendMessage(createMessageInput: $messageInput) {
      thread_id
      user_id
      created
      message
      is_seen
      status
      message_from
      message_to
      message_type
      media_url
      media_thumbnail_url
      media_duration
      media_mime_type
      userInfo {
        userid
        first_name
        last_name
        fcm_token
        photo_profile
        type
      }
    }
  }
`

export const GenerateSignedUrl = gql`
  mutation GenerateSignedUrl($input: GenerateSignedUrlInput!) {
    generateSignedUrl(input: $input) {
      signedUrl
      filePath
      authFileUrl
    }
  }
`;

export const CreateStory = gql`
  mutation CreateStory($latitude: Float! $longitude: Float! $trim_start: Float $trim_end: Float $url: String! $extension: String) {
    createStory(latitude: $latitude longitude: $longitude trim_start: $trim_start trim_end: $trim_end url: $url extension: $extension) {
        user_id
        created
        geo_hash
        mime_type
        story_url
        story_thumbnail
        friend_id
        story_id
        likes
        views
    }
  }
`;
