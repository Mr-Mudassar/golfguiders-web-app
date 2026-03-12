'use client';

import { Button, Input } from '@/components/ui';
import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useBagTracking } from '../hook';
import { SingleMarkerMap } from '@/components/maps';
import { useDeviceMutations } from '../_mutations';
import { Modal } from '../../dashboard/tournaments/play-local/create/dialog';
import { useAppSelector } from '@/lib';
import { toast } from 'sonner';
import { DetachDevice } from './listing/detach-device';


export const DeviceMapInfo = ({
  deviceId,
  setActive,
  locPin,
  setLoc,
}: {
  deviceId: string;
  setActive: React.Dispatch<React.SetStateAction<string | null>>;
  setLoc: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | undefined>
  >;
  locPin: { lat: number; lng: number } | undefined;
}) => {
  const { detail, list } = useBagTracking({ dId: deviceId });

  const [open, setOpen] = useState(false);

  const isLoading = detail?.load || list?.load;
  const hasData = !!detail?.data && !!list?.data;
  const isEmpty = !isLoading && !hasData;

  useEffect(() => {
    const lat = detail?.data?.lat;
    const lng = detail?.data?.lng;

    if (
      lat == null ||
      lng == null ||
      (locPin?.lat === lat && locPin?.lng === lng)
    ) {
      return;
    }

    setLoc({ lat, lng });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.data?.lat, detail?.data?.lng]);

  // Empty state UI
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-sm text-muted-foreground">
          No device data available
        </p>
        <div className="flex items-center gap-3 text-muted-foreground">
          <DetachDevice
            size="sm"
            refetch={async () => {
              await list?.fetch?.();
              await detail?.fetch?.();
            }}
            variant="destructive"
            deviceId={deviceId}
            setActive={setActive}
          />
          |
          <Button
            size="sm"
            onClick={() => {
              detail?.fetch();
              list?.fetch();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-full w-full">
        {hasData && (
          <SingleMarkerMap
            latitude={locPin?.lat}
            longitude={locPin?.lng}
            className="h-full w-full bg-secondary rounded"
          />
        )}
      </div>

      <CreateUpdateDevice
        open={open}
        setOpen={() => setOpen(false)}
        curDevice={{
          name: detail?.data?.deviceName || '',
          imei: detail?.data?.imei || '',
        }}
        refetch={() => {
          detail?.fetch();
          list?.fetch();
        }}
      />
    </>
  );
};

const CreateUpdateDevice = ({
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

  const handleClick = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const vari = {
      name: deviceName,
      deviceId,
      userId: u?.userid as string,
    };
    try {
      if (isEdit) {
        updateName({ variables: vari });
      } else {
        linkDevice({ variables: vari });
      }
      refetch?.();
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
        description="Enter the tracker IMEI number and give it a name to continue tracking"
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
              min={111111111111111}
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
