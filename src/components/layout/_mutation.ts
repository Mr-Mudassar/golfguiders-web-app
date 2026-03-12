import { gql } from "@apollo/client";

export const CREATE_FEEDBACK = gql`
  mutation CreateFeedback($createFeedbackInput: CreateFeedbackInput!){
    createFeedback(createFeedbackInput: $createFeedbackInput){
      platform
      created_at
      feedback_id
      user_id
      feedback_type
      subject
      feedback_text
      rating
      contact_requested
      user_email
      updated_at
      status
      admin_notes
      priority
    }
  }
`