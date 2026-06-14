'use client';

import { useEffect, useState } from 'react';

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? 'home');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 }
      );
      observer.observe(element);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}
