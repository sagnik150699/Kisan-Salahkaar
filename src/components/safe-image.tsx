
'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface SafeImageProps extends ImageProps {
    placeholderSrc: string;
}

export function SafeImage({ src, placeholderSrc, ...props }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc || placeholderSrc}
      onError={() => {
        setImgSrc(placeholderSrc);
      }}
    />
  );
}
