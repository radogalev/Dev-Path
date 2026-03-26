import { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, label, [role="button"], [data-cursor="hover"]';
const TEXT_CURSOR_SELECTOR = 'input, textarea, [contenteditable="true"], [contenteditable=""], [role="textbox"]';

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [pressed, setPressed] = useState(false);

  const innerSize = useMemo(() => (pressed ? 6 : 8), [pressed]);
  const ringSize = useMemo(() => (hovering ? 42 : 34), [hovering]);

  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);

  const dotX = useSpring(pointerX, { stiffness: 900, damping: 42, mass: 0.25 });
  const dotY = useSpring(pointerY, { stiffness: 900, damping: 42, mass: 0.25 });
  const ringX = useSpring(pointerX, { stiffness: 260, damping: 30, mass: 0.9 });
  const ringY = useSpring(pointerY, { stiffness: 260, damping: 30, mass: 0.9 });

  useEffect(() => {
    const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(supportsFinePointer && !prefersReducedMotion);
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('custom-cursor-enabled');
      return undefined;
    }

    document.documentElement.classList.add('custom-cursor-enabled');

    const handleMove = (event) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      const target = event.target;
      if (target instanceof Element) {
        const explicitTextTarget = Boolean(target.closest(TEXT_CURSOR_SELECTOR));
        const computedCursor = window.getComputedStyle(target).cursor;
        const isTextCursor = explicitTextTarget || computedCursor === 'text' || computedCursor === 'vertical-text';
        setTextMode(isTextCursor);
        setHovering(Boolean(target.closest(INTERACTIVE_SELECTOR)));
      }
    };

    const handleDown = () => setPressed(true);
    const handleUp = () => setPressed(false);
    const handleLeave = () => {
      pointerX.set(-100);
      pointerY.set(-100);
      setHovering(false);
      setTextMode(false);
      setPressed(false);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('mouseup', handleUp, { passive: true });
    window.addEventListener('mouseleave', handleLeave, { passive: true });

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled');
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, [enabled, pointerX, pointerY]);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[9999] rounded-full border border-emerald-300/80 bg-emerald-400/10 pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
        }}
        animate={{
          opacity: textMode ? 0 : hovering ? 1 : 0.92,
          scale: pressed ? 0.9 : 1,
        }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      />
      <motion.div
        aria-hidden="true"
        className="fixed left-0 top-0 z-[10000] rounded-full bg-emerald-300 pointer-events-none shadow-[0_0_16px_rgba(74,222,128,0.65)]"
        style={{
          x: dotX,
          y: dotY,
          width: innerSize,
          height: innerSize,
          marginLeft: -(innerSize / 2),
          marginTop: -(innerSize / 2),
        }}
        animate={{
          opacity: textMode ? 0 : 1,
          scale: hovering ? 1.22 : 1,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </>
  );
}