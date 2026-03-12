import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($userId: String, $email: String) {
    getUser(userId: $userId, email: $email) {
      first_name
      last_name
      email
      created
      userid
      fcm_token
      postalcode
      address
      bio
      city
      country
      photo_profile
      type
      price
      price_type
      photo_cover
      state
      username
      id_country
      id_state
      id_city
      latitude
      longitude
      refresh_token
      handicap
      signin_via
      phone
      status
      hobbies
      gender
      calendly
      mobile
      mobile_country_code
      mobile_country_flag
      has_personal_info
      has_contact_info
      has_calender
      has_experience
      has_pricing
      has_profile_completed
      language
      training_type
      is_type_verified
    }
  }
`;

export const GET_ROLE = gql`
  query GetUserPermission($userId: String!){
    getUserPermission(userId: $userId){
      user_id
		  role{
        id
        name
      }
		  can
    }
  } 
`
