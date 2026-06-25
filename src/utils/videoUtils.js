export function getYoutubeId(url) {
  const match = (url || '').match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getVimeoId(url) {
  const match = (url || '').match(/vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/)?(\d+)/);
  return match ? match[1] : null;
}

export function getVideoType(url) {
  if (!url) return null;
  if (getYoutubeId(url)) return 'youtube';
  if (getVimeoId(url))   return 'vimeo';
  return 'direct';
}

export function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getEmbedUrl(url) {
  const ytId = getYoutubeId(url);
  if (ytId) {
    const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&origin=${origin}`;
  }
  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  return null;
}
