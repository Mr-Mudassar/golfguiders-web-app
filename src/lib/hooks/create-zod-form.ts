import {
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormProps,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

type FormData<Schema extends z.ZodType> = z.infer<Schema>;

/**
 * Custom hook integrating Zod schema validation with React Hook Form.
 *
 * @param props - Props for the form, excluding the resolver, and including the Zod schema.
 * @returns The useForm hook configured with Zod schema validation.
 */
function useZodForm<Schema extends z.ZodType>(
  props: Omit<UseFormProps<FormData<Schema> & FieldValues>, 'resolver'> & {
    schema: Schema;
  }
) {
  // Basic error handling for missing schema
  if (!props.schema) {
    throw new Error('Schema is required');
  }

  const options = {
    ...props,
    // Schema cast to satisfy @hookform/resolvers/zod + Zod v4 typing
    resolver: zodResolver(props.schema as never, undefined) as unknown as Resolver<
      FormData<Schema> & FieldValues,
      any
    >,
  };
  return useForm<FormData<Schema> & FieldValues>(
    options as UseFormProps<FormData<Schema> & FieldValues>
  );
}

export { useZodForm };
