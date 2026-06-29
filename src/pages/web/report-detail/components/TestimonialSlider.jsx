import { useState } from 'react';
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

  // Single testimonial — no slider chrome needed
  if (testimonials.length === 1) return <TestimonialCard testimonial={testimonials[0]} />;

  const goTo = (index) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => goTo(current === 0 ? testimonials.length - 1 : current - 1);
  const next = () => goTo(current === testimonials.length - 1 ? 0 : current + 1);

  return (
    <div>
      {/* Slide area */}
      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          >
            <TestimonialCard testimonial={testimonials[current]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls: prev · dots · next */}
      <div className="flex items-center justify-center gap-3 mt-4">
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
              aria-label={`Go to testimonial ${i + 1}`}
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

      {/* Counter */}
      <p className="text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-2">
        {current + 1} / {testimonials.length}
      </p>
    </div>
  );
};

export default TestimonialSlider;
