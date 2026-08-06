import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const initials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

// bare=true: renders only inner content — no card shell, no shadow, no glow.
// Used by TestimonialSlider which provides its own unified shell.
const TestimonialCard = ({ testimonial, bare = false }) => {
  const title       = testimonial?.title       || '';
  const body        = testimonial?.body        || '';
  const clientImage = testimonial?.clientImage || '';
  const name        = testimonial?.name        || '';
  const designation = testimonial?.designation || '';
  const address     = testimonial?.address     || '';
  const monogram    = initials(name);

  const content = (
    <div className="relative p-6">
      {/* Header: quote badge + label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-[#E52321]/10 border border-[#E52321]/15 flex items-center justify-center flex-shrink-0">
          <span className="text-[#E52321] font-black select-none font-serif text-[1.6rem] leading-none translate-y-1">
            &ldquo;
          </span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Testimonial</p>
      </div>

      {/* Title */}
      {title && (
        <p className="text-base font-black text-[#0B0D0F] mb-2">{title}</p>
      )}

      {/* Body */}
      {body && (
        <div
          className="rich-text-output text-[15px] font-medium text-[#0B0D0F] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      )}

      {/* Author */}
      {(name || designation || address) && (
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#E52321]/10 border border-[#E52321]/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {clientImage ? (
              <img src={clientImage} alt={name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
            ) : (
              <span className="text-[#E52321] text-xs font-black tracking-wide">
                {monogram || <SafeIcon icon="FiUser" className="text-sm" />}
              </span>
            )}
          </div>
          <div className="min-w-0 text-left">
            {name && <p className="font-black text-[#0B0D0F] text-sm leading-none">{name}</p>}
            {(designation || address) && (
              <p className="mt-1 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                {[designation, address].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (bare) return content;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="relative bg-white rounded-[2rem] border border-gray-100 shadow-[0_18px_50px_rgba(0,0,0,0.05)] overflow-hidden"
    >
      {/* Glow blobs */}
      <div className="pointer-events-none absolute -left-8 top-1/2 -translate-y-1/2 w-36 h-48 rounded-full opacity-25 bg-[radial-gradient(ellipse_at_center,#E52321_0%,transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 w-36 h-48 rounded-full opacity-20 bg-[radial-gradient(ellipse_at_center,#E52321_0%,transparent_70%)] blur-2xl" />
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E52321] via-[#E52321]/60 to-transparent" />
      {content}
    </motion.div>
  );
};

export default TestimonialCard;
