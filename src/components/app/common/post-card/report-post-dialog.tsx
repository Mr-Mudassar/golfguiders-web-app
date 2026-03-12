'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '@/components/ui';
import { toast } from 'sonner';

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReport: (notes: string) => Promise<void>;
  isLoading?: boolean;
}

const REPORT_REASONS = [
  'Spam or Scam',
  'Harassment or Hate',
  'Violence or Threats',
  'Sexual or Inappropriate Content',
  'False Information',
] as const;

const ReportPostDialog: React.FC<ReportPostDialogProps> = ({
  open,
  onOpenChange,
  onReport,
  isLoading = false,
}) => {
  const [selectedReason, setSelectedReason] = React.useState<string>('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    try {
      await onReport(selectedReason);
      setSelectedReason('');
      onOpenChange(false);
    } catch {
      // Error handling is done in parent component
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedReason('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {REPORT_REASONS.map((reason) => (
              <div
                key={reason}
                className="flex items-center space-x-2 space-y-2"
              >
                <RadioGroupItem value={reason} id={reason} className="mt-2" />
                <Label htmlFor={reason} className="cursor-pointer font-normal">
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!selectedReason || isLoading}
          >
            Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ReportPostDialog };
