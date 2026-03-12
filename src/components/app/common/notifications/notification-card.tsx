import React from 'react';

import { Avatar, AvatarFallback, AvatarImage, Button, Icon } from '@/components/ui';
import { cn, getInitials, useFormattedDate } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { AccountSkeleton } from '../skeletons';

export interface NotificationMessage {
  id: string;
  name: string;
  data: {
    description?: string;
    url?: string;
    read?: boolean;
    seen?: boolean;
    created?: string;
    profilePhoto?: string;
    userName?: string;
    userId?: string;
  };
}

interface NotificationCardProps {
  message: NotificationMessage;
  onMarkAsRead?: (created: string) => void;
  currentUserId?: string;
  /** Redirect path when notification is clicked (from getNotificationRedirectPath). */
  href?: string;
  /** Called when user navigates (e.g. close dropdown). */
  onNavigate?: () => void;
  /** Called when notification is clicked (used instead of href for dialog-based actions). */
  onClick?: () => void;
}

export function NotificationCard({
  message,
  onMarkAsRead,
  currentUserId,
  href,
  onNavigate,
  onClick,
}: NotificationCardProps) {
  const formattedDate = useFormattedDate();
  if (!message) return <AccountSkeleton />;

  const { data } = message;
  const showMarkRead =
    !!currentUserId &&
    !!onMarkAsRead &&
    !!data?.created &&
    !data.read;

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (data?.created && onMarkAsRead) onMarkAsRead(data.created);
  };

  const handleClick = () => {
    if (data?.created && onMarkAsRead && !data.read) onMarkAsRead(data.created);
    onClick?.();
    onNavigate?.();
  };

  const content = (
    <>
      <div className="flex gap-2 items-center min-w-0 flex-1">
        <Avatar className="size-10 border border-border shrink-0">
          <AvatarImage src={data.profilePhoto} alt={data?.userName} />
          <AvatarFallback className="text-xl font-medium">
            {getInitials(data?.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="grid gap-1 min-w-0 flex-1">
          <p className="text-xs font-medium">{data?.description}</p>
          {!!data?.created && (
            <p className="text-[10px] text-muted-foreground">
              {formattedDate(data?.created ?? '')}
            </p>
          )}
        </div>
      </div>
      {showMarkRead && (
        <Button
          className="shrink-0"
          size="icon-sm"
          variant="ghost"
          onClick={handleMarkAsRead}
          type="button"
        >
          <Icon name="mail-open" size={16} />
        </Button>
      )}
    </>
  );

  const isClickable = !!href || !!onClick;

  const wrapperClassName = cn(
    'flex gap-2 justify-between items-center py-2 pl-2 pr-2 last:mb-0 relative',
    {
      'bg-muted/70': !data.read,
      'opacity-40': data?.read,
    },
    isClickable && 'cursor-pointer hover:bg-muted/90 transition-colors'
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={wrapperClassName}
        prefetch={false}
      >
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div role="button" onClick={handleClick} className={wrapperClassName}>
        {content}
      </div>
    );
  }

  return <div className={wrapperClassName}>{content}</div>;
}
