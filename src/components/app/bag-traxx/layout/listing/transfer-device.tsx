import React, { useState } from 'react';
import { useDeviceMutations } from '../../_mutations';
import { useAppSelector } from '@/lib';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { ConfirmationModal } from '@/components/common/confirmationDialog';
import { UserListDialog } from '@/components/app/common/user-list';

export const TransferDeviceBtn = ({
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
  const [openList, setOpenList] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [friend, setFriend] = useState<{ uId: string; name: string }>();
  const { transfer, status } = useDeviceMutations();
  const u = useAppSelector((s) => s.auth?.user);

  const handleTransfer = async () => {
    console.log('fffff', friend);

    try {
      const res = await transfer({
        variables: {
          deviceId,
          userId: u?.userid as string,
          friendId: friend?.uId as string,
        },
      });

      if (res?.data?.transferDevice) {
        await refetch?.();
        setActive(null);
        toast(res?.data?.transferDevice?.message);
      }
    } catch {
      toast(status?.send?.err?.message);
    }
  };
  return (
    <>
      <Button
        className={className}
        size={size}
        variant={v}
        loading={status?.send?.load}
        onClick={() => setOpenList(true)}
      >
        {icon}Transfer Device
      </Button>

      <UserListDialog
        onOpenChange={setOpenList}
        mode="single"
        open={openList}
        onCancel={() => {
          setFriend({ uId: '', name: '' });
          setOpenList(false);
        }}
        onConfirm={(s) => {
          setFriend({ uId: s[0]?.id, name: s[0]?.name });
          if (friend?.uId !== '') {
            setConfirm(true);
            setOpenList(false);
          }
        }}
      />

      <ConfirmationModal
        title={'Transfer Device?'}
        description={`Are you sure you want to transfer this device to ${friend?.name}? This action cannot be undone.`}
        confirmText={'Transfer'}
        cancelText={'Cancel'}
        isLoading={status?.send?.load}
        variant="destructive"
        onConfirm={handleTransfer}
        open={confirm}
        onOpenChange={setConfirm}
      />
    </>
  );
};
