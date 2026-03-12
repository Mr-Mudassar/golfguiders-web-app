import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Icon,
} from '@/components/ui';
import { Link } from '@/i18n/routing';
import { cn, getInitials, getName } from '@/lib/utils';
import React from 'react';
import { useAppSelector } from '@/lib';

interface AccountCardProps {
  name: string;
  avatar?: string;
  userId: string;
  onSendRequest: () => void;
  isLoading?: boolean;
  requestSent?: boolean;
  sm?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  name,
  avatar,
  userId,
  onSendRequest,
  isLoading,
  requestSent,
  sm = false,
}) => {
  const currentUserId = useAppSelector((state) => state.auth.user?.userid);
  const friendIds = useAppSelector((state) => state.user.friendIds);
  const isFriend = friendIds.includes(userId);
  const isCurrentUser = userId === currentUserId;

  return (
    <div className="flex items-center gap-2 justify-between py-1.5">
      <Link
        href={`/profile/${userId}`}
        className="flex items-center gap-3"
        prefetch
      >
        <Avatar className={cn({ 'h-10 w-10': !sm })}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-sm">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <p className={cn('font-medium text-md', sm ? 'text-sm' : '')}>
          {getName(name)}
        </p>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          className={cn(
            "w-9 h-9 p-0 rounded-full transition-all duration-300 shadow-lg shadow-primary/20",
            requestSent
              ? "bg-primary/20 text-primary cursor-default"
              : "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground hover:scale-110"
          )}
          variant="ghost"
          disabled={requestSent}
          onClick={onSendRequest}
          loading={isLoading}
          title={requestSent ? 'Request Sent' : 'Add Friend'}
        >
          {!isLoading && (
            requestSent ? (
              <Icon name="check" size={16} />
            ) : (
              <Icon name="user-plus" size={16} />
            )
          )}
        </Button>
      </div>
    </div>
  );
};

export { AccountCard };
