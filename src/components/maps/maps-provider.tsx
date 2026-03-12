import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

const MapsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      {children}
    </APIProvider>
  );
};

export { MapsProvider };
