import React from 'react';
import SafeIcon from '../../../../common/SafeIcon';

const normalizeUrl = (url) => {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const ReportCTAFooter = ({ donationUrl }) => {
  const href = normalizeUrl(donationUrl);
  return (
  <footer className="bg-white rounded-[2.5rem] p-10 md:p-14 text-left relative overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.06)] border border-gray-100">
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
        <button className="w-full bg-white border border-gray-200 text-[#0B0D0F] hover:border-[#E52321]/30 hover:text-[#E52321] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] transition-colors">
          Share Report
        </button>
      </div>
    </div>
  </footer>
  );
};

export default ReportCTAFooter;
