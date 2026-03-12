/**
 * Converts Google Cloud Storage "console" URLs to direct API URLs.
 * storage.cloud.google.com returns HTML when fetched server-side (e.g. by Next.js image optimizer).
 * storage.googleapis.com returns raw image bytes, so the optimizer gets a valid image.
 */
export function toDirectGcsImageUrl(url: string | null | undefined): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  if (url.includes('storage.cloud.google.com')) {
    return url.replace('storage.cloud.google.com', 'storage.googleapis.com');
  }
  return url;
}
