'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null;
  placeholderSrc: string;
}

export function SafeImage({ src, placeholderSrc, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    // Using a standard img tag for the placeholder to avoid any potential
    // issues with Next/Image when the original src has already errored.
    return <img src={placeholderSrc} alt={props.alt} width={props.width} height={props.height} className={props.className as string} />;
  }

  return (
    <Image
      {...props}
      src={src as string} // We've already checked for !src
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
