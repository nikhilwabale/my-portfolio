'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function MagneticCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className={`glass-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
