import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Button,
  ScrollArea,
  Icon,
  CardHeader,
} from '@/components/ui';
import type { DeviceHistory, IDevices } from '../../_interface';
import { DateRangeFilter } from './filter';
import { useState } from 'react';
import { Modal } from '@/components/app/dashboard/tournaments/play-local/create/dialog';
import { format } from 'date-fns';
import { BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react';
import { CreateUpdateDevice } from './create-modal';
import { DetachDevice } from './detach-device';
import { useBagTracking } from '../../hook';
import { TransferDeviceBtn } from './transfer-device';

export const DeviceDetails = ({
  device,
  loading,
  history,
  setDate,
  setLoc,
  address,
  setActive,
}: {
  device: IDevices;
  loading: boolean;
  history: DeviceHistory[];
  setActive: (v: null | string) => void;
  setDate: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
  address: string;
  setLoc: React.Dispatch<
    React.SetStateAction<
      | {
        lat: number;
        lng: number;
      }
      | undefined
    >
  >;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="info">
        <CardHeader className="p-1">
          <TabsList className="justify-start bg-transparent">
            <TabsTrigger
              className="data-[state=active]:shadow-none"
              value="info"
            >
              Info and Actions
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:shadow-none"
              value="his"
            >
              History
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className="pt-0">
          {loading ? (
            <Skeleton className="h-5 w-40" />
          ) : (
            <>
              <TabsContent value="info">
                {/* <h2 className="text-lg font-semibold mt-4">Info and Actions</h2> */}
                <InfoActions
                  addr={address}
                  device={device}
                  setActive={setActive}
                />
              </TabsContent>

              <TabsContent className="p-0 m-0" value="his">
                <ScrollArea>
                  <div className="flex justify-between items-center my-2">
                    <h2 className="font-semibold">History</h2>
                    <Button
                      size="sm"
                      variant={open ? 'default' : 'outline'}
                      onClick={() => setOpen(!open)}
                    >
                      {open ? 'Apply' : 'Filter'}
                    </Button>
                  </div>
                  {open && (
                    <Modal open={open} setOpen={() => setOpen(false)}>
                      <DateRangeFilter
                        close={() => setOpen(false)}
                        setDate={setDate}
                      />
                    </Modal>
                  )}
                  <HistoryList
                    data={history}
                    onSelectLocation={(lat, lng) => setLoc({ lat, lng })}
                  />
                </ScrollArea>
              </TabsContent>
            </>
          )}
        </CardContent>
      </Tabs>
    </Card>
  );
};

interface HistoryListProps {
  data: DeviceHistory[];
  onSelectLocation?: (lat: number, lng: number) => void;
}

const HistoryList = ({ data, onSelectLocation }: HistoryListProps) => {
  if (!data?.length) {
    return (
      <div className="p-4 text-muted-foreground text-center">
        No history available
      </div>
    );
  }

  const battery = (value: number) => {
    if (!value) return;
    if (value > 70) {
      return <BatteryFull className="size-4 text-primary" />;
    } else if (value > 30 && value < 70) {
      return <BatteryMedium className="size-4 text-orange-400" />;
    } else {
      return <BatteryLow className="size-4 text-red-400" />;
    }
  };

  const off = (v: string) => v === '0';

  return (
    <div className="flex flex-col divide-y border rounded-md overflow-hidden">
      {data.map((h) => (
        <div
          key={h.gpsTime}
          className="grid p-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelectLocation?.(h.lat, h.lng)}
        >
          {/* Date & Time */}
          <div className="flex text-xs items-center gap-2 border-b pb-1 mb-1">
            <Icon name="calendar" className="size-3.5 text-gray-400" />
            <span className="font-medium">
              {format(new Date(Number(h.gpsTime)), 'dd MMM yyyy - h:mm a')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            {/* Signal / Status */}
            <div className="flex items-center gap-1 mt-1 sm:mt-0 text-xs">
              <Icon
                name={'signal'}
                className={`size-3.5 ${off(h?.status) ? 'text-gray-400' : 'text-primary animate-in'}`}
              />
              <span className="">{off(h?.status) ? 'Offline' : 'Active'}</span>
            </div>

            {/* Battery */}
            <div className="flex items-center gap-1 mt-1 sm:mt-0 text-xs">
              {battery(Number(h?.battery))}
              <span>{h.battery}%</span>
            </div>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-1 mt-1 sm:mt-0 text-xs">
            <Icon name="gauge" className="size-3.5 text-gray-400" />
            <span>{h.speed || '0'} km/h</span>
          </div>

          {/* Direction */}
          <div className="flex items-center gap-1 mt-1 sm:mt-0 text-xs">
            <Icon name="compass" className="size-3.5 text-gray-400" />
            <span>{h.direction || '-'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const InfoActions = ({
  device,
  addr,
  setActive,
}: {
  device: IDevices;
  addr: string;
  setActive: (v: null | string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { detail, list } = useBagTracking({ dId: device?.imei });

  const act = device?.status === 'ACTIVE';

  const handleFetch = async () => {
    await list?.fetch?.();
    await detail?.fetch?.();
  };

  return (
    <>
      <div className="space-y-2 mt-2 divide-y">
        <div className="text-muted-foreground text-xs flex items-center p-1">
          Device Name:{' '}
          <h1 className="font-semibold text-foreground ml-2">
            {device.deviceName}
          </h1>
        </div>
        <div className="text-xs mt-2 pt-2 px-1">
          <p className="font-semibold text-xxs"> Current location</p>
          <p>{addr || 'Loading address...'}</p>
        </div>

        <p className="text-xs pt-2 px-1 text-muted-foreground">
          Status:{' '}
          <span
            className={
              act ? 'text-primary animate-pulse' : 'text-muted-foreground'
            }
          >
            {act ? 'Active' : 'Offline'}
          </span>
        </p>
        <p className="font-semibold text-sm px-1 pt-3">Available Actions:</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="w-full justify-start hover:text-primary hover:bg-transparent pt-2"
        >
          <Icon name="edit" className="mr-2" /> Update Device Name
        </Button>
        <TransferDeviceBtn
          className="w-full justify-start hover:text-primary hover:bg-transparent pt-2"
          icon={<Icon name="share2" className="mr-2" />}
          setActive={setActive}
          deviceId={device?.imei}
          variant="ghost"
          refetch={handleFetch}
          size="sm"
        />
        <DetachDevice
          className="w-full justify-start hover:text-destructive hover:bg-transparent pt-2"
          icon={<Icon name="bin" className="mr-2" />}
          refetch={handleFetch}
          deviceId={device?.imei}
          setActive={setActive}
          variant="ghost"
          size="sm"
        />
      </div>

      <CreateUpdateDevice
        open={open}
        setOpen={() => setOpen(false)}
        curDevice={{ imei: device?.imei, name: device?.deviceName }}
        refetch={async () => {
          await list?.fetch?.();
          await detail?.fetch?.();
        }}
      />
    </>
  );
};
