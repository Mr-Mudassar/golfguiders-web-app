'use client';

import React from 'react';
import type { Control, FieldValues, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import { PasswordInput } from '@/components/form';
import {
  Button,
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui';
import { useAppSelector, useZodForm } from '@/lib';
import { useMutation } from '@apollo/client/react';
import type {
  UpdatePasswordMutationType,
  UpdatePasswordMutationVariablesType,
} from './_interface';
import { UpdatePasswordMutation } from './_mutation';
import { toast } from 'sonner';
import { useLocale, useTranslations } from 'next-intl';

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

type UpdatePasswordFormType = z.infer<typeof updatePasswordSchema>;

const UpdatePasswordForm = () => {
  const auth = useAppSelector((state) => state.auth);
  const t = useTranslations("securitySettings");
  const locale = useLocale()

  const form = useZodForm({
    schema: updatePasswordSchema,
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const [updatePassword, updatePasswordState] = useMutation<
    UpdatePasswordMutationType,
    UpdatePasswordMutationVariablesType
  >(UpdatePasswordMutation);

  async function onSubmit(
    values: UpdatePasswordFormType,
    e?: React.BaseSyntheticEvent
  ) {
    e?.preventDefault();

    if (values.newPassword !== values.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: t('errors.confirmPass', { locale }),
      });
      return;
    }

    if (values.newPassword === values.oldPassword) {
      form.setError('newPassword', {
        type: 'manual',
        message: t('errors.newPass', { locale }),
      });
      return;
    }

    const { data } = await updatePassword({
      variables: {
        email: auth.user?.email || '',
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      },
    });

    if (data) {
      toast.success(t('success', { locale }));
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
        <FormField
          name="oldPassword"
          control={form.control as unknown as Control<UpdatePasswordFormType>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('oldPass.label', { locale })}</FormLabel>
              <PasswordInput wrapperClassName="max-w-64" {...field} />
              <FormDescription>
                {t('oldPass.description', { locale })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="newPassword"
            control={form.control as unknown as Control<UpdatePasswordFormType>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('newPass.label', { locale })}</FormLabel>
                <PasswordInput wrapperClassName="max-w-64" {...field} />
                <FormDescription>
                  {t('newPass.description', { locale })}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="confirmPassword"
            control={form.control as unknown as Control<UpdatePasswordFormType>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('confirmPass.label', { locale })}</FormLabel>
                <PasswordInput wrapperClassName="max-w-64" {...field} />
                <FormDescription>
                  {t('confirmPass.description', { locale })}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" loading={updatePasswordState.loading}>
          {t('save', { locale })}
        </Button>
      </form>
    </Form>
  );
};

export { UpdatePasswordForm };
