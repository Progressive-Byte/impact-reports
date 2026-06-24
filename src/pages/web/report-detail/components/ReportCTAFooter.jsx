import { useState, useRef, useEffect } from 'react';
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
    build: (url, text) =>
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

const ReportCTAFooter = ({ donationUrl, slug, projectName }) => {
  const href       = normalizeUrl(donationUrl);
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef(null);

  const shareUrl  = `${window.location.origin}/report/${slug || ''}`;
  const shareText = projectName ? `${projectName} — Impact Report` : 'Impact Report';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocial = (social) => {
    window.open(social.build(shareUrl, shareText), '_blank', 'noopener,noreferrer,width=600,height=500');
    setOpen(false);
  };

  return (
    <footer className="bg-white rounded-[2.5rem] p-10 md:p-14 text-left relative shadow-[0_18px_50px_rgba(0,0,0,0.06)] border border-gray-100">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E52321]/10 rounded-full blur-[90px]" />
      <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-black/5 rounded-full blur-[100px]" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E52321] text-white flex items-center justify-center flex-shrink-0">
            <SafeIcon icon="FiHeart" className="text-2xl" />
          </div>
          <div>
            <h3 className="mt-1 text-2xl sm:text-3xl font-black text-[#0B0D0F] tracking-tight">Support This Mission</h3>
            <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Your partnership allows our teams to remain on the ground and expand our reach to those who need it most.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
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

          {/* Share button + popover */}
          <div className="relative w-full" ref={panelRef}>
            <button
              onClick={() => setOpen(v => !v)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-[#0B0D0F] hover:border-[#E52321]/40 hover:text-[#E52321] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-colors"
            >
              <SafeIcon icon="FiShare2" className="text-sm" />
              Share Report
            </button>

            {open && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-50">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Share via</p>

                {/* 2×2 grid of social buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {SOCIALS.map(social => (
                    <button
                      key={social.id}
                      onClick={() => handleSocial(social)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-gray-100 text-gray-500 text-xs font-bold transition-all ${social.color}`}
                    >
                      <SafeIcon icon={social.icon} className="text-xl" />
                      {social.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCopy}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    copied
                      ? 'border-green-200 bg-green-50 text-green-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <SafeIcon icon={copied ? 'FiCheck' : 'FiLink'} className="text-sm" />
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ReportCTAFooter;
