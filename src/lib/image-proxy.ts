/**
 * Proxy Steam images through our API to avoid CORS issues
 */
export function proxySteamImage(url: string): string {
  if (!url) return url;
  
  // Check if it's a Steam image
  if (url.includes('steamstatic.com') || url.includes('akamai')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  }
  
  return url;
}

/**
 * Proxy multiple Steam images
 */
export function proxySteamImages(urls: string[]): string[] {
  return urls.map(proxySteamImage);
}
