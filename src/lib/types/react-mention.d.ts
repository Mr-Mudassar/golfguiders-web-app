declare module 'react-mentions' {
  import type * as React from 'react';

  export interface MentionData {
    id: string;
    display: string;
  }

  export interface SuggestionDataItem extends MentionData {
    avatar?: string;
    initials?: string;
    type?: string;
  }

  export interface MentionsInputStyle {
    control?: React.CSSProperties;
    highlighter?: React.CSSProperties;
    input?: React.CSSProperties;
    suggestions?: {
      list?: React.CSSProperties;
      item?: React.CSSProperties;
    };
  }

  export interface MentionProps {
    trigger: string | RegExp;
    markup?: string;
    data:
    | SuggestionDataItem[]
    | ((search: string, callback: (data: SuggestionDataItem[]) => void) => void);
    renderSuggestion?: (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focused: boolean
    ) => React.ReactNode;
    displayTransform?: (id: string, display: string) => string;
    appendSpaceOnAdd?: boolean;
    className?: string;
    style?: MentionsInputStyle;
  }

  export interface MentionsInputProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    onChange: (
      event,
      newValue: string,
      newPlainTextValue: string
    ) => void;
    children: React.ReactNode;
    className?: string;
    style?: MentionsInputStyle;
    markup?: '{@}[__display__](__id__)' | string;
    placeholder?: string;
  }

  export const MentionsInput: React.FC<MentionsInputProps>;
  export const Mention: React.FC<MentionProps>;
}

// declare module 'react-mentions' {
//   import * as React from 'react';

//   export interface SuggestionDataItem {
//     id: string | number;
//     display?: string;
//     profile?: string;
//     initial?: string;
//     type?: string;
//     [key: string]: any;
//   }

//   export interface MentionProps {
//     trigger?: string | RegExp;
//     markup?: string;
//     displayTransform?: (id: string, display: string) => string;
//     data?: SuggestionDataItem[] | ((query: string, callback: (data: SuggestionDataItem[]) => void) => void);
//     renderSuggestion?: (
//       suggestion: SuggestionDataItem,
//       search: string,
//       highlightedDisplay: React.ReactNode,
//       index: number,
//       focused: boolean
//     ) => React.ReactNode;
//     appendSpaceOnAdd?: boolean;
//     isLoading?: boolean;
//     style?: React.CSSProperties;
//     renderMention?: (
//       mention: { id: string | number; display: string },
//       search: string
//     ) => React.ReactNode;
//     className?: string;
//   }

//   export interface MentionsInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
//     value?: string;
//     onChange?: (event: { target: { value: string } }, newValue: string, newPlainTextValue: string) => void;
//     onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
//     markup?: string;
//     displayTransform?: (id: string, display: string) => string;
//     className?: string;
//     inputRef?: React.Ref<HTMLTextAreaElement>;
//     style?: {
//       control?: React.CSSProperties;
//       '&multiLine'?: {
//         control?: React.CSSProperties;
//         input?: React.CSSProperties;
//         highlighter?: React.CSSProperties;
//       };
//       suggestions?: {
//         list?: React.CSSProperties;
//         item?: React.CSSProperties & {
//           '&focused'?: React.CSSProperties;
//         };
//       };
//     };
//     rows?: number;
//     placeholder?: string;
//   }

//   export const MentionsInput: React.FC<MentionsInputProps>;
//   export const Mention: React.FC<MentionProps>;
// }
