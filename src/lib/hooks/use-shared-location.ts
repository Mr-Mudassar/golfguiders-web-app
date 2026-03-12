import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '.';
import { getCurrentLatLng } from '../utils';

interface Location {
  lat: number;
  lng: number;
}

/**
 * Shared location hook that deduplicates GPS calls across components.
 * Uses React Query to ensure the GPS fetch only happens once,
 * even if multiple components call this hook.
 */
export function useSharedLocation() {
  const user = useAppSelector((state) => state.auth.user);

  const countryLatLng =
    user?.country_latlng &&
    Array.isArray(user.country_latlng) &&
    user.country_latlng.length >= 2 &&
    !isNaN(user.country_latlng[0]) &&
    !isNaN(user.country_latlng[1])
      ? { lat: user.country_latlng[0], lng: user.country_latlng[1] }
      : null;

  const { data: location } = useQuery<Location | null>({
    queryKey: ['shared-user-location'],
    queryFn: async (): Promise<Location | null> => {
      // Try GPS first
      try {
        const position = await getCurrentLatLng();
        if (position) return position;
      } catch {
        // GPS failed, fall through to fallbacks
      }

      // Fallback 1: User's stored lat/lng
      if (
        user?.latitude !== undefined &&
        user?.longitude !== undefined &&
        !isNaN(user.latitude) &&
        !isNaN(user.longitude)
      ) {
        return { lat: user.latitude, lng: user.longitude };
      }

      // Fallback 2: Country lat/lng
      if (countryLatLng) return countryLatLng;

      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - location doesn't change often
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    location: location ?? null,
    hasLocation: !!location,
  };
}
