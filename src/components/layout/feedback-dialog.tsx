'use client';

import { useState } from 'react';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CREATE_FEEDBACK } from './_mutation';
import { useMutation } from '@apollo/client/react';
import { useAppSelector } from '@/lib';
import { RootState } from '@/lib/redux';

const feedbackSchema = z
  .object({
    feedbackType: z.enum(['general', 'bug', 'feature', 'improvement'], {
      message: 'Please select a feedback type.',
    }),
    rating: z.number().min(1, 'Please provide a rating').max(5),
    subject: z
      .string()
      .max(100, 'Subject must be 100 characters or less')
      .optional(),
    message: z
      .string()
      .min(10, 'Message must be at least 10 characters')
      .max(1000, 'Message must be 1000 characters or less'),
    includeContact: z.boolean().default(false),
    email: z.string().email('Please enter a valid email address').optional(),
  })
  .refine(
    (data) => {
      if (data.includeContact && !data.email) {
        return false;
      }
      return true;
    },
    {
      message: 'Email is required when requesting contact',
      path: ['email'],
    }
  );

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [createFeedback] = useMutation(CREATE_FEEDBACK);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema) as Resolver<FeedbackFormValues>,
    defaultValues: {
      feedbackType: 'general',
      rating: 0,
      subject: '',
      message: '',
      includeContact: false,
      email: '',
    },
  });

  const watchMessage = form.watch('message');
  const watchSubject = form.watch('subject');

  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);

    try {
      // Generate a random UUID for user_id
      // const userId = crypto.randomUUID();

      await createFeedback({
        variables: {
          createFeedbackInput: {
            user_id: user?.userid,
            platform: 'WEB',
            feedback_type: values.feedbackType,
            subject: values.subject,
            feedback_text: values.message,
            rating: values.rating,
            contact_requested: values.includeContact,
            user_email: values.email,
          },
        },
      });

      toast('Feedback Submitted!', {
        description:
          "Thank you for your feedback. We'll review it and get back to you if needed.",
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.log(error);
      toast('Error', {
        description: 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    form.setValue('rating', rating);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-slate-100">
              <Send className="h-4 w-4 text-primary" />
            </div>
            <span>Share Your Feedback</span>
          </DialogTitle>
          <DialogDescription>
            Help us improve GolfGuiders by sharing your thoughts, suggestions,
            or reporting issues.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Feedback Type */}
            <FormField
              control={form.control}
              name="feedbackType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">
                    What type of feedback would you like to share?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <FormLabel
                          htmlFor="general"
                          className="cursor-pointer font-normal"
                        >
                          General Feedback
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bug" id="bug" />
                        <FormLabel
                          htmlFor="bug"
                          className="cursor-pointer font-normal"
                        >
                          Bug Report
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="feature" id="feature" />
                        <FormLabel
                          htmlFor="feature"
                          className="cursor-pointer font-normal"
                        >
                          Feature Request
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="improvement" id="improvement" />
                        <FormLabel
                          htmlFor="improvement"
                          className="cursor-pointer font-normal"
                        >
                          Improvement Suggestion
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium">
                    How would you rate your overall experience?
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= (hoveredRating || field.value)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                      {field.value > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                          {field.value === 1 && 'Poor'}
                          {field.value === 2 && 'Fair'}
                          {field.value === 3 && 'Good'}
                          {field.value === 4 && 'Very Good'}
                          {field.value === 5 && 'Excellent'}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Subject <span className="text-gray-500">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief summary of your feedback"
                      {...field}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchSubject?.length || 0}/100 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Your Feedback <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please share your detailed feedback, suggestions, or describe any issues you've encountered..."
                      {...field}
                      rows={5}
                      maxLength={1000}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    {watchMessage?.length || 0}/1000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="includeContact"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm cursor-pointer">
                      I&apos;d like to be contacted about this feedback
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Privacy Notice */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Privacy Notice:</strong> Your feedback helps us improve
                GolfGuiders. We may use your feedback internally for product
                development. If you&apos;ve opted to be contacted, we&apos;ll
                only use your email to follow up on this specific feedback.
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
