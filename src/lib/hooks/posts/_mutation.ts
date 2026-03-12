import { gql } from '@apollo/client';

export const LikePostMutation = gql`
  mutation LikePostMutation($postCreatorId: String!, $createdAt: String!) {
    likePost(postUserId: $postCreatorId, postCreated: $createdAt)
  }
`;

export const SavePostMutation = gql`
  mutation SavePostMutation($postUserId: String!, $createdAt: String!, $postId: String!) {
    userSavePost(postUserId: $postUserId, postCreated: $createdAt, post_id: $postId)
  }
`;

export const UnSavePostMutation = gql`
  mutation removeSavePost($createdAt: String!, $postId: String!) {
    removeSavePost(post_id: $postId, post_activity_created: $createdAt)
  }
`;

export const AddToFavoriteMutation = gql`
  mutation AddToFavoriteMutation($postUserId: String!, $createdAt: String!, $postId: String!) {
    userFavoritePost(postUserId: $postUserId, postCreated: $createdAt, post_id: $postId)
  }
`;

export const RemoveFromFavoriteMutation = gql`
  mutation RemoveFav($postId:String!, $createdAt: String!){
   removeFavoritePost(post_id: $postId, post_activity_created: $createdAt)
}
`

export const DeletePostMutation = gql`
  mutation DeletePostMutation(
    $postid: String!
    $geohash: String!
    $createdAt: String!
    $type: String!
    $userTags: [String!]
    $groupTags: [String!]
  ) {
    deletePost(
      postid: $postid
      geohash: $geohash
      postCreated: $createdAt
      type: $type
      userTags: $userTags
      groupTags: $groupTags
    )
  }
`;

export const JoinAsBuddyRequestMutation = gql`
  mutation JoinAsBuddyRequestMutation($requestInput: CreateBuddyPostRequestInput!) {
    createBuddyPostRequest(PostBuddyRequestInput: $requestInput) {
      created
      user_id
      status
    }
  }
`;

export const AcceptBuddyRequestMutation = gql`
  mutation AcceptBuddyRequest($requestInput: PendingRequestInput!) {
    acceptBuddyPostRequest(pendingRequestInput: $requestInput) {
      created
      user_id
      status
    }
  }
`;

export const RejectBuddyRequestMutation = gql`
  mutation RejectBuddyRequest($requestInput: PendingRequestInput!) {
    rejectBuddyPostRequest(pendingRequestInput: $requestInput) {
      created
      user_id
      status
    }
  }
`;

export const CreateCommentMutation = gql`
  mutation CreateCommentMutation(
    $postUserId: String!
    $postCreated: String!
    $commentInput: CreateCommentInput!
  ) {
    createComment(postUserId: $postUserId, postCreated: $postCreated, createCommentInput: $commentInput) {
      created
      comment_id
      comment
      parent_id
      reply_count
      user_id
      likes
    }
  }
`;

export const DeleteCommentMutation = gql`
  mutation DeleteCommentMutation($postId: String!, $createdAt: String!, $postUid: String!, $postCreated: String!, $commentId: String) {
    deleteComment(postId: $postId, CommentCreated: $createdAt, postUserId: $postUid, postCreated: $postCreated, comment_id: $commentId)
  }
`;

export const UpdateCommentMutation = gql`
  mutation UpdateCommentMutation($updateCommentInput: UpdateCommentInput!) {
    updateComment(UpdateCommentInput: $updateCommentInput) {
      created
      comment_id
      comment
      parent_id
      reply_count
      user_id
      likes
    }
  }
`;

export const LikeCommentMutation = gql`
  mutation LikeComment(
    $postId: String!
    $commentCreatedAt: String!
    $postUid: String!
    $postCreated: String!
  ) {
    likeComment(postId: $postId, commentCreated: $commentCreatedAt, post_user_id: $postUid, post_created: $postCreated)
  }
`;

export const DeletePostMedia = gql`
  mutation DeletePostMedia($postId: String! $DeletePostMediaInput: [DeletePostMediaInput!]!) {
    deletePostMedia(postId: $postId, deletePostMediaInput: $DeletePostMediaInput) {
      created
    } 
  }
`;

export const ReportContent = gql`
  mutation ReportContent($reportContentInput: ReportContentInput!) {
    reportContent(reportContentInput: $reportContentInput) {
      reported_content_id
      reported_content_created
      reporter_user_id
      reported_user_id
      content_type
      notes
      created
      report_id
      report_status
    }
  }
`;