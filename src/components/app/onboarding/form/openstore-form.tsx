'use client';
import type { Control, FieldValues, SubmitHandler } from 'react-hook-form';
import React from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/form';
import type { FileWithPath } from 'react-dropzone';
import Link from 'next/link';
import { parsePhoneNumber, isValidPhoneNumber } from 'react-phone-number-input';
import { getCurrentLatLng } from '@/lib/utils';

import { FileUploader } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2 } from 'lucide-react';
import { useMutation } from '@apollo/client/react';
import { CREATE_STORE_MUTATION } from './_mutation';
import { useZodForm } from '@/lib';

const openStoreSchema = z.object({
  type: z.string().min(1, 'Please select a type'),
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      'Only alphanumeric characters and spaces are allowed'
    ),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      'Only alphanumeric characters and spaces are allowed'
    ),
  store_name: z
    .string()
    .min(2, 'Store name must be at least 2 characters')
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      'Only alphanumeric characters and spaces are allowed'
    ),
  brand_name: z
    .string()
    .min(2, 'Brand name must be at least 2 characters')
    .regex(
      /^[a-zA-Z0-9\s]*$/,
      'Only alphanumeric characters and spaces are allowed'
    ),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine((val) => isValidPhoneNumber(val), {
      message: 'Please enter a valid phone number',
    }),
  company_name: z
    .string()
    .min(2, "Company's Legal name must be at least 2 characters")
    .regex(
      /^[a-zA-Z0-9\s,.-]*$/,
      'Only alphanumeric characters, spaces, commas, periods, and hyphens are allowed'
    ),
  store_url: z
    .string()
    .url({ message: 'Please enter a valid Website URL.' })
    .optional()
    .or(z.literal('')),
  shopify_url: z
    .string()
    .url({ message: 'Please enter a valid Shopify URL.' })
    .optional()
    .or(z.literal('')),
  sync: z.boolean().optional(),
  company_address: z
    .string()
    .min(5, {
      message: 'Address must be at least 5 characters.',
    })
    .max(200, {
      message: 'Address must not exceed 200 characters.',
    })
    .regex(
      /^[a-zA-Z0-9\s,.-]*$/,
      'Only alphanumeric characters, spaces, commas, periods, and hyphens are allowed'
    ),
  media: z
    .array(z.instanceof(File))
    .max(1, 'Maximum 1 file allowed')
    .optional(),
  mobile: z.string(),
  mobile_country_code: z.string(),
  mobile_country_flag: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  check: z.literal(true, {
    message: 'You must agree to the Vendor Agreement',
  }),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  zip_code: z.string(),
  address: z.string(),
});

type OpenStoreFormValues = z.infer<typeof openStoreSchema>;

