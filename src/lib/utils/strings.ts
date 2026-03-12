import { useFormatter } from 'next-intl';
import { formatDistanceToNow, parseISO } from 'date-fns';

// export function getName(...names: (string | undefined)[]) {
//   return lodash
//     .take(
//       lodash.flatten(lodash.compact(names).map((s) => s.trim().split(' '))),
//       2
//     )
//     .map((s) => lodash.capitalize(s))
//     .join(' ');
// }

// export function getInitials(...names: (string | undefined)[]) {
//   return lodash
//     .take(
//       lodash.flatten(lodash.compact(names).map((s) => s.trim().split(' '))),
//       2
//     )
//     .map((s) => s[0]?.toUpperCase())
//     .join('');
// }
export function getName(...names: (string | undefined)[]): string {
  const words = names
    .filter((n): n is string => Boolean(n))
    .flatMap((s) => s.trim().split(/\s+/));

  const firstTwo = words.slice(0, 2);

  return firstTwo
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getInitials(...names: (string | undefined)[]) {
  return names
    .filter(Boolean)
    .flatMap((s) => s?.trim().split(/\s+/))
    .slice(0, 2)
    .map((s) => s![0]?.toUpperCase() || '')
    .join('');
}

export function capitalize(str: string) {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function formatNumber(number: number): string {
  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`;
  } else if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}K`;
  } else {
    return number?.toString();
  }
}

export function useFormattedDate() {
  const format = useFormatter();

  return (msString: string) => {
    const date = new Date(Number(msString));
    const now = new Date(); // Use current browser time for accurate calculation

    // Optional: basic future check
    if (date > now) {
      return format.relativeTime(now, date); // e.g. "in 5 minutes"
    }

    // For very recent posts (less than 1 minute), show "just now" or "a few seconds ago"
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 10) {
      return 'just now';
    }
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    return format.relativeTime(date, now); // e.g. "2 days ago", "a few seconds ago"
  };
}

export function isFormattedDateViaString(d: string): string {
  const date = parseISO(d);
  return formatDistanceToNow(date, { addSuffix: true }); // e.g., "2 minutes ago", "4 hours ago", "5 days ago"
}

export function isColorDark(hexColor: string): boolean {
  // Remove # if present
  if (!hexColor) return false;
  const hex = hexColor.replace('#', '');

  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Threshold for light/dark (0-255)
  return luminance < 128;
}

export function getYouTubeThumbnail(url: string): string {
  try {
    const videoId = new URL(url).searchParams.get('v');
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : '';
  } catch {
    return '';
  }
}

export function formatMentions(raw: string | undefined | null): string {
  return raw?.replace(/@(?=\[)/g, '{@}') ?? '';
}

export function unformatMentions(raw: string | undefined | null): string {
  return raw?.replace(/\{@\}(?=\[)/g, '@') ?? '';
}

export function isValidateEmail(value: string) {
  const pattern = new RegExp(
    /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
  );
  return pattern.test(value);
}
