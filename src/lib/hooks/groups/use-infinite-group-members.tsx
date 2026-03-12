import { useState } from 'react';
import { InfiniteData } from '@tanstack/react-query';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { GET_GROUP_MEMBER_LIST } from '@/components/app/dashboard/buddies/_query';
import { DELETE_GROUP_MEMBERS } from '@/components/app/dashboard/buddies/_mutation';

// Define interfaces
interface GroupMember {
  userid: string;
  first_name: string;
  last_name: string;
  photo_profile?: string;
}

interface GroupList {
  userInfo: GroupMember;
}

interface QueryData {
  getGroupListByGroupId: GroupList[];
}

interface InfiniteQueryResult {
  pages: GroupMember[][];
  pageParams: number[];
}

interface DeleteGroupMemberInput {
  groupId: string;
  friendId: string; // Matches DELETE_GROUP_MEMBERS mutation
}

export function useInfiniteGroupMembers(groupId: string) {
  const queryClient = useQueryClient();
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const [
    getAllGroupMembers,
    { loading: getAllGroupMembersLoading, error: getAllGroupMembersError },
  ] = useLazyQuery<QueryData>(GET_GROUP_MEMBER_LIST, {
    fetchPolicy: 'no-cache',
  });

  const [deleteGroupMember, { loading: deleteGroupMemberLoading }] =
    useMutation(DELETE_GROUP_MEMBERS);

  const infiniteQuery = useInfiniteQuery<
    GroupMember[],
    Error,
    InfiniteQueryResult
  >({
    queryKey: ['groupMembers', groupId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!groupId) {
        throw new Error('Group ID is not available');
      }

      const { data, error } = await getAllGroupMembers({
        variables: {
          group_id: groupId,
          page: pageParam,
        },
      });

      if (error) {
        throw new Error(`Failed to fetch group members: ${error.message}`);
      }

      if (data?.getGroupListByGroupId) {
        const members = data.getGroupListByGroupId.map((item) => item.userInfo);
        // Assume pagination based on response length (e.g., 10 items per page)
        setHasNextPage(members.length >= 10); // Adjust based on API pagination logic
        return members;
      }

      return [];
    },
    getNextPageParam: (lastPage, allPages) => {
      return hasNextPage ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!groupId,
  });

  const handleDeleteGroupMember = async ({
    groupId,
    friendId,
  }: DeleteGroupMemberInput) => {
    try {
      await deleteGroupMember({
        variables: {
          groupId,
          friendId,
        },
        update: () => {
          queryClient.setQueryData<InfiniteData<GroupMember[]>>(
            ['groupMembers', groupId],
            (oldData) => {
              if (!oldData?.pages) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page: GroupMember[]) =>
                  page.filter((member) => member.userid !== friendId)
                ),
              };
            }
          );
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting group member:', error);
      return { success: false, error };
    }
  };

  return {
    ...infiniteQuery,
    hasNextPage,
    isLoading: getAllGroupMembersLoading || infiniteQuery.isLoading,
    error: getAllGroupMembersError || infiniteQuery.error,
    deleteGroupMember: handleDeleteGroupMember,
    deleteGroupMemberLoading,
  };
}
