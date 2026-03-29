const FALLBACK_ORIGIN = 'https://7ch.invalid';

// 只允许站内相对路径，阻断 `//evil.com` 这类 scheme-relative 跳转。
// Only allow same-origin relative paths; block scheme-relative redirects.
export const sanitizeInternalPath = (candidate: string | null | undefined, fallback: string = '/') => {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return fallback;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN;

  try {
    const normalized = new URL(candidate, origin);
    if (normalized.origin !== origin) {
      return fallback;
    }
    return `${normalized.pathname}${normalized.search}${normalized.hash}`;
  } catch {
    return fallback;
  }
};

export const getSafeInternalPathFromSearch = (
  search: string,
  key: string = 'from',
  fallback: string = '/'
) => {
  const params = new URLSearchParams(search);
  return sanitizeInternalPath(params.get(key), fallback);
};
