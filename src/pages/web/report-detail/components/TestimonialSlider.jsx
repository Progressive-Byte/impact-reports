import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TestimonialCard from './TestimonialCard';

const variants = {
  enter:  (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center:           { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

const TestimonialSlider = ({ testimonials }) => {
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);

  if (!testimonials?.length) return null;

  // Single testimonial — render the full card as-is, no slider chrome
  if (testimonials.length === 1) return <TestimonialCard testimonial={testimonials[0]} />;

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => goTo(current === 0 ? testimonials.length - 1 : current - 1);
  const next = () => goTo(current === testimonials.length - 1 ? 0 : current + 1);

  // Touch swipe (mobile)
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 40) { touchStartX.current = null; return; }
    if (delta < 0) next();
    else prev();
    touchStartX.current = null;
  };

  return (
    // Unified card shell — same radius/bg/border/shadow as a single TestimonialCard
    <div className="relative bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden">

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -left-8 top-1/3 -translate-y-1/2 w-36 h-48 rounded-full opacity-25 bg-[radial-gradient(ellipse_at_center,#E52321_0%,transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-8 top-1/3 -translate-y-1/2 w-36 h-48 rounded-full opacity-20 bg-[radial-gradient(ellipse_at_center,#E52321_0%,transparent_70%)] blur-2xl" />

      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E52321] via-[#E52321]/60 to-transparent" />

      {/* Slide area — swipeable on mobile */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <TestimonialCard testimonial={testimonials[current]} bare />
        </motion.div>
      </AnimatePresence>

      {/* Controls — docked inside the same card shell */}
      <div className="border-t border-gray-100 flex items-center justify-between px-6 py-3">
        <span className="text-[10px] font-bold text-gray-400 tabular-nums">
          {current + 1} / {testimonials.length}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#E52321] hover:bg-[#E52321]/8 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Testimonial ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-5 h-2 bg-[#E52321]'
                    : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="Next testimonial"
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-[#E52321] hover:bg-[#E52321]/8 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
