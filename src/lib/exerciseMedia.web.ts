import media from '@/data/exerciseMedia.json';

export function getMovementPair(id: string) {
  if (!Object.prototype.hasOwnProperty.call(media, id)) return undefined;

  const base = (process.env.EXPO_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');
  const path = `${base}/media/${id}`;
  return { start: { uri: `${path}/start.webp` }, end: { uri: `${path}/end.webp` } };
}
