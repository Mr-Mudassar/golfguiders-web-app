import { Button, Icon, Skeleton, ScrollArea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { IDevices } from '../../_interface';

export const DeviceList = ({
  data,
  loading,
  active,
  onSelect,
}: {
  data?: IDevices[];
  loading: boolean;
  active: string | null;
  onSelect: (d: IDevices) => void;
}) => {
  if (loading) {
    return (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 my-2" />
        ))}
      </>
    );
  }

  if (!data?.length) {
    return (
      <div className="pt-20 text-muted-foreground text-sm text-center gap-4">
        No devices found.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 -mx-2 px-2">
      <div className="space-y-1 py-2">
        {data?.map((d) => (
          <Button
            key={d.imei}
            variant="ghost"
            className={cn(
              "w-full justify-start h-12 rounded-xl border border-transparent transition-all",
              active === d.imei 
                ? "bg-primary/10 border-primary/20 text-primary shadow-sm" 
                : "hover:bg-white/5 hover:border-white/10"
            )}
            onClick={() => onSelect(d)}
          >
            <div className={cn(
              "size-8 rounded-lg flex items-center justify-center mr-3 transition-colors",
              active === d.imei ? "bg-primary text-black" : "bg-white/5 text-muted-foreground"
            )}>
              <Icon
                name={active === d.imei ? "check" : "location"}
                className="size-4"
              />
            </div>
            <span className="font-medium">{d.deviceName}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};
