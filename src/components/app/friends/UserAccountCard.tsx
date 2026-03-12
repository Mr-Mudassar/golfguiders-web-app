'use client';
import { Link } from '@/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { getInitials, getName } from '@/lib/utils';
import { useAppSelector } from '@/lib';
import { AccountSkeleton, FriendButton } from '@/components/app';
import type { SentFriendRequest } from '@/lib/definitions';

interface OtherUserFriendCardProps {
  user: SentFriendRequest;
}

const UserAccountCard = ({ user }: OtherUserFriendCardProps) => {
  const authUser = useAppSelector((s) => s.auth.user);
  const userId = user.to_user_id || user.userInfo?.userid;
  const isAuthUser = userId === authUser?.userid;

  if (!user) return <AccountSkeleton />;

  return (
    <div className="flex items-center gap-2 justify-between py-1.5">
      {/* User Avatar and Name */}
      <Link href={`/profile/${userId}`} className="flex items-center gap-3">
        <div className="relative size-12">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={user?.userInfo?.photo_profile || '/placeholder.svg'}
              alt={user.userInfo?.first_name}
            />
            <AvatarFallback className="text-sm">
              {getInitials(user.userInfo?.first_name, user.userInfo?.last_name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <p className="font-medium">
          {getName(user.userInfo?.first_name, user.userInfo?.last_name)}
        </p>
      </Link>
      {isAuthUser ? (
        <span />
      ) : (
        <div>
          <FriendButton userId={user.userInfo?.userid!} />
          {/* {!isMyFriend && (
          <Button
            loading={isLoading}
            disabled={isLoading || isRequested}
            variant={isRequested || pending ? "outline" : "default"}
            onClick={() => (isRequested ? handleCancelRequest(userId!, user.created!) : handleSendRequest(userId!))}
          >
            {isLoading
              ? isRequested || pending
                ? t('requested.loading')
                : t('addFriend.loading')
              : isRequested || pending
                ? t('requested.label')
                : t('addFriend.label')}
          </Button>
        )}

        {isMyFriend && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={isLoading ? "default" : "icon"} loading={isLoading} disabled={isLoading}>
                {isLoading ? t('removeFriend.btn') : <Icon name="more-horizontal" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Icon name="message" className="mr-2" />
                {t('message')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  await handleRemoveFriend(userId!, user.created!)
                }}
                disabled={isLoading}
              >
                <Icon name="user-minus" className="mr-2" />
                {isLoading ? t('removeFriend.loading') : t('removeFriend.label')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )} */}
        </div>
      )}
    </div>
  );
};

export { UserAccountCard };
