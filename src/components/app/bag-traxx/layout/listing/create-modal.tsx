import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useDeviceMutations } from '../../_mutations';
import { useAppSelector } from '@/lib';
import { toast } from 'sonner';
import { Modal } from '@/components/app/dashboard/tournaments/play-local/create/dialog';
import { Button, Input } from '@/components/ui';

export const CreateUpdateDevice = ({
  open,
  setOpen,
  curDevice,
  refetch,
}: {
  open: boolean;
  setOpen: () => void;
  curDevice?: { name: string; imei: string };
  refetch?: () => void;
}) => {
  const isEdit = !!curDevice?.name && !!curDevice?.imei;

  const [deviceName, setDeviceName] = useState(curDevice?.name ?? '');
  const [deviceId, setDeviceId] = useState(curDevice?.imei ?? '');
  const { linkDevice, updateName, status } = useDeviceMutations();

  const u = useAppSelector((s) => s.auth?.user);

  const err = status?.create?.err?.message || status?.edit?.err?.message;
  const load = status?.create?.load || status?.edit?.load;

  useEffect(() => {
    if (curDevice) {
      setDeviceName(curDevice.name);
      setDeviceId(curDevice.imei);
    }
  }, [curDevice]);

  const handleClick = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const vari = {
      name: deviceName,
      deviceId,
      userId: u?.userid as string,
    };
    try {
      if (isEdit) {
        const d = await updateName({ variables: vari });
        if (d?.data?.updateDeviceName) {
          toast('Device name updated to ' + deviceName + '!');
          refetch?.();
          setOpen();
        }
      } else {
        const d = await linkDevice({ variables: vari });
        if (d?.data?.linkDevice) {
          toast('Device name updated to ' + deviceName + '!');
          refetch?.();
          setOpen();
        }
      }
    } catch (error) {
      toast(err);
      console.log(error);
    }
  };

  return (
    <>
      <Modal
        open={open}
        setOpen={setOpen}
        title={!isEdit ? 'Link New Device' : 'Edit Device Name'}
        description={
          !isEdit
            ? 'Enter the tracker IMEI number and give it a name to continue tracking'
            : 'You can only update the device name, the IMEI number is read-only'
        }
      >
        <form onSubmit={handleClick}>
          <div className="space-y-4">
            <Input
              value={deviceName}
              type="text"
              min={10}
              onInput={(e) => setDeviceName(e?.currentTarget.value)}
              placeholder="Enter Device Name"
              required
            />
            <Input
              type="number"
              value={isEdit ? curDevice?.imei : deviceId}
              disabled={isEdit}
              onInput={(e) => setDeviceId(e?.currentTarget.value)}
              className="appearance-none"
              max={999999999999999}
              min={100000000000000}
              required
              placeholder="Enter IMEI Number"
            />
            <div className="space-x-4 mt-3">
              <Button onClick={setOpen} variant="outline">
                Cancel
              </Button>
              <Button
                loading={load}
                disabled={load ?? (!deviceId || !deviceName)}
                type="submit"
              >
                {!isEdit ? 'Link Device' : 'Update Device'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
