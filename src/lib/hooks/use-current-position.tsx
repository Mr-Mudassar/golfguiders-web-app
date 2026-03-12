import { useAppSelector } from '.';
import { getCurrentLatLng } from '../utils';

export function useCurrentPosition() {
  const auth = useAppSelector((state) => state.auth);

  const userLatLng = auth.user?.country_latlng
    ? {
        lat: auth.user.country_latlng[0],
        lng: auth.user.country_latlng[1],
      }
    : null;

  async function fetchCurrentLatLng() {
    try {
      const position = await getCurrentLatLng();

      if (position) {
        return position;
      }

      return userLatLng;
    } catch {
      return null;
    }
  }

  return {
    fetchCurrentLatLng,
    userLatLng,
  };
}
