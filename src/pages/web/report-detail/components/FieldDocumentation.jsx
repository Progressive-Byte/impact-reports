import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';
import { getYoutubeThumbnail, getVimeoId, getVideoType } from '../../../../utils/videoUtils';

// Renders a thumbnail for any video URL: YouTube (instant), Vimeo (async oEmbed fetch)
const VideoThumbnail = ({ url, onError, className }) => {
  const [src, setSrc] = useState(() => getYoutubeThumbnail(url));

  useEffect(() => {
    const vimeoId = getVimeoId(url);
    if (!vimeoId) return;
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`)
      .then((r) => r.json())
      .then((data) => { if (data.thumbnail_url) setSrc(data.thumbnail_url); })
      .catch(() => {});
  }, [url]);

  if (!src) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`}>
        <SafeIcon icon="FiVideo" className="text-white/20 text-5xl" />
      </div>
    );
  }

  return <img src={src} onError={onError} className={className} alt="Video thumbnail" />;
};

const FieldDocumentation = ({ fieldReports, onImageError, onMediaSelect }) => {
  if (!fieldReports.length) return null;

  const featured   = fieldReports[0];
  const secondary  = fieldReports.slice(1, 3);
  const isVideo    = (item) => item.type === 'video' || getVideoType(item.url) !== null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_18px_50px_rgba(0,0,0,0.05)] border border-gray-100"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B0D0F] text-white flex items-center justify-center flex-shrink-0">
            <SafeIcon icon="FiCamera" className="text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight text-left uppercase">Field Documentation</h2>
            <p className="text-gray-500 mt-1 text-left text-sm">Verified visual evidence from our active ground teams.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 self-start md:self-auto">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Featured item */}
        <div
          className="lg:w-2/3 relative rounded-2xl overflow-hidden min-h-[300px] md:min-h-[450px] group cursor-pointer shadow-lg"
          data-cursor-label={featured.type === 'video' ? 'PLAY' : 'VIEW'}
          onClick={() => onMediaSelect(featured)}
        >
          {featured.type === 'video' ? (
            <VideoThumbnail
              url={featured.url}
              onError={onImageError}
              className="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          ) : (
            <img
              src={featured.url}
              alt="Feature field"
              onError={onImageError}
              className="w-full h-full absolute inset-0 object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
              <SafeIcon
                icon={featured.type === 'video' ? 'FiPlay' : 'FiMaximize2'}
                className="text-white text-3xl ml-0.5"
              />
            </div>
          </div>
        </div>

        {/* Secondary thumbnails */}
        {secondary.length > 0 && (
          <div className="lg:w-1/3 grid grid-cols-2 lg:grid-cols-1 gap-5">
            {secondary.map((fr, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden shadow-md h-full min-h-[140px] cursor-pointer group"
                data-cursor-label={fr.type === 'video' ? 'PLAY' : 'VIEW'}
                onClick={() => onMediaSelect(fr)}
              >
                {fr.type === 'video' ? (
                  <>
                    <VideoThumbnail
                      url={fr.url}
                      onError={onImageError}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <SafeIcon icon="FiPlay" className="text-white text-2xl" />
                    </div>
                  </>
                ) : (
                  <img
                    src={fr.url}
                    onError={onImageError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt=""
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default FieldDocumentation;
