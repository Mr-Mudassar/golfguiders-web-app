import { MentionEditor } from './mention-editor';

interface EditorProps {
  placeholder: string;
  onChange: (value: string) => void;
  value?: string | null;
  isEdit?: boolean;
  rows?: number;
  className?: string;
}

const TextWrapper = ({
  placeholder,
  onChange,
  value,
  rows = 1,
  className,
}: EditorProps) => {
  return (
    <MentionEditor
      placeholder={placeholder}
      onChange={onChange}
      value={value ?? ''}
      rows={rows}
      className={className}
    />
  );
};

export { TextWrapper };
