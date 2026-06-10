import { useState } from 'react';
import SafeIcon from '../../../../../../common/SafeIcon';

const PlatformConfig = () => {
  const [require2FA, setRequire2FA] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-10 h-10 bg-[#f1f1f3] rounded-xl flex items-center justify-center flex-shrink-0">
          <SafeIcon icon="FiShield" className="text-gray-400 text-base" />
        </div>
        <h3 className="text-sm font-black text-[#0B0D0F]">Platform Configuration</h3>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-green-50 border border-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <SafeIcon icon="FiLock" className="text-green-600 text-base" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#0B0D0F]">Require 2FA</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Global enforcement · all staff accounts</p>
          </div>
        </div>
        <button
          onClick={() => setRequire2FA(v => !v)}
          className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ml-3 ${
            require2FA ? 'bg-green-500' : 'bg-gray-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              require2FA ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4">
        <button className="text-[#E52321] text-xs font-black hover:underline w-full text-center">
          Manage In Settings →
        </button>
      </div>
    </div>
  );
};

export default PlatformConfig;
