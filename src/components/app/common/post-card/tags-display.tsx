'use client';

import React, { useState } from 'react';
import { UserRound, UsersRound } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  ScrollArea,
  Skeleton,
} from '@/components/ui';
import { getInitials, getName } from '@/lib/utils';
import { useGetUserDetails } from '@/lib/hooks/use-user/use-users-details';
import { useLazyQuery } from '@apollo/client/react';
import { GET_GROUP_MEMBER_LIST } from '@/components/app/dashboard/buddies/_query';
import { Link } from '@/i18n/routing';

interface TagsDisplayProps {
  userTags?: string[];
  groupTags?: string[];
}

interface GroupMemberResult {
  getGroupListByGroupId: {
    userInfo: {
      userid: string;
      first_name: string;
      last_name: string;
      photo_profile?: string;
    };
  }[];
}

export function TagsDisplay({ userTags, groupTags }: TagsDisplayProps) {
  const users = userTags ?? [];
  const groups = groupTags ?? [];
  const [usersOpen, setUsersOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);

  if (!users.length && !groups.length) return null;

  return (
    <>
      <div className="flex items-center gap-2 px-4 mb-2 flex-wrap">
        {users.length > 0 && (
          <button
            type="button"
            onClick={() => setUsersOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full cursor-pointer hover:bg-primary/15 transition-colors"
          >
            <UserRound className="w-3 h-3" />
            {users.length} tagged {users.length === 1 ? 'user' : 'users'}
          </button>
        )}
        {groups.length > 0 && (
          <button
            type="button"
            onClick={() => setGroupsOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full cursor-pointer hover:bg-primary/15 transition-colors"
          >
            <UsersRound className="w-3 h-3" />
            {groups.length} tagged {groups.length === 1 ? 'group' : 'groups'}
          </button>
        )}
      </div>

      {users.length > 0 && (
        <TaggedUsersDialog
          open={usersOpen}
          onOpenChange={setUsersOpen}
          userIds={users}
        />
      )}
      {groups.length > 0 && (
        <TaggedGroupsDialog
          open={groupsOpen}
          onOpenChange={setGroupsOpen}
          groupIds={groups}
        />
      )}
    </>
  );
}

/* ── Tagged Users Dialog ── */

function TaggedUsersDialog({
  open,
  onOpenChange,
  userIds,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userIds: string[];
}) {
  const { usersArray, loading } = useGetUserDetails(open ? userIds : []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tagged Users</DialogTitle>
          <DialogDescription>
            {userIds.length} {userIds.length === 1 ? 'person' : 'people'} tagged in this post.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: Math.min(userIds.length, 5) }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : usersArray.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {usersArray.map((user) => {
                const name = getName(user.first_name, user.last_name);
                return (
                  <Link
                    key={user.userid}
                    href={`/profile/${user.userid}`}
                    prefetch={false}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={user.photo_profile} alt={name} />
                      <AvatarFallback>
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {name}
                      </p>
                      {user.type && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.type.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ── Tagged Groups Dialog ── */

function TaggedGroupsDialog({
  open,
  onOpenChange,
  groupIds,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groupIds: string[];
}) {
  const [loadMembers, { data, loading }] = useLazyQuery<GroupMemberResult>(
    GET_GROUP_MEMBER_LIST,
    { fetchPolicy: 'no-cache' }
  );
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  // Fetch members for a group when dialog opens with first group
  React.useEffect(() => {
    if (open && groupIds.length > 0 && !activeGroupId) {
      const firstId = groupIds[0];
      setActiveGroupId(firstId);
      loadMembers({ variables: { group_id: firstId, page: 1 } });
    }
    if (!open) {
      setActiveGroupId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleGroupSelect = (groupId: string) => {
    setActiveGroupId(groupId);
    loadMembers({ variables: { group_id: groupId, page: 1 } });
  };

  const members = data?.getGroupListByGroupId ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tagged Groups</DialogTitle>
          <DialogDescription>
            {groupIds.length} {groupIds.length === 1 ? 'group' : 'groups'} tagged in this post.
          </DialogDescription>
        </DialogHeader>

        {/* Group selector tabs (when multiple groups) */}
        {groupIds.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {groupIds.map((gid, idx) => (
              <button
                key={gid}
                type="button"
                onClick={() => handleGroupSelect(gid)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeGroupId === gid
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                Group {idx + 1}
              </button>
            ))}
          </div>
        )}

        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {members.map((member) => {
                const u = member.userInfo;
                if (!u) return null;
                const name = getName(u.first_name, u.last_name);
                return (
                  <Link
                    key={u.userid}
                    href={`/profile/${u.userid}`}
                    prefetch={false}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10 border border-border">
                      <AvatarImage src={u.photo_profile} alt={name} />
                      <AvatarFallback>
                        {getInitials(u.first_name, u.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {name}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
