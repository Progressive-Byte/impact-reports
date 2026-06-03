import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const RED = '#E52321';
const TRAIL_COUNT = 10;

const getCursorTarget = (el) => {
  if (!(el instanceof Element)) return null;
  return el.closest('[data-cursor], [data-cursor-label], a, button, [role="button"], .cursor-pointer');
};
const getTextTarget = (el) => {
  if (!(el instanceof Element)) return null;
  return el.closest('input, textarea, select, [contenteditable="true"]');
};

function spawnPulse(container, px, py) {
  for (let i = 0; i < 3; i++) {
    const sz = 40 + i * 20;
    const p = document.createElement('div');
    p.style.cssText = `
      position: fixed; left: 0; top: 0;
      width: ${sz}px; height: ${sz}px;
      border-radius: 50%;
      border: 1px solid ${RED};
      pointer-events: none; opacity: 0;
      transform: translate(${px - sz / 2}px, ${py - sz / 2}px) scale(1);
    `;
    container.appendChild(p);
    setTimeout(() => {
      p.style.opacity = '0.5';
      p.style.transition = 'none';
      requestAnimationFrame(() => {
        p.style.transition = `transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.6s ease`;
        p.style.transform = `translate(${px - sz / 2}px, ${py - sz / 2}px) scale(2.2)`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 700);
    }, i * 80);
  }
}

function useTrail(containerRef) {
  const trailRef = useRef([]);
  const posRef = useRef(Array.from({ length: TRAIL_COUNT }, () => ({ x: -999, y: -999 })));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const dots = [];
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const d = document.createElement('div');
      d.style.cssText = `
        position: fixed; left: 0; top: 0; border-radius: 50%;
        pointer-events: none; will-change: transform;
        background: ${RED}; opacity: 0;
      `;
      container.appendChild(d);
      dots.push(d);
    }
    trailRef.current = dots;
    return () => dots.forEach((d) => d.remove());
  }, []);

  const updateTrail = (cx, cy, opacity, pressed) => {
    const pos = posRef.current;
    pos[0] = { x: cx, y: cy };
    for (let i = 1; i < TRAIL_COUNT; i++) {
      pos[i] = {
        x: pos[i].x + (pos[i - 1].x - pos[i].x) * 0.36,
        y: pos[i].y + (pos[i - 1].y - pos[i].y) * 0.36,
      };
    }
    trailRef.current.forEach((dot, i) => {
      const p = pos[i];
      const progress = i / TRAIL_COUNT;
      const sz = Math.max(1, 8 * (1 - progress) * opacity);
      const op = Math.max(0, 0.28 * (1 - progress) * (pressed ? 1.6 : 1) * opacity);
      dot.style.transform = `translate(${(p.x - sz / 2).toFixed(1)}px, ${(p.y - sz / 2).toFixed(1)}px)`;
      dot.style.width = `${sz.toFixed(1)}px`;
      dot.style.height = `${sz.toFixed(1)}px`;
      dot.style.opacity = op.toFixed(3);
    });
  };

  return updateTrail;
}

