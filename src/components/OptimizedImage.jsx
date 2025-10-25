import React from 'react';

const OptimizedImage = ({ src, alt, className, loading = 'lazy', ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
};

export default OptimizedImage;
