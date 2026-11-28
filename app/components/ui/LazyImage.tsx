"use client";

import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
 src: string;
 alt: string;
 /** Classes for the <img> itself (object-fit, rounding, max sizes). */
 className?: string;
 /**
  * Classes for the box around it, which holds the placeholder. Give it the size the image should
  * take, e.g. "w-full h-full" inside a fixed tile, or "inline-flex" for a preview that sizes itself.
  */
 frameClassName?: string;
 /** Load straight away instead of when it nears the screen (for images already in view, like a modal's subject). */
 eager?: boolean;
 /** What to show if the image can't load. Defaults to an icon and "Image unavailable". */
 fallback?: React.ReactNode;
}

/**
 * An image that loads only when it's about to scroll into view, shows a pulsing placeholder
 * until it arrives, then fades in. If it fails, it says so instead of showing a broken image.
 */
export default function LazyImage({ src, alt, className, frameClassName, eager = false, fallback }: LazyImageProps) {
 const [state, setState] = useState<'loading' | 'loaded' | 'failed'>('loading');
 const ref = useRef<HTMLImageElement>(null);

 useEffect(() => {
  setState('loading');
  // A cached image can finish before React attaches onLoad; catch that here.
  const img = ref.current;
  if (img?.complete) setState(img.naturalWidth > 0 ? 'loaded' : 'failed');
 }, [src]);

 if (state === 'failed') {
  return (
   <span className={cn('relative flex flex-col items-center justify-center bg-muted/60 text-muted-foreground text-center', !fallback && 'gap-1.5 p-3 text-xs', frameClassName)}>
    {fallback ?? (
     <>
      <ImageOff className="size-5" aria-hidden="true" />
      <span>Image unavailable</span>
     </>
    )}
   </span>
  );
 }

 return (
  <span className={cn('relative block overflow-hidden', frameClassName)}>
   {state === 'loading' && <span aria-hidden="true" className="absolute inset-0 bg-muted motion-safe:animate-pulse" />}
   <img
    ref={ref}
    src={src}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    referrerPolicy="no-referrer"
    onLoad={() => setState('loaded')}
    onError={() => setState('failed')}
    className={cn('motion-safe:transition-opacity motion-safe:duration-300', state === 'loaded' ? 'opacity-100' : 'opacity-0', className)}
   />
  </span>
 );
}
