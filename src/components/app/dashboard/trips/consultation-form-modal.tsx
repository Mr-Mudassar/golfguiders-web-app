'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
  Textarea,
  Icon,
} from '@/components/ui';
import { PhoneInput } from '@/components/form/phone-input';
import { useZodForm, useAppSelector } from '@/lib';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { CreateConsultRequest } from '@/app/[locale]/(app)/dashboard/trips/_mutation';
import type {
  CreateConsultRequestType,
  CreateConsultRequestInput,
  CompanyType,
} from '@/app/[locale]/(app)/dashboard/trips/_interface';
import { parsePhoneNumber } from 'react-phone-number-input';

const consultSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  query: z.string().min(1, 'Query is required'),
});

type ConsultFormValues = z.infer<typeof consultSchema>;

interface ConsultationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyType | null;
}

export const ConsultationFormModal: React.FC<ConsultationFormModalProps> = ({
  open,
  onOpenChange,
  company,
}) => {
  const user = useAppSelector((state) => state.auth.user);

  const [createConsultRequest, { loading }] = useMutation<
    CreateConsultRequestType,
    { input: CreateConsultRequestInput }
  >(CreateConsultRequest, {
    onCompleted: () => {
      toast.success('Consultation request submitted successfully!');
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit consultation request');
    },
  });

  const form = useZodForm({
    schema: consultSchema,
    defaultValues: {
      name:
        user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : '',
      email: user?.email || '',
      phone: '',
      query: '',
    },
  });

  React.useEffect(() => {
    if (open && user) {
      form.reset({
        name:
          user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : '',
        email: user?.email || '',
        phone: '',
        query: '',
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: ConsultFormValues) => {
    if (!company) {
      toast.error('Company information is missing');
      return;
    }

    const phoneNumber = parsePhoneNumber(data.phone);
    if (!phoneNumber) {
      toast.error('Invalid phone number');
      return;
    }

    const input: CreateConsultRequestInput = {
      company_id: company.company_id,
      company_user_id: company.user_id,
      email: data.email,
      phone: phoneNumber.nationalNumber,
      query: data.query,
      date: new Date().toISOString(),
      name: data.name,
      country_code: phoneNumber.countryCallingCode,
      country_flag: phoneNumber.country || '',
      company_created: company.created,
      company_name: company.name,
      company_address: company.company_address || '',
      company_email: company.email || '',
    };

    await createConsultRequest({ variables: { input } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Request Consultation</DialogTitle>
          <DialogDescription>
            Send your query to {company?.name || 'the company'}
          </DialogDescription>
        </DialogHeader>

        {/* Company info card */}
        {company && (
          <div className="rounded-xl border bg-muted/20 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon name="building" size={18} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold line-clamp-1">{company.name}</h4>
              {company.email && (
                <p className="text-xs text-muted-foreground truncate">{company.email}</p>
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        icon="user"
                        iconSize={16}
                        placeholder="Enter your name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        icon="mail"
                        iconSize={16}
                        placeholder="Enter your email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      defaultCountry="US"
                      placeholder="Enter your phone number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Query</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your query or question..."
                      minRows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
