import { gql } from '@apollo/client';

export const CREATE_GROUP = gql`
   mutation CreateGroup($CreateGroupInput: CreateGroupInput!) {
    createGroup(CreateGroupInput: $CreateGroupInput) {
        name
        type
        created
        group_id
        description
        }
    }
`

export const DELETE_GROUP = gql`
   mutation DeleteGroup($groupId: String! $created: String!) {
    deleteGroup(groupId: $groupId created: $created)       
    }
`

export const UPDATE_GROUP = gql` 
    mutation EditGroup($editGroupInput: UpdateGroupInput!) {
    editGroup(editGroupInput: $editGroupInput) {
        name
        type
        created
        group_id
        description
   }
  }
`

export const ADD_GROUP_MEMBERS = gql`
   mutation CreateGroupList($groupId: String! $friendIds: [String!]!) {
    createGroupList(groupId: $groupId friendIds: $friendIds) 
   }
`

export const DELETE_GROUP_MEMBERS = gql`
   mutation DeleteGroupList($groupId: String! $friendId: String!) {
    deleteGroupList(groupId: $groupId friendId: $friendId) 
   }
`