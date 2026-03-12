import { gql } from '@apollo/client';

export const CreateTripRequest = gql`
  mutation CreateTripRequest($input: CreateTripRequestInput!) {
    createTripRequest(input: $input)
  }
`;

export const CreateConsultRequest = gql`
  mutation CreateConsultRequest($input: CreateConsultRequestInput!) {
    createConsultRequest(input: $input)
  }
`;
