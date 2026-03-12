'use client';

import React from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  Icon,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Skeleton,
} from '@/components/ui';
import { getName } from '@/lib/utils';
import { NotificationCard, type NotificationMessage } from './notification-card';
import type {
  GetAllNotificationsType,
  GetAllNotificationsVariablesType,
  UpdateBellNotificationReadVariablesType,
} from './_interface';
import { GetAllNotifications, UpdateBellNotificationRead } from './_query';
import { useTranslations } from 'next-intl';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import type { BellNotificationStored } from '@/lib/redux/slices/notifications';
import {
  appendBellNotifications,
  markBellNotificationAsRead,
} from '@/lib/redux/slices/notifications';
import { getNotificationRedirectPath, POST_DIALOG_NOTIFICATION_TYPES } from '@/lib/constants';
import { PostDetailDialog } from './post-detail-dialog';

const PAGE_SIZE = 10;
const EMPTY_NOTIFICATIONS: BellNotificationStored[] = [];

type PropsWithTrigger = {
  trigger?: React.ReactNode;
};

function bellNotificationToMessage(n: BellNotificationStored): NotificationMessage {
  return {
    id: n.content?.created ?? n.id ?? '',
    data: {
      description: n.content?.message ?? '',
      url: n.content?.url ?? '',
      read: n.read,
      seen: n.seen,
      created: n.content?.created ?? '',
      profilePhoto: n.sender?.photo_profile ?? undefined,
      userName: getName(n.sender?.first_name, n.sender?.last_name),
      userId: n.sender?.userid,
    },
    name: n.type ?? '',
  };
}

function NotificationsDropdown({ trigger }: PropsWithTrigger) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const allBellNotificationsData = useAppSelector(
    (state) => state.notifications?.allBellNotificationsData ?? EMPTY_NOTIFICATIONS
  );
  const unreadNotificationsCount = useAppSelector(
    (state) => state.notifications?.unreadNotificationsCount ?? 0
  );
  const dispatch = useAppDispatch();

  const t = useTranslations('homePage.notification');

  const [isOpen, setIsOpen] = React.useState(false);
  const [loadMorePage, setLoadMorePage] = React.useState(2);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [postDialog, setPostDialog] = React.useState<{
    open: boolean;
    userId: string;
    created: string;
  }>({ open: false, userId: '', created: '' });

  const [fetchNotify] = useLazyQuery<
    GetAllNotificationsType,
    GetAllNotificationsVariablesType
  >(GetAllNotifications);

  const [updateRead] = useMutation<unknown, UpdateBellNotificationReadVariablesType>(
    UpdateBellNotificationRead
  );

  const messagesWithRedirect = React.useMemo(() => {
    const list = [...allBellNotificationsData];
    list.sort((a, b) => {
      const tA = a.content?.created ?? '';
      const tB = b.content?.created ?? '';
      return tB.localeCompare(tA);
    });
    return list.map((n) => {
      const isPostNotification = POST_DIALOG_NOTIFICATION_TYPES.has(n.type);
      return {
        message: bellNotificationToMessage(n),
        href: isPostNotification ? undefined : getNotificationRedirectPath(n),
        postMeta: isPostNotification
          ? { userId: n.metadata?.action_id ?? '', created: n.metadata?.action_created ?? '' }
          : undefined,
      };
    });
  }, [allBellNotificationsData]);

  const handleMarkAsRead = React.useCallback(
    async (created: string) => {
      const userId = currentUser?.userid;
      if (!userId) return;
      try {
        await updateRead({
          variables: { notification_user_id: userId, created },
        });
        dispatch(markBellNotificationAsRead({ created }));
      } catch {
        // ignore
      }
    },
    [currentUser?.userid, updateRead, dispatch]
  );

  const handleLoadMore = React.useCallback(async () => {
    if (!currentUser?.userid) return;
    setIsLoadingMore(true);
    try {
      const { data } = await fetchNotify({
        variables: { pageState: loadMorePage },
      });
      const list = data?.getBellNotificationByUser ?? [];
      if (list.length > 0) {
        dispatch(appendBellNotifications(list));
        setLoadMorePage((p) => p + 1);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentUser?.userid, fetchNotify, loadMorePage, dispatch]);

  const hasMore = allBellNotificationsData.length >= PAGE_SIZE;


  return (
    <>
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Icon name="bell" size={17} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-white text-[10px] font-semibold px-1 ring-2 ring-background">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 overflow-auto p-0"
        style={{ zIndex: 9992 }}
      >
        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="border-b px-4 py-3">
            <CardTitle className="text-base">{t('label')}</CardTitle>
            <CardDescription className="text-xs">
              {t('message', { count: unreadNotificationsCount })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto overflow-x-hidden">
              {!messagesWithRedirect.length ? (
                <div className="w-full flex flex-col items-center justify-center h-60 text-sm text-muted-foreground">
                  <Icon name="bell" size={32} className="text-muted-foreground/30 mb-3" />
                  {t('noNotification')}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messagesWithRedirect.map(({ message, href, postMeta }, i) => (
                    <NotificationCard
                      key={`${message.id ?? i}-${i}`}
                      message={message}
                      onMarkAsRead={handleMarkAsRead}
                      currentUserId={currentUser?.userid}
                      href={href}
                      onNavigate={() => setIsOpen(false)}
                      onClick={
                        postMeta
                          ? () => {
                              setPostDialog({
                                open: true,
                                userId: postMeta.userId,
                                created: postMeta.created,
                              });
                            }
                          : undefined
                      }
                    />
                  ))}

                  {isLoadingMore && (
                    <div className="p-3 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex gap-2 items-center animate-in fade-in duration-300"
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-2 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hasMore && (
                <div className="p-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    loading={isLoadingMore}
                  >
                    {isLoadingMore ? null : t('loadMore')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>

    <PostDetailDialog
      open={postDialog.open}
      onOpenChange={(open) => setPostDialog((prev) => ({ ...prev, open }))}
      userId={postDialog.userId}
      created={postDialog.created}
    />
    </>
  );
}

export default React.memo(NotificationsDropdown);
