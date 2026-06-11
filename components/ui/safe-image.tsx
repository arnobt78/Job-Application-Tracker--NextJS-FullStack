'use client';

import { cn } from '@/lib/utils';
import Image, { type ImageProps } from 'next/image';
import { useCallback, useState, type SyntheticEvent } from 'react';

type SafeImageProps = ImageProps;

/** next/image with native img fallback when optimizer fails (e.g. Vercel 402) */
export function SafeImage({
  alt,
  src,
  className,
  fill,
  width,
  height,
  onError,
  priority,
  loading,
  ...rest
}: SafeImageProps) {
  const [useNative, setUseNative] = useState(false);
  const resolvedSrc = typeof src === 'string' ? src : '';

  const handleError = useCallback(
    (e: SyntheticEvent<HTMLImageElement, Event>) => {
      onError?.(e);
      if (resolvedSrc) setUseNative(true);
    },
    [onError, resolvedSrc]
  );

  const eager = Boolean(priority || loading === 'eager');

  if (useNative && resolvedSrc) {
    if (fill) {
      return (
        <img
          alt={alt}
          src={resolvedSrc}
          className={cn('absolute inset-0 h-full w-full', className)}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          sizes={typeof rest.sizes === 'string' ? rest.sizes : undefined}
        />
      );
    }
    return (
      <img
        alt={alt}
        src={resolvedSrc}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className={cn(className)}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <Image
      {...rest}
      alt={alt}
      src={src}
      className={className}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      loading={loading}
      onError={handleError}
    />
  );
}
