'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header, Footer } from './Header';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Preloader } from '@/components/ui/Preloader';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export function PageShell({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1850);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <CustomCursor />
      <AnimatePresence mode="wait">{loading && <Preloader />}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.55, delay: loading ? 0 : 0.1 }}
      >
        <Header />
        {children}
        <Footer />
        <ScrollToTop />
      </motion.div>
    </>
  );
}
