import { OutputFormat, setDefaults, fromLatLng } from 'react-geocode';

// Initialize the library with the API key
setDefaults({
  key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  outputFormat: OutputFormat.JSON,
});

/**
 * Get postal code from latitude and longitude
 * @param lat - number
 * @param lng - number
 * @param fallbackPostalCode - { lat: number, lng: number }
 */
export async function getPostalCodeFromLatLng(
  lat: number,
  lng: number,
  fallbackPostalCode?: {
    lat: number;
    lng: number;
  }
) {
  try {
    const { results } = await fromLatLng(lat, lng);

    for (const result of results) {
      for (const component of result.address_components) {
        if (component.types.includes('postal_code')) {
          return parseInt(component.long_name);
        }
      }
    }

    if (fallbackPostalCode) {
      return await getPostalCodeFromLatLng(
        fallbackPostalCode.lat,
        fallbackPostalCode.lng
      );
    }

    return null;
  } catch {
    return null;
  }
}
