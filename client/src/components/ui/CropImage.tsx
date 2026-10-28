import React, { useState } from 'react';
import { Sprout } from 'lucide-react';

interface CropImageProps {
  src?: string | null;
  alt: string;
  cropName?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * CropImage renders a crop image with automatic neutral placeholder fallback.
 * Requirement B4: If missing or failed to load, display a neutral leaf placeholder with crop name,
 * NEVER a photo of another crop.
 */
export const CropImage: React.FC<CropImageProps> = ({
  src,
  alt,
  cropName,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full',
}) => {
  const [hasError, setHasError] = useState(false);

  // If no source or failed to load, render neutral botanical placeholder
  if (!src || hasError) {
    return (
      <div
        className={`bg-mint flex flex-col items-center justify-center text-forest p-1 text-center select-none ${containerClassName}`}
        role="img"
        aria-label={alt || cropName || 'Crop image placeholder'}
      >
        <Sprout className="w-5 h-5 text-forest/80 shrink-0" />
        {cropName && (
          <span className="text-[9px] sm:text-[10px] font-extrabold text-forest line-clamp-1 max-w-full px-1 truncate mt-0.5 leading-tight">
            {cropName.split('(')[0].trim()}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || cropName || 'Crop image'}
      className={className}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export default CropImage;
