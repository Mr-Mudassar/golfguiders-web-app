import { gql } from '@apollo/client';

export const GetPackagesByGeo = gql`
  query GetPackagesByGeo(
    $latitude: Float!
    $longitude: Float!
    $size: Float
    $searchAfter: [String!]
  ) {
    getPackagesByGeo(
      latitude: $latitude
      longitude: $longitude
      size: $size
      searchAfter: $searchAfter
    ) {
      packages {
        company_id
        created
        package_id
        cover_photo
        geo_hash
        title
        description
        departure_city
        departure_state
        departure_country
        arrival_city
        arrival_state
        arrival_country
        duration
        services
        package_for
        package_price
        lat
        long
        company_created
        company_user_id
      }
      nextSearchAfter
      total
    }
  }
`;

export const GetSingleCompanyByUser = gql`
  query GetSingleCompanyByUser($user_id: String!, $created: String!) {
    getsingleCompanyByUser(user_id: $user_id, created: $created) {
      company_id
      user_id
      created
      name
      slogan
      description
      email
      phone
      website
      photo_profile
      cover_photo
      video_url
      video_title
      video_thumbnail
      geo_hash
      company_address
      company_postal_code
      company_city
      company_state
      company_country
      mobile_country_code
      mobile_country_flag
    }
  }
`;

export const GetCompanyPackages = gql`
  query GetCompanyPackages($company_id: String!, $page: Float!) {
    getCompanyPackages(company_id: $company_id, page: $page) {
      company_id
      created
      package_id
      cover_photo
      geo_hash
      title
      description
      departure_city
      departure_state
      departure_country
      arrival_city
      arrival_state
      arrival_country
      duration
      services
      package_for
      package_price
      lat
      long
      company_created
      company_user_id
    }
  }
`;

export const GetCompanyPackage = gql`
  query GetCompanyPackage($company_id: String!, $created: DateTime!) {
    getCompanyPackage(company_id: $company_id, created: $created) {
      company_id
      created
      package_id
      cover_photo
      geo_hash
      title
      description
      departure_city
      departure_state
      departure_country
      arrival_city
      arrival_state
      arrival_country
      duration
      services
      package_for
      package_price
      lat
      long
      company_created
      company_user_id
    }
  }
`;
