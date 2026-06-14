export const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0 } };
export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
export const scaleIn = { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1 } };
export const slideLeft = { hidden: { opacity: 0, x: -36 }, show: { opacity: 1, x: 0 } };
export const slideRight = { hidden: { opacity: 0, x: 36 }, show: { opacity: 1, x: 0 } };
export const spring = { type: 'spring', stiffness: 120, damping: 18 };
