/// <reference types="expo/types/metro-require" />

import media from '@/data/exerciseMedia.json';

export function getMovementPair(id: string) {
  if (!Object.prototype.hasOwnProperty.call(media, id)) return undefined;

  // Metro includes these files in native builds so previews also work on first launch offline.
  const frames = require.context('../../public/media', true, /\/(start|end)\.webp$/);
  return {
    start: frames<number>(`./${id}/start.webp`),
    end: frames<number>(`./${id}/end.webp`),
  };
}
