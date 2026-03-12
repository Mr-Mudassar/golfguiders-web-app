'use client';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Icon,
  Input,
  Skeleton,
} from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/lib';
import { useForm } from 'react-hook-form';
import { Loading } from '@/components/common';
import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Lock, Pencil, Trash2, Eye, UserPlus, Users } from 'lucide-react';
import { useInfiniteGroups } from '@/lib/hooks/groups/use-infinite-groups';

const ConfirmationModal = dynamic(() =>
  import('@/components/common/confirmationDialog').then(
    (mod) => mod.ConfirmationModal
  )
);

const GroupMemeberModal = dynamic(() =>
  import('./add-group-member').then((mod) => mod.GroupMemeberModal)
);

const ViewGroupMemberModal = dynamic(() =>
  import('./view-group-members').then((mod) => mod.ViewGroupMemberModal)
);

// Define interfaces for TypeScript
interface Group {
  __typename?: 'Group';
  group_id: string;
  name: string;
  description?: string;
  type: 'PUBLIC' | 'PRIVATE';
  created: string;
}

// Define the schema
const addUpdateSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  description: z.string().optional().or(z.literal('')),
  type: z.enum(['PUBLIC', 'PRIVATE']),
});

type FormValues = z.infer<typeof addUpdateSchema>;

// Color palette for group avatars based on name initial
const AVATAR_COLORS = [
  'bg-emerald-500/15 text-emerald-600',
  'bg-blue-500/15 text-blue-600',
  'bg-violet-500/15 text-violet-600',
  'bg-amber-500/15 text-amber-600',
  'bg-rose-500/15 text-rose-600',
  'bg-cyan-500/15 text-cyan-600',
  'bg-orange-500/15 text-orange-600',
  'bg-pink-500/15 text-pink-600',
];

