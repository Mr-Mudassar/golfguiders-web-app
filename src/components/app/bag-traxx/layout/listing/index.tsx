'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input, Card, CardHeader, Button, Icon } from '@/components/ui';
import { useBagTracking } from '../../hook';
import { DeviceDetails } from './details';
import { DeviceList } from './device-list';
import type { IDevices } from '../../_interface';
import { format, startOfMonth } from 'date-fns';
import { CreateUpdateDevice } from './create-modal';

export const ListingInfo = ({
  setPin,
  active,
  setActive,
  deviceId,
  setLoc,
  latLng,
}: {
  setPin: React.Dispatch<React.SetStateAction<IDevices | null>>;
  active: string | null;
  latLng: { lat: number; lng: number };
  setLoc: React.Dispatch<
    React.SetStateAction<
      | {
          lat: number;
          lng: number;
        }
      | undefined
    >
  >;
  setActive: React.Dispatch<React.SetStateAction<string | null>>;
  deviceId: string;
}) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [addr, setAddr] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const firstDay = format(startOfMonth(new Date()), 'yyyy-MM-dd');

  const [date, setDate] = useState<{ start: string; end: string }>({
    start: firstDay,
    end: today,
  });

  const { list, detail, fetchAddress, history } = useBagTracking({
    date,
    dId: deviceId,
  });

  const selectedDevice = list?.data?.find((d) => d.imei === active);

  useEffect(() => {
    const getAddress = async () => {
      if (latLng?.lat == null || latLng?.lng == null) return;

      const d = await fetchAddress(latLng.lat, latLng.lng);
      setAddr(d);
    };

    getAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latLng]);

  const filtered = useMemo(() => {
    if (!search) return list.data;
    return list.data?.filter((d) =>
      d.deviceName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, list.data]);

  const handleFetch = async () => {
    await list?.fetch();
    await detail?.fetch();
  };

  if (selectedDevice) {
    return (
      <DeviceDetails
        device={selectedDevice}
        setActive={setActive}
        loading={detail.load}
        address={addr}
        history={history?.data}
        setLoc={setLoc}
        setDate={setDate}
      />
    );
  }

    return (
      <Card className="h-full flex flex-col relative border-white/[0.05] bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
        <CardHeader className="space-y-4">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Devices</h1>
            <p className="text-sm text-muted-foreground">
              Monitor and track your linked devices.
            </p>
          </div>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search device..."
              className="pl-9 bg-background/50 border-white/[0.1] focus:border-primary/50 transition-colors"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <div className="px-6 flex-1 overflow-hidden flex flex-col">
          <DeviceList
            data={filtered}
            loading={list.load}
            active={active}
            onSelect={(d: IDevices) => {
              setActive(d.imei);
              setPin(d);
            }}
          />
        </div>

        <div className="p-6">
          <Button
            className="w-full btn-primary-gradient rounded-xl h-12 flex items-center gap-2 shadow-lg shadow-primary/10"
            onClick={() => setOpen(true)}
          >
            <Icon name="plus" className="size-4" />
            Link New Device
          </Button>
        </div>


      <CreateUpdateDevice
        open={open}
        setOpen={() => setOpen(false)}
        refetch={handleFetch}
      />
    </Card>
  );
};
