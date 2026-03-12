import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Icon,
} from '@/components/ui';
import { Link } from '@/i18n/routing';
import { getInitials } from '@/lib/utils';
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Loading } from '@/components/common';

interface RequestCardProps {
  userId: string;
  name: string;
  avatar?: string;
  createdAt: string;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
  requestAccepted?: boolean;
  requestRejected?: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({
  userId,
  name,
  avatar,
  createdAt,
  onAccept,
  onReject,
  isLoading,
  requestAccepted,
  requestRejected,
}) => {
  return (
    <div className="flex items-center gap-2 justify-between py-1.5">
      <Link
        href={`/profile/${userId}`}
        prefetch={false}
        className="flex items-center gap-3"
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-sm">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loading className="w-12" />
        ) : requestAccepted ? (
          <p className="mr-3">Request accepted</p>
        ) : requestRejected ? (
          <p className="mr-3">Request removed</p>
        ) : (
          <>
            <Button variant="outline" size="icon" onClick={onReject}>
              <Icon name="bin" />
            </Button>
            <Button onClick={onAccept}>Accept</Button>
          </>
        )}
      </div>
    </div>
  );
};

export { RequestCard };
