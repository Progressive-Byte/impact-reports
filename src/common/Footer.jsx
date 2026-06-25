import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from './SafeIcon';

const LogoIcon = ({ className = "w-10 h-10" }) => (
  <div className={`${className} rounded-full flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/10 overflow-hidden bg-white border border-gray-100 relative`}>
    <img src="https://media-manager-c.questera.ai/greta-media/89a4c5054b952da31823a698574da50f94645c57fede58bf38e1dc553a5f65aa2a5866630191987f5de6ebb268aeb9b2/images/aW1hZ2UvcG5n/236c9d88c2db247a8226fc26d4a8c574.png" alt="Human Concern Logo" className="w-full h-full object-cover" />
  </div>
);

const SOCIAL_CONFIG = [
  { key: 'facebook',  icon: 'FiFacebook'  },
  { key: 'twitter',   icon: 'FiTwitter'   },
  { key: 'instagram', icon: 'FiInstagram' },
  { key: 'linkedin',  icon: 'FiLinkedin'  },
  { key: 'youtube',   icon: 'FiYoutube'   },
];

const Footer = () => {
  const [email,       setEmail]       = useState('');
  const [status,      setStatus]      = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message,     setMessage]     = useState('');
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    fetch('/api/config/social-links')
      .then(r => r.json())
      .then(data => setSocialLinks(data || {}))
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribers/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You\'re subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Subscription failed.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-200 mt-auto shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
          <div className="pr-4">
            <div className="flex items-center space-x-3 mb-6">
              <LogoIcon />
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tighter text-black uppercase leading-none">
                  Impact Reports
                </span>
                <span className="font-bold text-[9px] tracking-[0.1em] text-gray-400 uppercase leading-none mt-1">
                  Human Concern USA
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              Fighting poverty for 46 years. HUMAN CONCERN USA is a 501(C)3 Tax Exempt Nonprofit.
            </p>
          </div>
          <div>
            <h3 className="text-[22px] font-bold text-black mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-4 text-gray-600 hover:text-black transition-all duration-300 cursor-default group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <SafeIcon icon="FiMail" className="text-black text-lg stroke-[2.5]" />
                </div>
                <span className="text-[15px]">
                  <a target="_blank" href="mailto:info@humanconcernusa.org">info@humanconcernusa.org</a>
                </span>
              </li>
              <li className="flex items-center space-x-4 text-gray-600 hover:text-black transition-all duration-300 cursor-default group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <SafeIcon icon="FiPhone" className="text-black text-lg stroke-[2.5]" />
                </div>
                <span className="text-[15px]">1-800-583-5841</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[22px] font-bold text-black mb-6">Stay Connected</h3>
            <div className="mb-6">
              {status === 'success' ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-full px-5 py-4">
                  <SafeIcon icon="FiCheckCircle" className="text-green-500 text-lg flex-shrink-0" />
                  <span className="text-[14px] font-bold text-green-700">{message}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <div className="relative group">
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setStatus('idle'); setMessage(''); }}
                      placeholder="Enter your email"
                      className="w-full border border-gray-200 rounded-full px-6 py-4 text-[15px] focus:outline-none focus:border-[#E52321] transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading' || !email.trim()}
                      data-cursor-label="JOIN"
                      className="absolute right-2 top-2 bottom-2 bg-black hover:bg-[#E52321] text-white rounded-full px-6 text-[13px] font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? '…' : 'Join'}
                    </button>
                  </div>
                  {status === 'error' && (
                    <p className="text-xs text-red-500 font-medium mt-2 px-2">{message}</p>
                  )}
                </form>
              )}
            </div>
            {SOCIAL_CONFIG.some(s => socialLinks[s.key]) && (
              <div className="flex items-center justify-center space-x-6 mt-6">
                {SOCIAL_CONFIG.filter(s => socialLinks[s.key]).map(s => (
                  <a
                    key={s.key}
                    href={socialLinks[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E52321] hover:text-[#C91D1B] hover:scale-110 transition-all duration-300"
                  >
                    <SafeIcon icon={s.icon} className="text-[22px]" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-8 text-center mt-4">
          <p className="text-gray-400 font-medium text-[13px] tracking-wide uppercase">
            Copyright &copy;2026 Human Concern USA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
