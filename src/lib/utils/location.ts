
export async function getCurrentLatLng() {
  try {
    const position: GeolocationPosition | null = await new Promise(
      (resolve, reject) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
          resolve(null);
        }
      }
    );

    if (!position) {
      return null;
    }

    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch {
    return null;
  }
}