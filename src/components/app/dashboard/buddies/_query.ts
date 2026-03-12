import { gql } from '@apollo/client';


export const GET_GROUPS = gql`
    query GetGroupsByUserId($userId: String! $page: Float!) { 
        getGroupByUserId(userId: $userId, page: $page) { 
            name
            type
            created
            group_id
            description
        }
    }
`

export const GET_GROUP_MEMBER_LIST = gql`
   query GetGroupListByGroupId($group_id: String! $page: Float!) {
        getGroupListByGroupId(group_id: $group_id, page: $page) {
            userInfo {
                 userid
                 first_name
                 last_name
                 photo_profile
              }
        }   
   }
`

