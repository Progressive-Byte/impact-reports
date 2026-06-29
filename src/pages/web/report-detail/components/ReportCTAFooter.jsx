import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const normalizeUrl = (url) => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const SOCIALS = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'FiFacebook',
    color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
    build: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'FiLinkedin',
    color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300',
    build: (url, text) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    icon: 'FiTwitter',
    color: 'hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300',
    build: (url, text) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'FiMessageCircle',
    color: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200',
    build: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
];

const ReportCTAFooter = ({ donationUrl, slug, projectName, hiddenFields }) => {
  const donationHidden = hiddenFields?.has ? hiddenFields.has('donationUrl') : (hiddenFields || []).includes('donationUrl');
  const href    = !donationHidden ? normalizeUrl(donationUrl) : '';
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef(null);

  const shareUrl  = `${window.location.origin}/report/${slug || ''}`;
  const shareText = projectName ? `${projectName} — Impact Report` : 'Impact Report';

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocial = (social) => {
    window.open(social.build(shareUrl, shareText), '_blank', 'noopener,noreferrer,width=620,height=520');
  };

  return (
    <footer className="bg-white rounded-[2.5rem] p-10 md:p-14 text-left relative shadow-[0_18px_50px_rgba(0,0,0,0.06)] border border-gray-100">
      {/* Blob wrapper — overflow-hidden clips decorative blobs to the card boundary,
          preventing them from causing horizontal page overflow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E52321]/10 rounded-full blur-[90px]" />
        <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-black/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left — copy */}
        <div className="lg:col-span-8 flex items-start gap-4">
          <motion.div
            animate={{
              scale: [1, 1.22, 1, 1.12, 1],
              boxShadow: [
                '0 4px 14px rgba(229,35,33,0.30)',
                '0 8px 28px rgba(229,35,33,0.65)',
                '0 4px 14px rgba(229,35,33,0.30)',
                '0 6px 20px rgba(229,35,33,0.50)',
                '0 4px 14px rgba(229,35,33,0.30)',
              ],
            }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              repeatDelay: 0.7,
              ease: 'easeInOut',
              times: [0, 0.14, 0.28, 0.42, 0.70],
            }}
            className="w-12 h-12 rounded-2xl bg-[#E52321] text-white flex items-center justify-center flex-shrink-0"
          >
            <SafeIcon icon="FiHeart" className="text-2xl" />
          </motion.div>
          <div>
            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight">Support This Mission</h3>
            <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Your partnership allows our teams to remain on the ground and expand our reach to those who need it most.
            </p>
          </div>
        </div>

        {/* Right — actions */}
        <div className="lg:col-span-4 flex flex-col gap-3" ref={wrapperRef}>
          {/* Donate Now */}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center bg-[#E52321] hover:bg-[#C91D1B] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
            >
              Donate Now
            </a>
          ) : (
            <button disabled className="w-full bg-gray-200 text-gray-400 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] cursor-not-allowed">
              Donate Now
            </button>
          )}

          {/* Share Report toggle — dropdown anchor */}
          <div className="relative">
            <button
              onClick={() => setOpen(v => !v)}
              className={`w-full flex items-center justify-center gap-2 border px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-colors ${
                open
                  ? 'bg-gray-50 border-gray-300 text-[#0B0D0F]'
                  : 'bg-white border-gray-200 text-[#0B0D0F] hover:border-[#E52321]/40 hover:text-[#E52321]'
              }`}
            >
              <SafeIcon icon={open ? 'FiChevronUp' : 'FiShare2'} className="text-sm" />
              {open ? 'Close' : 'Share Report'}
            </button>

            {/* Floating dropdown — overflows the card */}
            <AnimatePresence>
              {open && (
                <motion.div
                  key="share-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4"
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Share via</p>

                  {/* 2×2 social grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {SOCIALS.map(social => (
                      <button
                        key={social.id}
                        onClick={() => handleSocial(social)}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-200 bg-white text-gray-500 text-xs font-bold transition-all ${social.color}`}
                      >
                        <SafeIcon icon={social.icon} className="text-xl" />
                        {social.label}
                      </button>
                    ))}
                  </div>

                  {/* Copy link */}
                  <button
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      copied
                        ? 'border-green-200 bg-green-50 text-green-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <SafeIcon icon={copied ? 'FiCheck' : 'FiLink'} className="text-sm" />
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ReportCTAFooter;
