import { gql } from "@apollo/client";

export const GET_ALL_COUNTRIES = gql`
  query {
    getCountries{
      country_id
      name
      latitude
      longitude
      phonecode
    }
  }
`;

export const GET_ALL_STATE = gql`
  query ($countryId: String!) {
    getStateByCountryId(countryId: $countryId) {
      country_id
      name
      id
      country_code
      latitude
      longitude
    }
  }
`;


export const GET_ALL_CITY = gql`
  query ($stateId: String!) {
    getCityByStateId(stateId: $stateId) {
      state_id
      name
      id
      latitude
      longitude
    }
  }
`;