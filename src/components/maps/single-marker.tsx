import React from 'react';
import { MapsProvider } from './maps-provider';
import { Map, Marker } from '@vis.gl/react-google-maps';
import { cn } from '@/lib/utils';

interface SingleMarkerMapProps {
  className?: string;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  /** Called when the map has finished loading (tiles rendered). */
  onLoad?: () => void;
}

const SingleMarkerMap: React.FC<SingleMarkerMapProps> = ({
  className,
  latitude,
  longitude,
  onLoad,
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const isValidLatLng =
    typeof latitude === 'number' &&
    !isNaN(latitude) &&
    typeof longitude === 'number' &&
    !isNaN(longitude);

  if (!isValidLatLng) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-200 text-gray-500 min-h-44 text-sm',
          className
        )}
      >
        Location not found!
      </div>
    );
  }

  if (isValidLatLng && !apiKey) {
    return (
      <div
        className={cn(
          'flex items-center text-sm justify-center bg-gray-200 text-gray-500 min-h-44',
          className
        )}
      >
        localhost isn&#39;t supported in Google Map API
        <p>
          lat: {latitude}, lng: {longitude}
        </p>
      </div> // Don't forget to add a key (GOOGLE_MAPS_API_KEY) and its value in production
    );
  }

  return (
    <MapsProvider>
      <Map
        className={cn('h-full w-full', className)}
        defaultZoom={13}
        center={{ lat: latitude, lng: longitude }}
        onIdle={onLoad}
      >
        <Marker position={{ lat: latitude, lng: longitude }} />
      </Map>
    </MapsProvider>
  );
};

export { SingleMarkerMap };
