export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw === undefined || raw === '') {
    return '';
  }
  return raw.replace(/\/$/, '');
}

export function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const base = getApiBaseUrl();
  if (base === '') {
    return path;
  }
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
