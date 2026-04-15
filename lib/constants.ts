export const siteName = '7ちゃんねる';
export const defaultSiteUrl = 'https://7ch.net';
const defaultBackendApiBaseUrl = 'http://localhost:8080';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');
const normalizeBackendApiBaseUrl = (value: string) =>
  trimTrailingSlashes(value).replace(/\/api$/i, '');
const isProductionRuntime = process.env.NODE_ENV === 'production';

export const getSiteUrl = () => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return trimTrailingSlashes(raw);
  if (isProductionRuntime) {
    throw new Error('NEXT_PUBLIC_SITE_URL is required in production');
  }
  return defaultSiteUrl;
};

export const getBackendApiBaseUrl = () => {
  const raw = process.env.BACKEND_API_BASE_URL?.trim();
  if (raw) return normalizeBackendApiBaseUrl(raw);
  if (isProductionRuntime) {
    throw new Error('BACKEND_API_BASE_URL is required in production');
  }
  return defaultBackendApiBaseUrl;
};
