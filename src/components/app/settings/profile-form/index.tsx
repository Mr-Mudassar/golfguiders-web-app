'use client';

import React from 'react';
import type { Control, FieldValues, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@apollo/client/react';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  useAppDispatch,
  useAppSelector,
  useAuth,
  useFetchCountryStatesCities,
  useZodForm,
} from '@/lib';

import { ProfilePhotoField } from './profile-photo-field';
import { ProfileCoverField } from './profile-cover-field';
import type {
  UpdateUserMutationType,
  UpdateUserMutationVariablesType,
} from './_interface';
import { UpdateUser } from './_mutation';
import { useTranslations } from 'next-intl';
import { setUser } from '@/lib/redux/slices';
import { User } from '@/lib/definitions';

const profileSchema = z.object({
  first_name: z
    .string({ message: 'First name is required' })
    .min(3, {
      message: 'First name must be at least 3 characters',
    }),
  last_name: z
    .string({ message: 'Last name is required' })
    .min(3, {
      message: 'Last name must be at least 3 characters',
    }),
  bio: z
    .string({ message: 'Bio is required' })
    .max(160, {
      message: 'Bio must be 160 characters or less',
    }),
  photo_profile: z
    .string({ message: 'Profile photo is required' })
    .url({
      message: 'Profile photo must be a valid URL',
    }),
  photo_cover: z
    .string({ message: 'Cover photo is required' })
    .url({
      message: 'Cover photo must be a valid URL',
    }),
  address: z.string({ message: 'Address is required' }),
  city: z.string({ message: 'City is required' }),
  id_city: z.string().optional(),
  postalcode: z
    .number({ message: 'Postal code is required' })
    .min(10000, {
      message: 'Postal code must be at least 5 digits',
    })
    .max(99999, {
      message: 'Postal code must be at most 5 digits',
    }),
  state: z.string({ message: 'State is required' }),
  id_state: z.string().optional(),
  country: z.string({ message: 'Country is required' }),
  id_country: z.string().optional(),
});

export type ProfileFormType = z.infer<typeof profileSchema>;

const ProfileSettingsForm = () => {
  // const auth = useAppSelector((state) => state.auth);
  // const { updateUser: updateUserInStore } = useAuth();
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const t = useTranslations('profileSettings');

  const form = useZodForm({
    schema: profileSchema,
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || '',
      photo_profile: user?.photo_profile,
      photo_cover: user?.photo_cover,
      address: user?.address || '',
      city: user?.city || '',
      postalcode: user?.postalcode,
      state: user?.state || '',
      country: user?.country || '',
      id_city: user?.id_city || '',
      id_country: user?.id_country || '',
      id_state: user?.id_state || '',
    },
  });

  const { cities, countries, states } = useFetchCountryStatesCities(
    form?.getValues().id_country as string,
    form?.getValues().id_state as string
  );

  const [updateUser, updateUserState] = useMutation<
    UpdateUserMutationType,
    UpdateUserMutationVariablesType
  >(UpdateUser);

  async function onSubmit(
    values: ProfileFormType,
    e?: React.BaseSyntheticEvent
  ) {
    e?.preventDefault();

    if (
      !values.bio ||
      !values.city ||
      !values.state ||
      !values.country ||
      !values.address ||
      !values.last_name ||
      !values.postalcode ||
      !values.first_name ||
      !values.photo_cover ||
      !values.photo_profile
    ) {
      return toast.error('Please fill all the fields');
    }

    const { data } = await updateUser({
      variables: {
        userInput: {
          email: user?.email as string,
          ...values,
        },
      },
    });

    if (data) {
      toast.success('Profile updated successfully');
      console.log('updated: ', data);
      // updateUserInStore(); // remove when useAuth is updated
      dispatch(setUser({ ...(user as User), ...values }));
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FieldValues>)}>
        <ProfileCoverField />

        <ProfilePhotoField />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <FormField
            name="first_name"
            control={form.control as unknown as Control<ProfileFormType>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fName')}</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="last_name"
            control={form.control as unknown as Control<ProfileFormType>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lName')}</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control as unknown as Control<ProfileFormType>}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bio.label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('bio.description')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              {/* <FormDescription>description</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid lg:grid-cols-2 gap-x-4 gap-y-8">
          {/* Country Field */}
          <FormField
            control={form.control as unknown as Control<ProfileFormType>}
            name="country"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('country.label')}</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue(
                      'id_country',
                      countries.find((f) => f.name === val)?.country_id || ''
                    );
                    form.setValue('id_state', '');
                    form.setValue('state', '');
                    form.setValue('id_city', '');
                    form.setValue('city', '');
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder={t('country.description')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((l) => (
                      <SelectItem key={l.name} value={l.name}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State Field */}
          <FormField
            control={form.control as unknown as Control<ProfileFormType>}
            name="state"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('state.label')}</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue(
                      'id_state',
                      states.find((f) => f.name === val)?.id || ''
                    );
                    form.setValue('city', '');
                    form.setValue('id_city', '');
                  }}
                  disabled={!form.watch('country')}
                >
                  <FormControl>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder={t('state.description')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {states.map((l) => (
                      <SelectItem key={l.name} value={l.name}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City Field */}
          <FormField
            control={form.control as unknown as Control<ProfileFormType>}
            name="city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t('city.label')}</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue(
                      'id_city',
                      cities.find((f) => f.name === val)?.id || ''
                    );
                  }}
                  disabled={!form.watch('state')}
                >
                  <FormControl>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder={t('city.description')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((l) => (
                      <SelectItem key={l.name} value={l.name}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="postalcode"
            control={form.control as unknown as Control<ProfileFormType>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('postalCode.label')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('postalCode.description')}
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        field.onChange(null);
                      } else {
                        field.onChange(parseInt(value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control as unknown as Control<ProfileFormType>}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>{t('address.label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('address.description')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <Button type="submit" loading={updateUserState.loading}>
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export { ProfileSettingsForm };
