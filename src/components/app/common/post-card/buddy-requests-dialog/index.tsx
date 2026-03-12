import React, { useState, useEffect, useReducer } from 'react';
import { useLazyQuery, useApolloClient } from '@apollo/client/react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  ScrollArea,
  Skeleton,
  DialogTrigger,
} from '@/components/ui';
import { useAppSelector } from '@/lib';
import { getInitials, getName } from '@/lib/utils';
import { BuddyRequestStatus } from '@/lib/constants';
import { Link } from '@/i18n/routing';
import type {
  BuddyPost,
  BuddyPostRequest,
  Post,
} from '@/lib/definitions';

import type {
  GetBuddyRequestsByPostType,
  GetBuddyRequestsByPostVariablesType,
} from './_interface';
import { GetBuddyRequestsByPost } from './_query';
import {
  AcceptBuddyRequestMutation,
  RejectBuddyRequestMutation,
} from '@/lib/hooks/posts/_mutation';
import { Check, X, Users } from 'lucide-react';

interface BaseProps {
  className?: string;
  postData: Post | BuddyPost;
  postUserId: string;
}

type WithTriggerProps = BaseProps & {
  trigger: React.ReactNode;
  open?: never;
  onOpenChange?: never;
};

type WithoutTriggerProps = BaseProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: never;
};

type BuddyRequestsDialogProps = WithTriggerProps | WithoutTriggerProps;

// ── Reducer: single source of truth for the requests list ──────────────
type RequestsAction =
  | { type: 'SET'; payload: BuddyPostRequest[] }
  | { type: 'UPDATE_STATUS'; created: string; status: string }
  | { type: 'RESET' };

function requestsReducer(
  state: BuddyPostRequest[],
  action: RequestsAction,
): BuddyPostRequest[] {
  switch (action.type) {
    case 'SET':
      return action.payload;
    case 'UPDATE_STATUS':
      return state.map((r) =>
        r.created === action.created ? { ...r, status: action.status } : r,
      );
    case 'RESET':
      return [];
  }
}

