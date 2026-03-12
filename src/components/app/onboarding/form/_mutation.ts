import { gql } from '@apollo/client';

export const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($input: CreateStoreRequestInput!,$medias: Upload) {
    createStoreRequest(CreateStoreRequestInput: $input, medias: $medias ) {
      first_name
      last_name
      store_name
      email
      phone
      type
      document_url
      created
      brand_name
      company_name
      store_url
      company_address
      latitude
      longitude
    }
  }
`;
