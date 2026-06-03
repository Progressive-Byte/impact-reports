import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';

const isElement = (value) => value instanceof Element;

const getCursorTarget = (target) => {
  if (!isElement(target)) return null;
  return target.closest('[data-cursor], [data-cursor-label], a, button, [role="button"], .cursor-pointer');
};

const getTextTarget = (target) => {
  if (!isElement(target)) return null;
  return target.closest('input, textarea, select, [contenteditable="true"]');
};

const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState('default');
  const [label, setLabel] = useState('');
  const [pressed, setPressed] = useState(false);
  const [pulse, setPulse] = useState(null);

  const x = useMotionValue(-999);
  const y = useMotionValue(-999);

  const lastTargetRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.classList.add('has-custom-cursor');
    else root.classList.remove('has-custom-cursor');
    return () => root.classList.remove('has-custom-cursor');
  }, [enabled]);

  const variants = useMemo(() => ({
    default: { w: 36, h: 36, r: 9999, scale: 1 },
    link:    { w: 110, h: 40, r: 9999, scale: 1 },
    cta:     { w: 110, h: 40, r: 9999, scale: 1 },
    focus:   { w: 54,  h: 54, r: 24,   scale: 1 },
  }), []);

  useEffect(() => {
    if (!enabled) return;

    const setFromTarget = (target) => {
      const cursorTarget = getCursorTarget(target);
      const textTarget = getTextTarget(target);

      if (textTarget && !cursorTarget) {
        if (lastTargetRef.current !== textTarget) {
          lastTargetRef.current = textTarget;
          setVariant('default');
          setLabel('');
        }
        setVisible(false);
        return;
      }

      setVisible(true);

      if (!cursorTarget) {
        if (lastTargetRef.current !== null) {
          lastTargetRef.current = null;
          setVariant('default');
          setLabel('');
        }
        return;
      }

      if (lastTargetRef.current === cursorTarget) return;
      lastTargetRef.current = cursorTarget;

      const mode = cursorTarget.getAttribute('data-cursor');
      if (mode === 'hidden') {
        setVisible(false);
        return;
      }

      const customLabel = cursorTarget.getAttribute('data-cursor-label') || '';
      const tag = cursorTarget.tagName?.toLowerCase();
      const role = cursorTarget.getAttribute?.('role');

      if (mode === 'focus') {
        setVariant('focus');
        setLabel(customLabel);
        return;
      }

      if (tag === 'a') {
        setVariant('link');
        setLabel(customLabel || 'OPEN');
        return;
      }

      if (tag === 'button' || role === 'button' || cursorTarget.classList.contains('cursor-pointer')) {
        setVariant('cta');
        setLabel(customLabel || 'CLICK');
        return;
      }

      setVariant('default');
      setLabel(customLabel);
    };

    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setFromTarget(e.target);
    };

    const onEnter = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };

    const onLeave = () => setVisible(false);

    const onDown = (e) => {
      setPressed(true);
      const id = globalThis.crypto?.randomUUID?.() || String(Date.now());
      const px = e?.clientX ?? x.get();
      const py = e?.clientY ?? y.get();
      x.set(px);
      y.set(py);
      setPulse({ id, x: px, y: py });
    };
    const onUp = () => setPressed(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerenter', onEnter);
    window.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const v = variants[variant] || variants.default;
  const showLabel = (variant === 'link' || variant === 'cta') && Boolean(label);
  const expanded = variant === 'link' || variant === 'cta';

  return (
    <>
      {/* FIX 1: always mounted, opacity animates — no teleport-to-origin on mount.
          FIX 2: translateX/Y on the outer style — centering is part of the
                 coordinate system, so hover detection aligns with the visual center. */}
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.12 }}
        className="fixed left-0 top-0 z-[9999] pointer-events-none select-none"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        aria-hidden="true"
      >
        <motion.div
          animate={{
            width: v.w,
            height: v.h,
            borderRadius: v.r,
            scale: pressed ? 0.92 : v.scale,
          }}
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          className="flex items-center justify-center"
        >
          {expanded ? (
            <div className="w-full h-full rounded-[inherit] p-[1px] bg-gradient-to-r from-[#E52321]/85 via-white/20 to-[#E52321]/85 shadow-[0_22px_55px_rgba(229,35,33,0.22)]">
              <div className="w-full h-full rounded-[inherit] bg-[#0B0D0F]/70 backdrop-blur-md border border-white/10 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#E52321]/30 rounded-full blur-[26px]" />
                  <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-white/10 rounded-full blur-[28px]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5" />
                </div>

                <motion.div
                  animate={{ opacity: showLabel ? 1 : 0, y: showLabel ? 0 : 6 }}
                  transition={{ duration: 0.14 }}
                  className="relative z-10 flex items-center gap-2 px-5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E52321]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/90 whitespace-nowrap">
                    {label}
                  </span>
                  <motion.span
                    animate={{ x: pressed ? 0 : 2, opacity: 0.9 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 38 }}
                    className="text-white/80"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full rounded-[inherit] bg-[#E52321]/10 border border-[#E52321]/60 shadow-[0_18px_40px_rgba(229,35,33,0.18)] flex items-center justify-center">
              <motion.div
                animate={{ scale: pressed ? 0.85 : 1 }}
                transition={{ type: 'spring', stiffness: 700, damping: 40 }}
                className="w-2.5 h-2.5 rounded-full bg-[#E52321]"
              />
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Pulse stays separate so it isn't affected by the cursor's opacity */}
      <AnimatePresence>
        {pulse && (
          <motion.div
            key={pulse.id}
            initial={{ opacity: 0.35, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() => setPulse(null)}
            className="fixed left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E52321] pointer-events-none"
            style={{ x: pulse.x, y: pulse.y, width: 54, height: 54 }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomCursor;