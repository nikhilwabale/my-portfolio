'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 30, mass: 0.45 });
  const ringY = useSpring(y, { stiffness: 260, damping: 30, mass: 0.45 });
  const dotX = useSpring(x, { stiffness: 900, damping: 32, mass: 0.18 });
  const dotY = useSpring(y, { stiffness: 900, damping: 32, mass: 0.18 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) return;
    document.body.classList.add('has-pro-cursor');
    const move = (e: MouseEvent) => {
      setVisible(true);
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: Event) => setHovering(Boolean((e.target as Element).closest('a,button,input,textarea,[data-cursor="interactive"]')));
    const leave = () => setVisible(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseleave', leave);
    document.addEventListener('mouseover', over);
    return () => {
      document.body.classList.remove('has-pro-cursor');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseover', over);
    };
  }, [x, y]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block pro-cursor-ring"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 1.65 : 1 }}
        transition={{ duration: 0.18 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden lg:block pro-cursor-core"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0.7 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
