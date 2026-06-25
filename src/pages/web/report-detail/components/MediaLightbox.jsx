import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import { getEmbedUrl } from '../../../../utils/videoUtils';

const MediaLightbox = ({ mediaList = [], currentIndex, title, onClose, onNavigate }) => {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < mediaList.length;
  const media   = isOpen ? mediaList[currentIndex] : null;
  const hasPrev = isOpen && currentIndex > 0;
  const hasNext = isOpen && currentIndex < mediaList.length - 1;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft'  && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, currentIndex, hasPrev, hasNext, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8 md:p-12 cursor-zoom-out"
          onClick={onClose}
        >
          {/* Prev arrow */}
          <AnimatePresence>
            {hasPrev && (
              <motion.button
                key="prev"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
                className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <SafeIcon icon="FiChevronLeft" className="text-2xl" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Next arrow */}
          <AnimatePresence>
            {hasNext && (
              <motion.button
                key="next"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <SafeIcon icon="FiChevronRight" className="text-2xl" />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.div
            key={currentIndex}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-7xl max-h-full w-full flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 sm:-top-4 sm:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors group"
            >
              <SafeIcon icon="FiX" className="text-2xl group-hover:rotate-90 transition-transform" />
            </button>

            {/* Media */}
            {media.type === 'video' ? (() => {
              const embedUrl = getEmbedUrl(media.url);
              return embedUrl ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Field footage"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <video src={media.url} controls autoPlay className="w-full h-full" />
                </div>
              );
            })() : (
              <img
                src={media.url}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
                alt="Documentation"
              />
            )}

            {/* Caption + counter */}
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">
                {media.type === 'video' ? 'Field Footage' : 'On-Site Documentation'}
                {title ? ` • ${title}` : ''}
              </p>
              {mediaList.length > 1 && (
                <p className="text-white/30 text-[10px] mt-1 font-medium tracking-widest">
                  {currentIndex + 1} / {mediaList.length}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaLightbox;
