import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from './Skeleton';

export default function ImageWithSkeleton({ src, alt, style, skeletonBorderRadius = '12px' }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div style={{ position: 'relative', width: style?.width || '100%', height: style?.height || '100%' }}>
      {/* Skeleton overlay */}
      <AnimatePresence>
        {!isLoaded && !failed && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          >
            <Skeleton width="100%" height="100%" borderRadius={skeletonBorderRadius} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graceful fallback if the image fails to load */}
      {failed ? (
        <div
          aria-label={alt}
          role="img"
          style={{
            ...style, position: 'absolute', inset: 0, width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--surface-2), var(--surface-1))',
            color: 'var(--text-secondary)', fontSize: '22px', fontWeight: 700,
          }}
        >
          {(alt || '?').charAt(0).toUpperCase()}
        </div>
      ) : (
        <motion.img
          src={src}
          alt={alt}
          style={{ ...style, position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onLoad={() => setIsLoaded(true)}
          onError={() => { setFailed(true); setIsLoaded(true); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          loading="lazy"
        />
      )}
    </div>
  );
}
