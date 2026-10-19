import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  category?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  category = 'Climate',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(Boolean(src));
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`bg-forest-900/10 border border-forest-800/15 flex flex-col items-center justify-center text-charcoal-800 p-4 relative overflow-hidden select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#143126_1px,transparent_1px)] [background-size:16px_16px]" />
        <ImageOff className="w-8 h-8 text-forest-700/60 mb-2 relative z-10" />
        <span className="text-xs uppercase tracking-wider font-semibold text-forest-800/70 relative z-10">
          {category}
        </span>
        <span className="text-[11px] text-charcoal-800/60 mt-1 relative z-10 italic">
          Archival photography placeholder
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-forest-900/5 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-forest-900/10 animate-pulse flex items-center justify-center">
          <span className="sr-only">Loading photograph...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => { setHasError(true); setIsLoading(false); }}
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};
