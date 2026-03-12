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
  Icon,
  Skeleton,
} from '@/components/ui';
import { PhoneInput } from '@/components/form/phone-input';
import { useZodForm, useAppSelector } from '@/lib';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { CreateTripRequest } from '@/app/[locale]/(app)/dashboard/trips/_mutation';
import type {
  CreateTripRequestType,
  CreateTripRequestInput,
  PackageType,
} from '@/app/[locale]/(app)/dashboard/trips/_interface';
import { parsePhoneNumber } from 'react-phone-number-input';
import { DateTimePicker } from './date-time-picker';
import Image from 'next/image';

const bookingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  adults: z
    .number()
    .min(1, 'At least 1 adult is required')
    .int('Must be a whole number'),
  children: z.number().min(0, 'Cannot be negative').int('Must be a whole number'),
  tripDate: z.date(),
  departureTime: z.string().min(1, 'Departure time is required'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageType | null;
  onSuccess?: () => void;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  open,
  onOpenChange,
  package: pkg,
  onSuccess,
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const [summaryImgLoaded, setSummaryImgLoaded] = React.useState(false);

  const [createTripRequest, { loading }] = useMutation<
    CreateTripRequestType,
    { input: CreateTripRequestInput }
  >(CreateTripRequest, {
    onCompleted: () => {
      toast.success('Trip request submitted successfully!');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit trip request');
    },
  });

  const form = useZodForm({
    schema: bookingSchema,
    defaultValues: {
      name: user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : '',
      email: user?.email || '',
      phone: '',
      address: '',
      adults: 1,
      children: 0,
      tripDate: undefined,
      departureTime: '',
    },
  });

  React.useEffect(() => {
    if (open && user) {
      setSummaryImgLoaded(false);
      form.reset({
        name: user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : '',
        email: user?.email || '',
        phone: '',
        address: '',
        adults: 1,
        children: 0,
        tripDate: undefined,
        departureTime: '',
      });
    }
  }, [open, user, form]);

  const combineDateAndTime = (date: Date | undefined, time: string): Date | undefined => {
    if (!date || !time) return undefined;
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (!pkg) {
      toast.error('Package information is missing');
      return;
    }

    try {
      const phoneNumber = parsePhoneNumber(data.phone);
      if (!phoneNumber) {
        toast.error('Invalid phone number');
        return;
      }

      const input: CreateTripRequestInput = {
        company_onwer_user_id: pkg.company_user_id,
        company_id: pkg.company_id,
        company_created: pkg.company_created,
        package_id: pkg.package_id,
        package_name: pkg.title,
        package_created: new Date(Number(pkg.created)).toISOString(),
        departure_address: pkg.departure_city,
        arrival_address: pkg.arrival_city,
        departure_time: (() => {
          const departureDateTime = combineDateAndTime(data.tripDate, data.departureTime);
          return departureDateTime ? departureDateTime.toISOString() : '';
        })(),
        name: data.name,
        email: data.email,
        phone: phoneNumber.nationalNumber,
        address: data.address,
        status: 'PENDING',
        addults: data.adults,
        childs: data.children,
        date: data.tripDate
          ? `${data.tripDate.getFullYear()}-${String(data.tripDate.getMonth() + 1).padStart(2, '0')}-${String(data.tripDate.getDate()).padStart(2, '0')}`
          : '',
        country_code: phoneNumber.countryCallingCode,
        country_flag: phoneNumber.country || '',
      };

      await createTripRequest({
        variables: { input },
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Book Trip</DialogTitle>
          <DialogDescription>
            Fill in your details to submit a booking request
          </DialogDescription>
        </DialogHeader>

        {/* Trip summary card */}
        {pkg && (
          <div className="rounded-xl border bg-muted/20 p-3 flex items-center gap-3">
            <div className="relative h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-muted">
              {pkg.cover_photo?.[0] ? (
                <>
                  {!summaryImgLoaded && (
                    <Skeleton className="absolute inset-0" />
                  )}
                  <Image
                    src={pkg.cover_photo[0]}
                    alt={pkg.title}
                    fill
                    className={`object-cover transition-opacity ${summaryImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    sizes="96px"
                    onLoad={() => setSummaryImgLoaded(true)}
                  />
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Icon name="map" size={20} className="text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold line-clamp-1">{pkg.title}</h4>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Icon name="map-pin" size={10} className="shrink-0" />
                <span className="truncate">{pkg.departure_city}</span>
                <Icon name="chevron-right" size={10} className="shrink-0" />
                <span className="truncate">{pkg.arrival_city}</span>
              </div>
              {pkg.duration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Icon name="clock" size={10} className="shrink-0" />
                  <span>{pkg.duration}</span>
                </div>
              )}
            </div>
            {pkg.package_price > 0 && (
              <div className="text-primary font-bold text-lg shrink-0 tabular-nums">
                ${pkg.package_price.toLocaleString()}
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="overflow-y-auto max-h-[calc(90vh-18rem)] space-y-5 pr-1">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon name="user" size={12} className="text-primary" />
                  </div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Personal Information
                  </h3>
                </div>
                <div className="space-y-4 pl-8">
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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            icon="map-pin"
                            iconSize={16}
                            placeholder="Enter your address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Trip Preferences */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon name="map" size={12} className="text-primary" />
                  </div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Trip Details
                  </h3>
                </div>
                <div className="space-y-4 pl-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adults"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adults</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              icon="users"
                              iconSize={16}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              placeholder="Number of adults"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={0}
                              icon="users"
                              iconSize={16}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              placeholder="Number of children"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tripDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Trip Date</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              date={field.value}
                              onDateChange={field.onChange}
                              time={form.watch('departureTime')}
                              onTimeChange={() => { }}
                              placeholder="Pick a date"
                              mode="date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="departureTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Departure Time</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              date={form.watch('tripDate')}
                              onDateChange={() => { }}
                              time={field.value}
                              onTimeChange={field.onChange}
                              placeholder="Pick a time"
                              mode="time"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

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
                Submit Booking
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
