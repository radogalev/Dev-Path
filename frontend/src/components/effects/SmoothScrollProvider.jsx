import { useEffect } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';

export default function SmoothScrollProvider() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.4,
      smoothWheel: true,
      wheelMultiplier: 0.7,
      touchMultiplier: 1.1,
      lerp: 0.08,
    });

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    const scrollToTop = () => {
      lenis.scrollTo(0, {
        immediate: true,
        force: true,
      });
    };

    rafId = window.requestAnimationFrame(raf);
    scrollToTop();
    window.addEventListener('app:scroll-to-top', scrollToTop);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('app:scroll-to-top', scrollToTop);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}