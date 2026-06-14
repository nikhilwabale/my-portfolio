'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ScrollToTop() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 650);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <motion.div className="top-scroll-progress" style={{ scaleX: progress }} />
      <motion.button
        type="button"
        aria-label="Scroll to top"
        className="scroll-top-button scroll-top-v14"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={false}
        animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.85 }}
        whileHover={{ y: -3, scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="scroll-progress-ring" viewBox="0 0 60 60" aria-hidden="true">
          <circle className="scroll-progress-track" cx="30" cy="30" r="26" />
          <motion.circle className="scroll-progress-fill" cx="30" cy="30" r="26" pathLength={progress} />
        </svg>
        <span className="scroll-top-inner"><ChevronUp size={20} /></span>
      </motion.button>
    </>
  );
}