const BuddyRequestsDialog: React.FC<BuddyRequestsDialogProps> = ({
  className,
  trigger,
  open,
  onOpenChange,
  postData: postDataSet,
  postUserId,
}) => {
  // Extract stable primitives from props
  const postId =
    (postDataSet as Post)?.postid ?? (postDataSet as BuddyPost)?.post_id;
  const userId = postDataSet?.user_id;
  const dateTo = postDataSet?.date_to;
  const dateFrom = postDataSet?.date_from;
  const created = postDataSet?.created;

  const auth = useAppSelector((state) => state.auth);

  // Use Apollo client directly instead of useMutation hooks.
  // This prevents the mutation from writing to Apollo's cache,
  // which would trigger re-renders in parent components that watch
  // the same query via useQuery({ fetchPolicy: 'cache-first' }).
  const client = useApolloClient();

  // ── State ──
  const [requests, dispatch] = useReducer(requestsReducer, []);
  const [loadingAction, setLoadingAction] = useState<{
    requestId: string;
    action: 'accept' | 'reject';
  } | null>(null);

  // ── Query ──
  const [loadRequests, { loading }] = useLazyQuery<
    GetBuddyRequestsByPostType,
    GetBuddyRequestsByPostVariablesType
  >(GetBuddyRequestsByPost, { fetchPolicy: 'no-cache' });

  // Stable ref so it doesn't trigger the useEffect
  const loadRequestsRef = React.useRef(loadRequests);
  loadRequestsRef.current = loadRequests;

  // Only fetch when dialog transitions closed → open
  const prevOpenRef = React.useRef(false);

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = !!open;

    if (justOpened && postId) {
      dispatch({ type: 'RESET' });
      setLoadingAction(null);

      loadRequestsRef.current({
        variables: { postId, post_user_id: userId, page: 1 },
      })
        .then((result) => {
          const items = result.data?.getBuddyPostRequestByUser;
          if (items) {
            // Shallow-clone to detach from Apollo's frozen objects
            dispatch({
              type: 'SET',
              payload: items.map((r) => ({ ...r })),
            });
          }
        })
        .catch((err) => console.error('Query error:', err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId, userId]);

  // ── Accept handler — uses client.mutate (no hooks, no cache writes) ──
  async function handleAcceptRequest(request: BuddyPostRequest) {
    const requestId = request.created ?? '';
    setLoadingAction({ requestId, action: 'accept' });

    try {
      await client.mutate({
        mutation: AcceptBuddyRequestMutation,
        variables: {
          requestInput: {
            post_id: postId,
            post_date_to: dateTo ?? '',
            post_created: created,
            buddy_req_created: request.created ?? '',
            post_date_from: dateFrom ?? '',
            pending_req_user_id: request.user_id ?? '',
          },
        },
        fetchPolicy: 'no-cache',
      });

      // Mutation succeeded — update local state immediately
      dispatch({
        type: 'UPDATE_STATUS',
        created: requestId,
        status: BuddyRequestStatus.Accepted,
      });
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setLoadingAction(null);
    }
  }

  // ── Reject handler — uses client.mutate (no hooks, no cache writes) ──
  async function handleRejectRequest(request: BuddyPostRequest) {
    const requestId = request.created ?? '';
    setLoadingAction({ requestId, action: 'reject' });

    try {
      await client.mutate({
        mutation: RejectBuddyRequestMutation,
        variables: {
          requestInput: {
            post_id: postId,
            post_date_to: dateTo ?? '',
            post_created: created,
            buddy_req_created: request.created ?? '',
            post_date_from: dateFrom ?? '',
            pending_req_user_id: request.user_id ?? '',
          },
        },
        fetchPolicy: 'no-cache',
      });

      dispatch({
        type: 'UPDATE_STATUS',
        created: requestId,
        status: BuddyRequestStatus.Rejected,
      });
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setLoadingAction(null);
    }
  }

  // ── Visibility filter (computed inline — no useMemo) ──
  // Post owner  → sees ALL requests (accepted, rejected, requested, expired)
  // Other users → sees all ACCEPTED requests + their OWN request (any status)
  const currentUserId = auth.user?.userid;
  const isPostOwner = postUserId === currentUserId;

  const visibleRequests = currentUserId
    ? requests.filter((req) => {
        if (isPostOwner) return true;

        const status = req.status?.toUpperCase();
        if (status === BuddyRequestStatus.Accepted) return true;
        if (req.user_id === currentUserId) return true;

        return false;
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>Buddy Requests</DialogTitle>
          <DialogDescription>
            All the buddy requests to join.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-64">
          {!loading && !visibleRequests.length ? (
            <div className="h-44 w-full flex flex-col items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Users className="h-7 w-7 text-muted-foreground/60" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No requests yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Buddy requests will appear here once someone asks to join.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleRequests.map((req) => {
                const status = req.status;
                const isRequested =
                  status?.toUpperCase() === BuddyRequestStatus.Requested;
                const isThisLoading =
                  loadingAction?.requestId === req.created;

                return (
                  <div
                    className="flex items-center justify-between py-2 px-3"
                    key={req.created}
                  >
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${req.userInfo?.userid}`}
                        prefetch={false}
                      >
                        <Avatar>
                          <AvatarImage
                            src={req.userInfo?.photo_profile}
                            alt={req.userInfo?.first_name}
                          />
                          <AvatarFallback>
                            {getInitials(
                              req.userInfo?.first_name,
                              req.userInfo?.last_name,
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link
                          href={`/profile/${req.userInfo?.userid}`}
                          prefetch={false}
                          className="font-medium text-lg leading-tight"
                        >
                          {getName(
                            req.userInfo?.first_name,
                            req.userInfo?.last_name,
                          )}
                        </Link>
                        <p
                          className={`text-xs ${
                            status?.toLowerCase() === 'rejected'
                              ? 'text-destructive'
                              : status?.toLowerCase() === 'accepted'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {status &&
                            status.charAt(0).toUpperCase() +
                              status.slice(1).toLowerCase()}
                        </p>
                      </div>
                    </div>

                    {/* Accept/Reject buttons — only for post owner on REQUESTED items */}
                    <div className="flex items-center gap-2">
                      {isPostOwner && isRequested && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            className="group rounded-full border-destructive/50 bg-destructive/10 hover:bg-destructive/20 transition-colors duration-200 h-10 w-10"
                            onClick={() => handleRejectRequest(req)}
                            disabled={!!loadingAction}
                            loading={
                              isThisLoading &&
                              loadingAction?.action === 'reject'
                            }
                          >
                            <X
                              className="h-4 w-4 text-destructive group-hover:scale-110 transition-transform duration-200"
                              strokeWidth={2.5}
                            />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="group rounded-full border-primary/80 bg-primary/10 hover:bg-primary/20 transition-colors duration-200 h-10 w-10"
                            onClick={() => handleAcceptRequest(req)}
                            disabled={!!loadingAction}
                            loading={
                              isThisLoading &&
                              loadingAction?.action === 'accept'
                            }
                          >
                            <Check
                              className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200"
                              strokeWidth={2.5}
                            />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-12 my-2" />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { BuddyRequestsDialog };