const CursorLabel = ({ label }) => (
  <motion.div
    initial={{ opacity: 0, y: 6, scale: 0.92 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 6, scale: 0.92 }}
    transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
    style={{
      position: 'absolute',
      left: '50%',
      bottom: 'calc(100% + 14px)',
      x: '-50%',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'rgba(255,255,255,0.92)',
        border: '0.5px solid rgba(0,0,0,0.10)',
        borderRadius: 100,
        padding: '5px 13px 5px 11px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, flexShrink: 0, display: 'block' }} />
      <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.07em', color: 'rgba(0,0,0,0.5)', textTransform: 'lowercase' }}>
        {label}
      </span>
    </div>
  </motion.div>
);

const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState('default');
  const [label, setLabel] = useState('');
  const [pressed, setPressed] = useState(false);

  const containerRef = useRef(null);
  const lastTargetRef = useRef(null);
  const rawPos = useRef({ x: -999, y: -999 });
  const cursorPos = useRef({ x: -999, y: -999 });
  const opacityRef = useRef(0);
  const stateRef = useRef({ variant: 'default', pressed: false, visible: false });
  const rafRef = useRef(null);

  const ringElRef = useRef(null);
  const dotElRef = useRef(null);
  const ringW = useRef(34); const ringWv = useRef(0);
  const ringH = useRef(34); const ringHv = useRef(0);
  const ringRad = useRef(9999); const ringRadv = useRef(0);
  const dotScale = useRef(1); const dotScalev = useRef(0);

  const updateTrail = useTrail(containerRef);

  const sp = (cur, target, vel, stiff, damp, dt) => {
    const f = -(cur - target) * stiff - vel * damp;
    const nv = vel + f * dt;
    return { val: cur + nv * dt, vel: nv };
  };

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

  useEffect(() => {
    stateRef.current = { variant, pressed, visible };
  }, [variant, pressed, visible]);

  useEffect(() => {
    if (!enabled) return;
    const DT = 1 / 60;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const { variant: v, pressed: pr, visible: vis } = stateRef.current;

      // Direct follow — no magnetic offset
      cursorPos.current.x += (rawPos.current.x - cursorPos.current.x) * 0.18;
      cursorPos.current.y += (rawPos.current.y - cursorPos.current.y) * 0.18;

      const tW = v === 'hover' ? 46 : v === 'focus' ? 54 : 34;
      const tH = v === 'hover' ? 46 : v === 'focus' ? 54 : 34;
      const tRad = v === 'focus' ? 14 : 9999;
      const tOp = vis ? 1 : 0;
      const tDot = pr ? 0.55 : 1;

      const wS = sp(ringW.current, tW, ringWv.current, 500, 30, DT);
      ringW.current = wS.val; ringWv.current = wS.vel;
      const hS = sp(ringH.current, tH, ringHv.current, 500, 30, DT);
      ringH.current = hS.val; ringHv.current = hS.vel;
      const radS = sp(ringRad.current, tRad, ringRadv.current, 280, 26, DT);
      ringRad.current = radS.val; ringRadv.current = radS.vel;
      const opS = sp(opacityRef.current, tOp, 0, 320, 28, DT);
      opacityRef.current = opS.val;
      const dS = sp(dotScale.current, tDot, dotScalev.current, 700, 38, DT);
      dotScale.current = dS.val; dotScalev.current = dS.vel;

      const ring = ringElRef.current;
      const dot = dotElRef.current;
      if (ring) {
        const hw = ringW.current / 2;
        const hh = ringH.current / 2;
        ring.style.transform = `translate(${(cursorPos.current.x - hw).toFixed(1)}px, ${(cursorPos.current.y - hh).toFixed(1)}px)`;
        ring.style.width = `${ringW.current.toFixed(1)}px`;
        ring.style.height = `${ringH.current.toFixed(1)}px`;
        ring.style.opacity = opacityRef.current.toFixed(3);
        ring.style.borderRadius = ringRad.current > 100 ? '9999px' : `${ringRad.current.toFixed(1)}px`;
      }
      if (dot) {
        dot.style.transform = `scale(${dotScale.current.toFixed(3)})`;
      }

      updateTrail(cursorPos.current.x, cursorPos.current.y, opacityRef.current, pr);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, updateTrail]);

  useEffect(() => {
    if (!enabled) return;

    const setFromTarget = (el) => {
      const tt = getTextTarget(el);
      const ct = getCursorTarget(el);
      if (tt && !ct) { setVisible(false); setVariant('default'); setLabel(''); return; }
      setVisible(true);
      if (!ct) {
        if (lastTargetRef.current !== null) { lastTargetRef.current = null; setVariant('default'); setLabel(''); }
        return;
      }
      if (lastTargetRef.current === ct) return;
      lastTargetRef.current = ct;
      const mode = ct.getAttribute('data-cursor');
      if (mode === 'hidden') { setVisible(false); return; }
      const cl = ct.getAttribute('data-cursor-label') || '';
      const tag = ct.tagName?.toLowerCase();
      const role = ct.getAttribute?.('role');
      if (mode === 'focus') { setVariant('focus'); setLabel(cl); return; }
      if (tag === 'a') { setVariant('hover'); setLabel(cl || 'open'); return; }
      if (tag === 'button' || role === 'button' || ct.classList.contains('cursor-pointer')) {
        setVariant('hover'); setLabel(cl || 'click'); return;
      }
      setVariant('default'); setLabel(cl);
    };

    const onMove = (e) => {
      rawPos.current = { x: e.clientX, y: e.clientY };
      setFromTarget(document.elementFromPoint(e.clientX, e.clientY));
    };
    const onEnter = (e) => { rawPos.current = { x: e.clientX, y: e.clientY }; setVisible(true); };
    const onLeave = () => setVisible(false);
    const onDown = (e) => {
      setPressed(true);
      if (containerRef.current) spawnPulse(containerRef.current, e.clientX, e.clientY);
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
  }, [enabled]);

  if (!enabled) return null;

  const showLabel = variant === 'hover' && Boolean(label);

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }} aria-hidden="true">
      <div
        ref={ringElRef}
        style={{
          position: 'fixed', left: 0, top: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          willChange: 'transform, width, height',
          border: `1px solid rgba(229,35,33,0.32)`,
          background: 'rgba(229,35,33,0.05)',
        }}
      >
        <AnimatePresence>
          {showLabel && <CursorLabel label={label} key={label} />}
        </AnimatePresence>

        <div
          ref={dotElRef}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: RED, flexShrink: 0, willChange: 'transform',
          }}
        />
      </div>
    </div>
  );
};

export default CustomCursor;