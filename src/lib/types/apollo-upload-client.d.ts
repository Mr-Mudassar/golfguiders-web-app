declare module 'apollo-upload-client/createUploadLink.mjs' {
  import type { ApolloLink } from '@apollo/client';
  interface CreateUploadLinkOptions {
    uri?: string;
    headers?: Record<string, string>;
    credentials?: string;
    fetch?: typeof fetch;
    fetchOptions?: RequestInit;
    formDataAppendFile?: (formData: FormData, file: File, index: number) => void;
    isExtractableFile?: (value: unknown) => boolean;
  }
  export default function createUploadLink(
    options?: CreateUploadLinkOptions
  ): ApolloLink;
}