function OpenStoreForm() {
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [mediaFiles, setMediaFiles] = React.useState<FileWithPath[]>([]);

  const [createStore, createStoreMutationState] = useMutation(
    CREATE_STORE_MUTATION,
    {
      onCompleted: async () => {
        console.log('Submit Successfully from mutation');
        toast.success('Store application submitted successfully!', {
          description: `Your store application is under verification.`,
        });
      },
      onError: (error) => {
        console.error(error);
        toast.error(error.message || 'Error submitting application');
        setError(error.message);
        setLoading(false);
      },
    }
  );

  const form = useZodForm<typeof openStoreSchema>({
    schema: openStoreSchema,
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      store_name: '',
      shopify_url: '',
      phone: '',
      type: 'Brand',
      brand_name: '',
      company_name: '',
      store_url: '',
      company_address: '',
      media: [],
      latitude: 37.0902,
      longitude: -95.7129,
      country: '',
      state: '',
      city: '',
      zip_code: '',
      address: '',
    },
  });

  const handlePhoneChange = React.useCallback(
    (value: string) => {
      form.setValue('phone', value);

      const num = parsePhoneNumber(value);
      if (!num) return;

      form.setValue('mobile_country_code', num?.countryCallingCode);
      form.setValue('mobile_country_flag', num?.country || 'US');
      form.setValue('mobile', num?.nationalNumber);
    },
    [form]
  );

  const handleFormSubmit = React.useCallback(
    async (
      values: z.infer<typeof openStoreSchema>,
      e?: React.BaseSyntheticEvent
    ) => {
      e?.preventDefault();
      setError(null);
      setLoading(true);
      console.log('FormValues__________', form.getValues());

      if (!isValidPhoneNumber(values.phone)) {
        form.setError('phone', { message: 'Invalid phone number' });
        setLoading(false);
        return;
      }
      const position = await getCurrentLatLng();
      // Only update location if permission was granted
      if (position) {
        form.setValue('latitude', position.lat);
        form.setValue('longitude', position.lng);
      }

      const { ...inputValues } = form.getValues(); // removed media, check

      try {
        const { error } = await createStore({
          variables: {
            input: inputValues,
            medias: mediaFiles[0],
          },
        });

        if (error) {
          toast.error('An error occurred while submitting form!');
          return;
        }

        setLoading(false);
        form.reset();
        setMediaFiles([]);
        setIsSubmitted(true);
      } catch (error) {
        setLoading(false);
        console.log(error);
        toast.error('An error occurred while submitting form!');
      }
    },
    [mediaFiles, createStore, form]
  );

  return isSubmitted ? (
    <div className="text-center">
      <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-2" />
      <h3 className="text-lg font-semibold mb-2">Success</h3>
      <p className="text-gray-600">
        Your application has been sent successfully. We will get back to you
        within 24-48 hours!
      </p>
    </div>
  ) : (
    <div>
      <h1 className="text-2xl font-bold text-center mb-1 md:text-2xl">
        Store Registration Form
      </h1>
      <Card className="bg-transparent border-none">
        <CardHeader className="text-center">
          <CardTitle className="text-[1rem] font-bold leading-6 tracking-tight md:text-1xl mb-2">
            Create your store today and start selling to golf enthusiasts
            everywhere!
          </CardTitle>
          <CardDescription>
            Fill in your details, and we&apos;ll help set up your store!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit as SubmitHandler<FieldValues>)}
              className="space-y-6"
            >
              <div>
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select
                        onValueChange={(value: string) => field.onChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Brand">Brand</SelectItem>
                          <SelectItem value="Distributor">
                            Distributor
                          </SelectItem>
                          <SelectItem value="Vendor">Vendor</SelectItem>
                          <SelectItem value="Supplier">Supplier</SelectItem>
                          <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[0.75rem]">
                        Select the type that best describes your Business
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4 ">
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="store_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Store Name" {...field} />
                      </FormControl>
                      <FormDescription className="text-[0.75rem]">
                        The name of your store
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="brand_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Brand Name" {...field} />
                      </FormControl>
                      <FormDescription className="text-[0.75rem]">
                        The name of your brand
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="store_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="shopify_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shopify URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="sync"
                  render={({ field }) => (
                    <FormItem className="p-2 mt-1">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="rounded-none mt-1"
                          />
                        </FormControl>
                        <p className="text-[0.875rem]">Sync</p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Legal name</FormLabel>
                      <FormControl>
                        <Input placeholder="Company Legal Name" {...field} />
                      </FormControl>
                      <FormDescription className="text-[0.75rem]"></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="company_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Company address" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your current company address.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="johndoe@mail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="phone"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          international
                          defaultCountry="US"
                          onChange={handlePhoneChange}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as unknown as Control<OpenStoreFormValues>}
                name="media"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Inventory Document (if any)</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={mediaFiles}
                        onValueChange={(files) => {
                          setMediaFiles(files);
                          field.onChange(files);
                        }}
                        maxFileCount={1}
                        accept={{
                          'application/zip': ['.zip'],
                          'application/pdf': ['.pdf'],
                          'image/png': ['.png'],
                          'image/jpeg': ['.jpeg'],
                          'image/jpg': ['.jpg'],
                          'image/webp': ['.webp'],
                          'image/svg': ['.svg'],
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            ['.docx'],
                          'application/vnd.ms-excel': ['.xls'],
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                            ['.xlsx'],
                          'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                            ['.pptx'],
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-[0.75rem]">
                      Upload your business document (max file size 5 GB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control as unknown as Control<OpenStoreFormValues>}
                  name="check"
                  render={({ field }) => (
                    <FormItem className="p-2">
                      <div className="flex space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="rounded-none mt-1"
                          />
                        </FormControl>
                        <p className="text-[0.875rem]">
                          By checking the box and submitting this application,
                          you acknowledge that you have read, understand, and
                          agree to the terms and conditions of this agreement. A
                          link to the full agreement is provided for your
                          review.{' '}
                          <Link
                            href="/vendor-agreement"
                            className="text-primary"
                          >
                            Vendor Agreement
                          </Link>
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                loading={createStoreMutationState.loading || loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export { OpenStoreForm };
