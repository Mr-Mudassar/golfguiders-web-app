import { useAppSelector } from '@/lib';
import { InfiniteData } from '@tanstack/react-query';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { GET_GROUPS } from '@/components/app/dashboard/buddies/_query';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { CREATE_GROUP, UPDATE_GROUP, DELETE_GROUP } from '@/components/app/dashboard/buddies/_mutation';


// Define interfaces for TypeScript
interface Group {
    group_id: string;
    name: string;
    description?: string;
    type: 'PUBLIC' | 'PRIVATE';
    created: string;
}

interface User {
    userid: string;
}

interface QueryData {
    getGroupByUserId: Group[];
}

interface InfiniteQueryResult {
    pages: Group[][];
    pageParams: number[];
}

interface CreateGroupInput {
    name: string;
    description: string;
    type: 'PUBLIC' | 'PRIVATE';
}

interface EditGroupInput {
    user_id: string;
    created: string;
    name: string;
    description: string;
    type: 'PUBLIC' | 'PRIVATE';
}

interface CreateGroupResultType {
    createGroup: Group;
}

interface UpdateGroupResultType {
    editGroup: Group;
}

interface DeleteGroupResultType {
    deleteGroup?: boolean;
}

export function useInfiniteGroups() {
    const user = useAppSelector((state) => state.auth.user);
    const queryClient = useQueryClient();
    type GroupPages = InfiniteData<Group[]>;

    // Queries
    const [allGroups, { loading: allGroupsLoading, error: allGroupsError }] =
        useLazyQuery<QueryData>(GET_GROUPS, {
            fetchPolicy: 'no-cache',
        });

    // Mutations
    const [createGroup, { loading: createGroupLoading }] =
        useMutation<CreateGroupResultType>(CREATE_GROUP);
    const [updateGroup, { loading: updateGroupLoading }] =
        useMutation<UpdateGroupResultType>(UPDATE_GROUP);
    const [deleteGroup, { loading: deleteGroupLoading }] =
        useMutation<DeleteGroupResultType>(DELETE_GROUP);

    // Infinite Query
    const infiniteQuery = useInfiniteQuery<Group[], Error, InfiniteQueryResult>({
        queryKey: ['groups', user?.userid],
        queryFn: async ({ pageParam = 1 }) => {
            if (!user?.userid) {
                throw new Error('User ID is not available');
            }

            const { data, error } = await allGroups({
                variables: {
                    userId: user.userid,
                    page: pageParam,
                },
            });

            if (error) {
                throw new Error(`Failed to fetch groups: ${error.message}`);
            }

            return data?.getGroupByUserId || [];
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!user?.userid,
    });

    // Create Group Function
    const handleCreateGroup = async (input: CreateGroupInput) => {
        try {
            const { data } = await createGroup({
                variables: {
                    CreateGroupInput: input,
                },
                update: (cache, { data: mutationData }) => {
                    if (!mutationData?.createGroup) return;

                    queryClient.setQueryData<GroupPages>(
                        ['groups', user?.userid], (oldData) => {
                            const newGroup = {
                                group_id: mutationData.createGroup.group_id,
                                name: mutationData.createGroup.name,
                                description: mutationData.createGroup.description || '',
                                type: mutationData.createGroup.type,
                                created: mutationData.createGroup.created || new Date().toISOString(),
                            };

                            if (!oldData?.pages) {
                                return { pages: [[newGroup]], pageParams: [1] };
                            }

                            return {
                                ...oldData,
                                pages: [
                                    [newGroup, ...(oldData.pages[0] || [])],
                                    ...oldData.pages.slice(1),
                                ],
                            };
                        });
                },
            });

            return { success: true, data: data?.createGroup };
        } catch (error) {
            console.error('Error creating group:', error);
            return { success: false, error };
        }
    };

    // Update Group Function
    const handleUpdateGroup = async (input: EditGroupInput) => {
        try {
            const { data } = await updateGroup({
                variables: {
                    editGroupInput: input,
                },
                update: (cache, { data: mutationData }) => {
                    if (!mutationData?.editGroup) return;

                    queryClient.setQueryData<GroupPages>(['groups', user?.userid], (oldData) => {
                        if (!oldData?.pages) return oldData;

                        const updatedGroup = {
                            group_id: mutationData.editGroup.group_id,
                            name: mutationData.editGroup.name,
                            description: mutationData.editGroup.description || '',
                            type: mutationData.editGroup.type,
                            created: mutationData.editGroup.created,
                        };

                        return {
                            ...oldData,
                            pages: oldData.pages.map((page: Group[]) =>
                                page.map((group) =>
                                    group.group_id === updatedGroup.group_id
                                        ? updatedGroup
                                        : group
                                )
                            ),
                        };
                    });
                },
            });

            return { success: true, data: data?.editGroup };
        } catch (error) {
            console.error('Error updating group:', error);
            return { success: false, error };
        }
    };

    // Delete Group Function
    const handleDeleteGroup = async (groupId: string, created: string) => {
        try {
            await deleteGroup({
                variables: {
                    groupId,
                    created,
                },
                update: () => {
                    queryClient.setQueryData<GroupPages>(['groups', user?.userid], (oldData) => {
                        if (!oldData?.pages) return oldData;

                        return {
                            ...oldData,
                            pages: oldData.pages.map((page: Group[]) =>
                                page.filter((group) => group.group_id !== groupId)
                            ),
                        };
                    });
                },
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting group:', error);
            return { success: false, error };
        }
    };

    return {
        ...infiniteQuery,
        isLoading: allGroupsLoading || infiniteQuery.isLoading,
        error: allGroupsError || infiniteQuery.error,
        createGroup: handleCreateGroup,
        updateGroup: handleUpdateGroup,
        deleteGroup: handleDeleteGroup,
        createGroupLoading,
        updateGroupLoading,
        deleteGroupLoading,
    };
}