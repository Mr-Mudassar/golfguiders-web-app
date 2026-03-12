'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { Share2, Users, Globe, ArrowRight, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui';

import { PostVisibility } from '@/lib/constants';

import type {
  SharePostMutationType,
  SharePostMutationVariablesType,
} from './_interface';
import { SharePost } from './_mutation';

type BaseProps = {
  readonly className?: string;
  shareUrl: string;
};

type WithFriends = {
  sharePost: true;
  postProps: SharePostMutationVariablesType;
};

type WithoutFriends = {
  sharePost?: false;
  postProps?: never;
};

type ShareDialogBase = BaseProps & (WithFriends | WithoutFriends);

type ShareDialogWithTrigger = ShareDialogBase & {
  trigger: React.ReactNode;
  open?: never;
  onOpenChange?: never;
};

type ShareDialogWithoutTrigger = ShareDialogBase & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: never;
};

type ShareDialogProps = ShareDialogWithTrigger | ShareDialogWithoutTrigger;

const ShareDialog: React.FC<ShareDialogProps> = ({
  className,
  open,
  onOpenChange,
  trigger,
  postProps,
  sharePost,
}) => {
  const [loadingVisibility, setLoadingVisibility] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [sharePostMutation, sharePostState] = useMutation<
    SharePostMutationType,
    SharePostMutationVariablesType
  >(SharePost);

  const isControlled = trigger === undefined;
  const dialogOpen = isControlled ? (open ?? false) : internalOpen;
  const handleOpenChange = isControlled
    ? (onOpenChange as ((open: boolean) => void) | undefined)
    : setInternalOpen;

  const handleSharePost = async (visibility: string) => {
    if (!postProps) return;
    setLoadingVisibility(visibility);
    try {
      const result = await sharePostMutation({
        variables: { ...postProps, visibility },
      });
      if (result.data?.sharePost) {
        toast.success('Post shared successfully');
        if (handleOpenChange) handleOpenChange(false);
      }
    } catch (error) {
      toast.error('Failed to share post');
      console.error('Share post error:', error);
    } finally {
      setLoadingVisibility(null);
    }
  };

  const shareOptions = [
    {
      visibility: PostVisibility.Circle,
      icon: Users,
      label: 'Share with Circle',
      description: 'Share with your close connections only',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      hoverBorder: 'hover:border-teal-400',
      hoverBg: 'hover:bg-teal-50/40',
    },
    {
      visibility: PostVisibility.Public,
      icon: Globe,
      label: 'Share with Network',
      description: 'Share publicly with everyone on GolfGuiders',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      hoverBorder: 'hover:border-blue-400',
      hoverBg: 'hover:bg-blue-50/40',
    },
  ];

  return (
    <Dialog onOpenChange={handleOpenChange} open={dialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={`p-0 overflow-hidden max-w-sm ${className ?? ''}`} aria-describedby={undefined}>
        {/* Header */}
        <div className="flex flex-col items-center gap-2 px-6 pt-7 pb-5 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-1">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Share Post</h2>
          <p className="text-sm text-muted-foreground leading-snug">
            Choose who you'd like to share this post with
          </p>
        </div>

        {/* Share option cards */}
        {sharePost && (
          <div className="flex flex-col gap-3 px-6 pb-6">
            {shareOptions.map(({ visibility, icon: Icon, label, description, iconBg, iconColor, hoverBorder, hoverBg }) => {
              const isLoading = loadingVisibility === visibility && sharePostState.loading;
              const isDisabled = sharePostState.loading;
              return (
                <button
                  key={visibility}
                  onClick={() => handleSharePost(visibility)}
                  disabled={isDisabled}
                  className={`group flex items-center gap-4 w-full rounded-xl border border-border bg-background px-4 py-3.5 text-left transition-all duration-150 ${hoverBorder} ${hoverBg} disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${iconBg}`}>
                    {isLoading
                      ? <Loader2 className={`w-5 h-5 animate-spin ${iconColor}`} />
                      : <Icon className={`w-5 h-5 ${iconColor}`} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ShareDialog };
