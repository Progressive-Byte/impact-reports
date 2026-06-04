import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';

const DemographicRow = ({ label, percentage, icon, color }) => (
  <div className="text-left">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
          <SafeIcon icon={icon} className="text-gray-500 text-sm" />
        </div>
        <span className="text-sm font-black text-gray-700 truncate">{label}</span>
      </div>
      <span className="text-sm font-black text-[#0B0D0F] flex-shrink-0">{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${percentage}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.0 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);

export default DemographicRow;
