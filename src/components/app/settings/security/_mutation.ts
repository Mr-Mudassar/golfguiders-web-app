import { gql } from '@apollo/client';

export const UpdatePasswordMutation = gql`
  mutation UpdatePasswordMutation(
    $email: String!
    $oldPassword: String!
    $newPassword: String!
  ) {
    updatePassword(
      email: $email
      oldpassword: $oldPassword
      newPassword: $newPassword
    )
  }
`;
