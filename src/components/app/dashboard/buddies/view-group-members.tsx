'use client';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  Avatar,
  AvatarImage,
  AvatarFallback,
  ScrollArea,
} from '@/components/ui';
import { toast } from 'sonner';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui';
import { Trash2 } from 'lucide-react';
import { useInfiniteGroupMembers } from '@/lib/hooks/groups/use-infinite-group-members';
import { getInitials, getName } from '@/lib/utils';
import Link from 'next/link';
import { AccountSkeleton } from '../../common';

// Dynamic import for ConfirmationModal
const ConfirmationModal = dynamic(
  () =>
    import('@/components/common/confirmationDialog').then(
      (mod) => mod.ConfirmationModal
    ),
  { ssr: false }
);

// Define interfaces
interface GroupMember {
  userid: string;
  first_name: string;
  last_name: string;
  photo_profile?: string;
}

interface ViewGroupMemberModalProps {
  groupId: string;
  isOpenViewGroupModal: boolean;
  setIsOpenViewGroupModal: (open: boolean) => void;
}

function ViewGroupMemberModal({
  groupId,
  isOpenViewGroupModal,
  setIsOpenViewGroupModal,
}: ViewGroupMemberModalProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // Fetch group members using useInfiniteGroupMembers
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: membersLoading,
    error: membersError,
    deleteGroupMember,
    deleteGroupMemberLoading,
  } = useInfiniteGroupMembers(groupId);

  // Flatten group members from pages
  const members = data?.pages.flat() || [];

  // Handle deleting a member
  const handleDeleteMember = async (userid: string) => {
    const result = await deleteGroupMember({ groupId, friendId: userid });
    if (result.success) {
      toast.success('Member removed successfully');
      setShowDeleteConfirmation(false);
      setMemberToDelete(null);
    } else {
      console.error('Error deleting member:', result.error);
      toast.error(`Error deleting member`);
    }
  };

  return (
    <Dialog
      open={isOpenViewGroupModal}
      onOpenChange={(open) => {
        setIsOpenViewGroupModal(open);
        if (!open) {
          setShowDeleteConfirmation(false);
          setMemberToDelete(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Group Members</DialogTitle>
        </DialogHeader>

        {/* Current Group Members */}
        <ScrollArea className="max-h-96">
          {membersLoading ? (
            <div className="flex flex-col gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <AccountSkeleton key={i} />
              ))}
            </div>
          ) : membersError ? (
            <p className="text-red-500">
              Error loading members: {membersError.message}
            </p>
          ) : members.length === 0 ? (
            <p className="text-sm text-gray-500 w-full text-center py-14">
              No members found
            </p>
          ) : (
            <div className="">
              {members.map((member: GroupMember) => (
                <div
                  key={member.userid}
                  className="flex items-center justify-between border rounded-md my-2 p-2 mx-1"
                >
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${member?.userid}`} prefetch={false}>
                      <Avatar className="border border-border">
                        <AvatarImage
                          src={member?.photo_profile}
                          alt={member?.first_name + ' ' + member?.last_name}
                        />
                        <AvatarFallback>
                          {getInitials(member?.first_name, member?.last_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <Link href={`/profile/${member?.userid}`} prefetch={false}>
                      {getName(member?.first_name, member?.last_name)}
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setMemberToDelete(member.userid);
                      setShowDeleteConfirmation(true);
                    }}
                    disabled={deleteGroupMemberLoading}
                    title="Remove Member"
                    className="hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {hasNextPage && (
            <div className="w-full flex items-center justify-center mt-3">
              <Button
                variant={'outline'}
                loading={membersLoading}
                disabled={membersLoading}
                onClick={() => fetchNextPage()}
              >
                Load More Members
              </Button>
            </div>
          )}
        </ScrollArea>

        <ConfirmationModal
          title="Remove Member?"
          description="Are you sure you want to remove this member from the group? This action cannot be undone."
          confirmText="Remove"
          cancelText="Cancel"
          isLoading={deleteGroupMemberLoading}
          variant="destructive"
          onConfirm={() => handleDeleteMember(memberToDelete!)}
          open={showDeleteConfirmation}
          onOpenChange={setShowDeleteConfirmation}
        />
      </DialogContent>
    </Dialog>
  );
}

export { ViewGroupMemberModal };
