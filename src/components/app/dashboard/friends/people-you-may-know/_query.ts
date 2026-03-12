import { gql } from '@apollo/client';

export const GetUserFriendRecommendations = gql`
  query GetUserFriendRecommendation (
  $latitude:Float!, $longitude:Float!, $distance:Float!, $page:Float!, $searchInput: String
) {
  getUserFriendRecommendation(latitude:$latitude, longitude:$longitude, distance:$distance, page:$page, searchInput: $searchInput) {
    values {
      first_name
      last_name
      email
      userid
      postalcode
      address
      bio
      city
      photo_profile
      country
      fcm_token
      photo_cover
      type
      handicap
      status
    }
    next_page
  }
}
`;

export const GetDistanceUser = gql`
  query GetDistanceUsers (
  $latitude:Float!, $longitude:Float!, $page:Float!, $searchInput: String
) {
  getUserByDistance(latitude:$latitude, longitude:$longitude, page:$page, searchInput: $searchInput) {
    values {
      first_name
      last_name
      email
      userid
      postalcode
      address
      bio
      city
      type
      handicap
      photo_profile
      country
      fcm_token
      photo_cover
      status
    }
    next_page
  }
}
`;
