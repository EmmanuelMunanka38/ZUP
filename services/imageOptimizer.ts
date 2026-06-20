import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PIXEL_RATIO = PixelRatio.get();

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

let cdnBase: string | null = null;

export function setImageCDN(base: string | null) {
  cdnBase = base;
}

export function getImageCDN(): string | null {
  return cdnBase;
}

function buildOptimizedUrl(url: string, options: ImageOptions): string {
  const params = new URLSearchParams();
  params.set('url', url);
  if (options.width) params.set('w', String(Math.round(options.width)));
  if (options.height) params.set('h', String(Math.round(options.height)));
  params.set('output', options.format || 'webp');
  params.set('q', String(options.quality ?? 80));
  return `${cdnBase}/?${params.toString()}`;
}

export function optimizeImageUrl(url: string, options?: ImageOptions): string {
  if (!url) return url;
  if (!cdnBase) return url;

  const opts: ImageOptions = {
    quality: 80,
    format: 'webp',
    ...options,
  };

  try {
    return buildOptimizedUrl(url, opts);
  } catch {
    return url;
  }
}

export function getScreenOptimalWidth(fraction: number = 1): number {
  return Math.round(SCREEN_WIDTH * fraction * PIXEL_RATIO);
}

export function getScreenOptimalHeight(fraction: number = 1): number {
  return Math.round(SCREEN_HEIGHT * fraction * PIXEL_RATIO);
}
