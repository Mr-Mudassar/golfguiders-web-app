import { useEffect, useState } from 'react';

export const useDeviceAddress = (
  lat?: number,
  lng?: number,
  fetchAddress?: (lat: number, lng: number) => Promise<string | undefined>
) => {
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!lat || !lng || !fetchAddress) return;

    fetchAddress(lat, lng).then((res) => {
      if (res) setAddress(res);
    });
  }, [lat, lng, fetchAddress]);

  return address;
};
