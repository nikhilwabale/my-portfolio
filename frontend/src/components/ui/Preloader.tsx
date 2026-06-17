'use client';

import { motion } from 'framer-motion';

export function Preloader() {
  return (
    <motion.div
      className="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: '-100%' }}
      transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
    >
      <motion.div className="preloader-grid" />
      <motion.div
        className="preloader-mark"
        initial={{ scale: 0.86, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <motion.div
          className="preloader-ring"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />
        <span>NW</span>
      </motion.div>
      <motion.p
        className="preloader-text"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.45 }}
      >
        Welcome to Nikhil Wabale Portfolio
      </motion.p>
      <motion.div className="preloader-bar" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.45, ease: 'easeInOut' }} />
    </motion.div>
  );
}
