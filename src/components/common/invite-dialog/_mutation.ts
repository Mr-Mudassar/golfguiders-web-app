import { gql } from '@apollo/client';

export const InviteUser = gql`
  mutation InviteUser(
    $senderFullName: String
    $email: [String!]
    $phone: [String!]
  ) {
    inviteUser(
      senderFullName: $senderFullName
      email: $email
      phone: $phone
    )
  }
`;
