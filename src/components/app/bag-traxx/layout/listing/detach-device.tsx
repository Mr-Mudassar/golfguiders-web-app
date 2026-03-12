import React, { useState } from 'react';
import { useDeviceMutations } from '../../_mutations';
import { useAppSelector } from '@/lib';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { ConfirmationModal } from '@/components/common/confirmationDialog';

export const DetachDevice = ({
  deviceId,
  setActive,
  size,
  variant: v,
  icon,
  className,
  refetch,
}: {
  deviceId: string;
  setActive: (v: string | null) => void;
  refetch: () => Promise<void>;
  size?: 'sm' | 'default' | 'link' | 'lg' | 'xl' | 'icon' | 'icon-sm';
  icon?: React.ReactNode;
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}) => {
  const [confirm, setConfirm] = useState(false);
  const { unLink, status } = useDeviceMutations();
  const u = useAppSelector((s) => s.auth?.user);

  const handleDetach = async () => {
    try {
      const res = await unLink({
        variables: {
          deviceId,
          userId: u?.userid as string,
        },
      });

      if (res?.data?.detachDevice) {
        await refetch?.();
        setActive(null);
        toast(res?.data?.detachDevice?.message);
      }
    } catch {
      toast(status?.del?.err?.message);
    }
  };
  return (
    <>
      <Button
        className={className}
        size={size}
        variant={v}
        onClick={() => setConfirm(true)}
      >
        {icon}Detach Device
      </Button>
      <ConfirmationModal
        title={'Detach Device?'}
        description={
          'Are you sure you want to remove this device from your account? This action cannot be undone.'
        }
        confirmText={'Detach'}
        cancelText={'Cancel'}
        isLoading={status?.del?.load}
        variant="destructive"
        onConfirm={handleDetach}
        open={confirm}
        onOpenChange={setConfirm}
      />
    </>
  );
};
