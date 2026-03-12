import React from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/components/ui';

interface DeleteStoryDialogProps {
  isDeleteStory: string;
  setIsDeleteStory: (value: React.SetStateAction<string>) => void;
  loading: boolean;
  onDelete: () => void;
}

export const DeleteStoryDialog: React.FC<DeleteStoryDialogProps> = ({
  isDeleteStory,
  setIsDeleteStory,
  loading,
  onDelete,
}) => {
  return (
    <Dialog open={!!isDeleteStory} onOpenChange={() => setIsDeleteStory('')}>
      <DialogContent 
        className="max-w-xl z-[10000]" 
        style={{ zIndex: 10000 }}
        overlayClassName="z-[10000]"
      >
        <DialogHeader>
          <DialogTitle>Delete Story</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm py-2">
          Are you sure you want to delete this story?
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={onDelete}
          >
            {loading ? 'Deleting ...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
