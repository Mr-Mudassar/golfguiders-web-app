import {
  Dialog,
  Avatar,
  AvatarImage,
  DialogTitle,
  DialogHeader,
  DialogContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  AvatarFallback,
} from '@/components/ui';
import Link from 'next/link';
import { toast } from 'sonner';
import React, { useState } from 'react';
import type { User } from '@/lib/definitions';
import { useMutation } from '@apollo/client/react';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounceValue } from 'usehooks-ts';
import { AccountSkeleton } from '../../common';
import { ADD_GROUP_MEMBERS } from './_mutation';
import { getInitials, getName } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon, Input, Button } from '@/components/ui';
import {
  useFetchAllFriends,
  useFetchUserRecommendations,
} from '@/lib/hooks/use-user';
import { Loading } from '@/components/common';

interface AddGroupMembersResultType {
  createGroupList?: boolean;
}

interface AddGroupMembersVariablesType {
  groupId: string;
  friendIds: string[];
}

interface GroupMemeberProps {
  groupId: string;
  isOpenGroupModal: boolean;
  setIsOpenGroupModal: (open: boolean) => void;
}

function GroupMemeberModal({
  groupId,
  isOpenGroupModal,
  setIsOpenGroupModal,
}: GroupMemeberProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useDebounceValue('', 500);
  const [membersToAdd, setMembersToAdd] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('recommendations');

  const {
    mergedList: friendsList,
    infiniteQuery,
    observer,
  } = useFetchAllFriends();

  // Filtering the friends list based on the search query
  const filteredFriends = React.useMemo(() => {
    if (!search) {
      return friendsList;
    }
    return friendsList?.filter((friend) => {
      const userName =
        friend.userInfo?.first_name + ' ' + friend.userInfo?.last_name;
      return userName.toLowerCase()?.includes(search.toLowerCase());
    });
  }, [search, friendsList]);

  const { friendRecommendations, filteredFriendRecommendations } =
    useFetchUserRecommendations({ search });

  const [AddGroupMemeber, { loading: addGroupMemberLoading }] =
    useMutation<AddGroupMembersResultType, AddGroupMembersVariablesType>(
      ADD_GROUP_MEMBERS
    );

  const AddGroupMemeberFunc = () => {
    console.log('group member');
    AddGroupMemeber({
      variables: {
        groupId: groupId,
        friendIds: membersToAdd,
      },
      onCompleted: (data) => {
        if (data.createGroupList) {
          console.log(
            'Group members added successfully:',
            data.createGroupList
          );
          // Invalidate the group members cache so the list refreshes
          queryClient.invalidateQueries({
            queryKey: ['groupMembers', groupId],
          });
          toast.success('Group members added successfully');
          setMembersToAdd([]);
          setIsOpenGroupModal(false);
        }
      },
      onError: (error) => {
        console.error('Error adding group members:', error);
        toast.error('Failed to add group members');
        setIsOpenGroupModal(false);
      },
    });
  };

  return (
    <Dialog
      open={isOpenGroupModal}
      onOpenChange={(open) => {
        setIsOpenGroupModal(open);
        if (!open) {
          setSearch('');
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between mt-4">
            <DialogTitle>Add Members</DialogTitle>
            <Button
              size="sm"
              className="h-8"
              onClick={AddGroupMemeberFunc}
              disabled={!membersToAdd.length || addGroupMemberLoading}
            >
              {addGroupMemberLoading ? (
                <Loading />
              ) : (
                <>
                  <Icon name="plus" className="h-4 w-4" />
                  <span className="ml-1">Add</span>
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div>
          <Input
            placeholder="Search by name"
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <Tabs
            defaultValue="recommendations"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
            </TabsList>
            <TabsContent value="recommendations">
              {friendRecommendations.loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <AccountSkeleton key={i} />
                ))
              ) : !friendRecommendations.data?.getUserFriendRecommendation
                  .values?.length ? (
                <div className="w-full flex items-center justify-center h-60 text-sm text-gray-500">
                  No known people found
                </div>
              ) : (
                <div className="p-2">
                  <div className="h-auto max-h-72 overflow-y-auto mt-2">
                    {filteredFriendRecommendations?.map((user: User) => (
                      <div
                        key={user.userid}
                        className="flex items-center justify-between border rounded-md my-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setMembersToAdd((prev) =>
                            prev.includes(user.userid!)
                              ? prev.filter((id) => id !== user.userid)
                              : [...prev, user.userid!]
                          );
                        }}
                      >
                        <div className="flex items-center gap-2 p-2">
                          <Link
                            href={`/profile/${user?.userid}`}
                            prefetch={false}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Avatar className="border border-border">
                              <AvatarImage
                                src={user?.photo_profile}
                                alt={`${user?.first_name} ${user?.last_name}`}
                              />
                              <AvatarFallback>
                                {getInitials(user?.first_name, user?.last_name)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <Link
                            href={`/profile/${user?.userid}`}
                            prefetch={false}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getName(user?.first_name, user?.last_name)}
                          </Link>
                        </div>
                        <Checkbox
                          checked={membersToAdd.includes(user.userid!)}
                          onCheckedChange={(checked) => {
                            setMembersToAdd((prev) =>
                              checked
                                ? [...prev, user.userid!]
                                : prev.filter((id) => id !== user.userid)
                            );
                          }}
                          className="w-6 h-6 mr-2 rounded-full pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="friends">
              {infiniteQuery.isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <AccountSkeleton key={i} />
                ))
              ) : infiniteQuery.isError ? (
                <div className="w-full flex flex-col items-center justify-center h-60 gap-2">
                  <p className="text-sm text-muted-foreground">Failed to load friends</p>
                  <button
                    onClick={() => infiniteQuery.refetch()}
                    className="text-xs text-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : !filteredFriends?.length ? (
                <div className="w-full flex items-center justify-center h-60 text-sm text-gray-500">
                  No friends found
                </div>
              ) : (
                <div className="p-2">
                  <div className="h-auto max-h-72 overflow-y-auto mt-2">
                    {filteredFriends?.map((friend) => (
                      <div
                        key={friend.userInfo?.userid}
                        className="flex items-center justify-between border rounded-md my-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          const userId = friend.userInfo?.userid ?? '';
                          setMembersToAdd((prev) =>
                            prev.includes(userId)
                              ? prev.filter((id) => id !== userId)
                              : [...prev, userId]
                          );
                        }}
                      >
                        <div className="flex items-center gap-2 p-2">
                          <Link
                            href={`/profile/${friend.userInfo?.userid}`}
                            prefetch={false}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Avatar className="border border-border">
                              <AvatarImage
                                src={friend.userInfo?.photo_profile}
                                alt={
                                  friend.userInfo?.first_name +
                                  ' ' +
                                  friend.userInfo?.last_name
                                }
                              />
                              <AvatarFallback>
                                {getInitials(
                                  friend.userInfo?.first_name,
                                  friend.userInfo?.last_name
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <Link
                            href={`/profile/${friend.userInfo?.userid}`}
                            prefetch={false}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {getName(
                              friend.userInfo?.first_name,
                              friend.userInfo?.last_name
                            )}
                          </Link>
                        </div>
                        <Checkbox
                          checked={membersToAdd.includes(
                            friend.userInfo?.userid ?? ''
                          )}
                          onCheckedChange={(checked) => {
                            setMembersToAdd((prev) =>
                              checked
                                ? [...prev, friend.userInfo?.userid ?? '']
                                : prev.filter(
                                    (id) => id !== friend.userInfo?.userid
                                  )
                            );
                          }}
                          className="w-6 h-6 mr-2 rounded-full pointer-events-none"
                        />
                      </div>
                    ))}
                    <div ref={observer.ref} />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { GroupMemeberModal };
