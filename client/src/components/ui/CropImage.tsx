import React, { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';

export interface CropImageProps {
  cropId?: string;
  src?: string | null;
  alt?: string;
  cropName?: string;
  className?: string;
  containerClassName?: string;
  showFallbackLabel?: boolean;
}

/**
 * CropImage renders a verified botanical crop image loaded by cropId or src from the local static assets.
 * Features:
 * - Direct lookup by stable cropId (/crops/<cropId>.webp)
 * - Skeleton/shimmer placeholder while image loads
 * - Graceful fallback to a clean illustrated green leaf tile with crop title
 * - Development warning log when a fallback is triggered (hidden in production)
 * - Zero runtime third-party API calls
 */
export const CropImage: React.FC<CropImageProps> = ({
  cropId,
  src,
  alt,
  cropName,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full relative overflow-hidden',
  showFallbackLabel = true,
}) => {
  // Resolve source priority: explicit src > /crops/<cropId>.webp > null
  const resolvedSrc = src || (cropId ? `/crops/${cropId}.webp` : null);

  const [isLoading, setIsLoading] = useState<boolean>(Boolean(resolvedSrc));
  const [hasError, setHasError] = useState<boolean>(false);

  // Reset loading & error states when source changes
  useEffect(() => {
    setIsLoading(Boolean(resolvedSrc));
    setHasError(false);
  }, [resolvedSrc]);

  const displayName = cropName || alt || cropId || 'Crop';
  const shortName = displayName.split('(')[0].trim();

  // If no image source is provided or loading failed
  if (!resolvedSrc || hasError) {
    if (import.meta.env.DEV) {
      console.warn(`[CropImage] Using illustrated fallback for crop: "${cropId || cropName || alt || 'unknown'}"`);
    }

    return (
      <div
        className={`bg-mint/80 border border-emerald-200/60 flex flex-col items-center justify-center text-forest p-1.5 text-center select-none ${containerClassName}`}
        role="img"
        aria-label={`${displayName} (Botanical Illustration)`}
      >
        <div className="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center mb-0.5 shrink-0">
          <Sprout className="w-4 h-4 text-forest stroke-[2.2]" />
        </div>
        {showFallbackLabel && (
          <span className="text-[10px] font-extrabold text-forest line-clamp-1 max-w-full px-1 truncate leading-tight">
            {shortName}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Loading Skeleton Shimmer */}
      {isLoading && (
        <div className="absolute inset-0 bg-emerald-50/70 animate-pulse flex items-center justify-center z-10">
          <Sprout className="w-5 h-5 text-forest/30 animate-bounce" />
        </div>
      )}

      {/* Real Local WebP Image */}
      <img
        src={resolvedSrc}
        alt={alt || displayName}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default CropImage;