function getAvatarColor(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

const Groups: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const [isOpenGroupModal, setIsOpenGroupModal] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [addingMemeberGroup, setAddingMemberGroup] = useState<Group | null>(
    null
  );
  const [isOpenViewGroupModal, setIsOpenViewGroupModal] =
    useState<boolean>(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState<boolean>(false);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [viewingGroupMembers, setViewingGroupMembers] = useState<Group | null>(
    null
  );

  // Use the updated hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    createGroupLoading,
    updateGroupLoading,
    deleteGroupLoading,
  } = useInfiniteGroups();
  const groups = data?.pages.flat() || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(addUpdateSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'PUBLIC',
    },
  });

  useEffect(() => {
    if (editingGroup) {
      form.reset({
        name: editingGroup.name,
        description: editingGroup.description || '',
        type: editingGroup.type,
      });
      setIsModalOpen(true);
    } else {
      form.reset({
        name: '',
        description: '',
        type: 'PUBLIC',
      });
    }
  }, [editingGroup, form]);

  const onSubmit = async (values: FormValues) => {
    if (editingGroup) {
      const result = await updateGroup({
        user_id: user?.userid ?? '',
        created: editingGroup.created,
        name: values.name,
        description: values.description ?? '',
        type: values.type,
      });
      console.log('Update result', result);
      if (result.success) {
        setEditingGroup(null);
        setIsModalOpen(false);
      } else {
        console.error('Error updating group:', result.error);
      }
    } else {
      const result = await createGroup({
        name: values.name,
        description: values.description ?? '',
        type: values.type,
      });
      console.log('Create result', result);
      if (result.success) {
        setIsModalOpen(false);
        form.reset();
      } else {
        console.error('Error creating group:', result.error);
      }
    }
  };

  const handleDelete = async (
    groupId: string | undefined,
    created: string | undefined
  ) => {
    if (!groupId || !created) return;
    const result = await deleteGroup(groupId, created);
    if (result.success) {
      setGroupToDelete(null);
      setShowDeleteConfirmationModal(false);
    } else {
      console.error('Error deleting group:', result.error);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row justify-between items-center space-y-0 px-6 pt-5 pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold tracking-tight">Your Groups</CardTitle>
          <CardDescription className="text-xs">Create and manage your golf groups</CardDescription>
        </div>
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingGroup(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 shadow-sm">
              <Icon name="plus" size={16} className="mr-1" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter group name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter group description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Visibility</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('PUBLIC')}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                              field.value === 'PUBLIC'
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                            )}
                          >
                            <Globe className={cn(
                              "h-5 w-5 transition-colors",
                              field.value === 'PUBLIC' ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className={cn(
                              "text-sm font-medium",
                              field.value === 'PUBLIC' ? "text-primary" : "text-muted-foreground"
                            )}>
                              Public
                            </span>
                            <span className="text-[10px] text-muted-foreground text-center leading-tight">
                              Anyone can find
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange('PRIVATE')}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                              field.value === 'PRIVATE'
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                            )}
                          >
                            <Lock className={cn(
                              "h-5 w-5 transition-colors",
                              field.value === 'PRIVATE' ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span className={cn(
                              "text-sm font-medium",
                              field.value === 'PRIVATE' ? "text-primary" : "text-muted-foreground"
                            )}>
                              Private
                            </span>
                            <span className="text-[10px] text-muted-foreground text-center leading-tight">
                              Invite only
                            </span>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditingGroup(null);
                      setIsModalOpen(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createGroupLoading || updateGroupLoading}
                  >
                    {(createGroupLoading || updateGroupLoading) && <Loading />}
                    {editingGroup ? 'Update Group' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 rounded-xl border border-border/40 bg-muted/20 p-4">
                <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12 gap-2 animate-in fade-in duration-300">
            <p className="text-sm text-muted-foreground italic">Failed to load groups</p>
            <p className="text-xs text-destructive">{error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {groups.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 animate-in fade-in duration-300">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Users className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-muted-foreground">No groups yet</p>
              <p className="text-xs text-muted-foreground/70">Create a group to organize your golf buddies</p>
            </div>
          </div>
        )}

        {/* Group Cards */}
        {!isLoading && groups.length > 0 && (
          <div className="flex flex-col gap-3">
            {groups.map((group: Group) => (
              <div
                key={group.group_id}
                className="group/card flex items-center gap-4 rounded-xl border border-border/40 bg-card/80 p-4 transition-all duration-200 hover:border-border hover:shadow-sm"
              >
                {/* Avatar */}
                <div className={cn(
                  "h-11 w-11 rounded-lg flex items-center justify-center shrink-0 text-base font-bold",
                  getAvatarColor(group.name)
                )}>
                  {group.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">{group.name}</h3>
                    {group.type === 'PUBLIC' ? (
                      <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {group.description || 'No description'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-70 group-hover/card:opacity-100 transition-opacity">
                  {updateGroupLoading &&
                    group.group_id === editingGroup?.group_id ? (
                    <Loading />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-muted"
                      onClick={() => setEditingGroup(group)}
                      disabled={updateGroupLoading}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {deleteGroupLoading &&
                    group.group_id === groupToDelete?.group_id ? (
                    <Loading />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setGroupToDelete(group);
                        setShowDeleteConfirmationModal(true);
                      }}
                      disabled={deleteGroupLoading}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-muted"
                    onClick={() => {
                      setViewingGroupMembers(group);
                      setIsOpenViewGroupModal(true);
                    }}
                    disabled={updateGroupLoading}
                    title="View Members"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                    onClick={() => {
                      setAddingMemberGroup(group);
                      setIsOpenGroupModal(true);
                    }}
                    disabled={updateGroupLoading}
                    title="Add Members"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasNextPage && (
          <div className="w-full flex justify-center pt-4">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isLoading}
              variant="outline"
              size="sm"
              loading={isLoading}
            >
              Load More
            </Button>
          </div>
        )}
      </CardContent>

      <ViewGroupMemberModal
        groupId={viewingGroupMembers?.group_id ?? ''}
        isOpenViewGroupModal={isOpenViewGroupModal}
        setIsOpenViewGroupModal={setIsOpenViewGroupModal}
      />

      <GroupMemeberModal
        isOpenGroupModal={isOpenGroupModal}
        groupId={addingMemeberGroup?.group_id ?? ''}
        setIsOpenGroupModal={setIsOpenGroupModal}
      />

      <ConfirmationModal
        title={'Delete Group?'}
        description={
          'Are you sure you want to delete this group? This action cannot be undone.'
        }
        confirmText={'Delete'}
        cancelText={'No'}
        isLoading={deleteGroupLoading}
        variant="destructive"
        onConfirm={() => {
          handleDelete(groupToDelete?.group_id, groupToDelete?.created);
        }}
        open={showDeleteConfirmationModal}
        onOpenChange={setShowDeleteConfirmationModal}
      />
    </Card>
  );
};

export { Groups };
