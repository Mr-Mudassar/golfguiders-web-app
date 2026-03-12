'use client';

import React, { useState } from 'react';
import type { IDevices } from '../_interface';
import { DeviceMapInfo } from '../layout/parts';
import { Button, Icon } from '@/components/ui';
import { ListingInfo } from './listing';

type lats = {
  lat: number;
  lng: number;
};

const TrackingLayout = () => {
  const [mapPin, setMapPin] = useState<IDevices | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [latLng, setLatLng] = useState<lats>();

    return (
      <div className="h-[90svh] flex flex-col">
        <div className="grid grid-cols-4 gap-6 flex-1">
          {/* LEFT - Map Container */}
          <div className="col-span-3 bg-card rounded-2xl relative border border-white/[0.05] overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
            {!active || !mapPin ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <Icon name="location" className="size-8 text-primary/50" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">No Device Selected</p>
                  <p className="text-sm">Select a device from the list to start tracking</p>
                </div>
              </div>
            ) : (

            <>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => setActive(null)}
                className="absolute z-[99] right-5 top-5 border border-muted-foreground hover:border-primary"
              >
                <span className="text-xxs text-muted-foreground hover:text-primary">
                  ESC
                </span>
              </Button>
              <div className="absolute left-5 top-5 z-[99] flex items-center group gap-0 hover:gap-2 transition-all">
                <Button
                  size="icon-sm"
                  onClick={() =>
                    setLatLng({ lat: mapPin?.lat, lng: mapPin?.lng })
                  }
                  className="scale-100 active:scale-90"
                  title="Current Location"
                >
                  <Icon name="location" />
                </Button>
                <span className="hidden group-hover:flex text-xs text-primary bg-white px-1.5 py-0.5 rounded">
                  Go to Current Location
                </span>
              </div>
              <DeviceMapInfo
                deviceId={mapPin?.imei as string}
                setActive={setActive}
                locPin={latLng}
                setLoc={setLatLng}
              />
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="h-full">
          {/* <Listing setPin={setMapPin} setActive={setActive} active={active} /> */}
          <ListingInfo
            active={active}
            setActive={setActive}
            setPin={setMapPin}
            setLoc={setLatLng}
            latLng={latLng as lats}
            deviceId={mapPin?.imei as string}
          />
        </div>
      </div>
    </div>
  );
};

export { TrackingLayout };
