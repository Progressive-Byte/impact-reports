import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import { getEmbedUrl } from '../../../../utils/videoUtils';

const MediaLightbox = ({ media, title, onClose }) => (
  <AnimatePresence>
    {media && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8 md:p-12 cursor-zoom-out"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-7xl max-h-full w-full flex items-center justify-center cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 sm:-top-4 sm:-right-12 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors group"
          >
            <SafeIcon icon="FiX" className="text-2xl group-hover:rotate-90 transition-transform" />
          </button>

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

          <div className="absolute -bottom-12 left-0 right-0 text-center">
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em]">
              {media.type === 'video' ? 'Field Footage' : 'On-Site Documentation'}
              {title ? ` • ${title}` : ''}
            </p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MediaLightbox;
