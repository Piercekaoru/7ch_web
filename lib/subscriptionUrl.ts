export type SubscriptionSourceUrlValidationError = 'empty' | 'publicUrlOnly';

const isValidIpv4 = (hostname: string) => {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return null;

  const octets = hostname.split('.').map((segment) => Number.parseInt(segment, 10));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return octets;
};

const isBlockedIpv4 = (octets: number[]) => {
  const [a, b, c] = octets;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
};

const normalizeIpv6 = (hostname: string) => hostname.replace(/^\[/, '').replace(/\]$/, '').toLowerCase();

const parseIpv4MappedIpv6 = (hostname: string) => {
  const normalized = normalizeIpv6(hostname);

  const dottedMatch = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (dottedMatch) {
    return isValidIpv4(dottedMatch[1]);
  }

  const hexMatch = normalized.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i);
  if (!hexMatch) {
    return null;
  }

  const left = Number.parseInt(hexMatch[1], 16);
  const right = Number.parseInt(hexMatch[2], 16);
  if (!Number.isInteger(left) || !Number.isInteger(right)) {
    return null;
  }

  return [
    (left >> 8) & 0xff,
    left & 0xff,
    (right >> 8) & 0xff,
    right & 0xff,
  ];
};

const isBlockedIpv6 = (hostname: string) => {
  const normalized = normalizeIpv6(hostname);
  if (!normalized.includes(':')) return false;

  if (normalized === '::' || normalized === '::1' || normalized.includes('%')) {
    return true;
  }

  const mappedIpv4 = parseIpv4MappedIpv6(normalized);
  if (mappedIpv4) {
    return isBlockedIpv4(mappedIpv4);
  }
  if (normalized.startsWith('::ffff:')) {
    return true;
  }

  const segments = normalized.split(':').filter((segment) => segment.length > 0);
  if (segments.length === 0) {
    return true;
  }

  const first = Number.parseInt(segments[0], 16);
  if (!Number.isFinite(first)) {
    return true;
  }

  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10
  if ((first & 0xffc0) === 0xfec0) return true; // fec0::/10

  if (first === 0x2001 && segments[1] && Number.parseInt(segments[1], 16) === 0x0db8) {
    return true; // 2001:db8::/32 documentation range
  }

  return false;
};

const isPublicHostname = (hostname: string) => {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized) return false;

  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local')
  ) {
    return false;
  }

  const ipv4 = isValidIpv4(normalized);
  if (ipv4) {
    return !isBlockedIpv4(ipv4);
  }

  if (normalized.includes(':') || (normalized.startsWith('[') && normalized.endsWith(']'))) {
    return !isBlockedIpv6(normalized);
  }

  return normalized.includes('.');
};

export const validateSubscriptionSourceUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false as const, reason: 'empty' as SubscriptionSourceUrlValidationError };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return { ok: false as const, reason: 'publicUrlOnly' as SubscriptionSourceUrlValidationError };
  }

  if (
    (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') ||
    !isPublicHostname(parsedUrl.hostname)
  ) {
    return { ok: false as const, reason: 'publicUrlOnly' as SubscriptionSourceUrlValidationError };
  }

  return { ok: true as const, normalizedUrl: parsedUrl.toString() };
};

export const assertPublicSubscriptionSourceUrl = (value: string) => {
  const result = validateSubscriptionSourceUrl(value);
  if (result.ok) {
    return result.normalizedUrl;
  }

  if (result.reason === 'empty') {
    throw new Error('sourceUrl cannot be empty');
  }

  throw new Error('sourceUrl must be a public http/https URL');
};

const MASKED_TOKEN = '••••••••';
const TOKEN_PARAM_PATTERN = /([?&]token=)[^&#]*/i;

export const maskSubscriptionUrlForDisplay = (value: string) => {
  return value.replace(TOKEN_PARAM_PATTERN, `$1${MASKED_TOKEN}`);
};
