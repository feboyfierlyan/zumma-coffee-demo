import React from 'react';
import { motion } from 'framer-motion';

export default function Skeleton({ width, height, borderRadius = '12px', style }) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 0.8,
        ease: 'easeInOut'
      }}
      style={{
        width: width || '100%',
        height: height || '100%',
        borderRadius: borderRadius,
        backgroundColor: 'var(--border)', // Using existing border color for a subtle gray
        ...style
      }}
    />
  );
}
