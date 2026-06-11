import { useMemo } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const MetricsStrip = ({ stats }) => {
  const metrics = useMemo(() => [
    {
      label: 'Countries Supported',
      value: stats.totalCountries > 0 ? `${stats.totalCountries}+` : '—',
      icon: 'FiGlobe',
      description: 'Active across major regions',
    },
    {
      label: 'Projects Delivered',
      value: stats.totalProjects > 0 ? stats.totalProjects.toLocaleString() : '—',
      icon: 'FiCheckCircle',
      description: 'Verified field initiatives',
    },
    {
      label: 'Total Lives Impacted',
      value: stats.totalLives > 0 ? `${stats.totalLives.toLocaleString()}+` : '—',
      icon: 'FiUsers',
      description: 'Individuals reached globally',
    },
  ], [stats]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-[2rem] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center group transition-all duration-300"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0B0D0F] rounded-2xl flex items-center justify-center mr-4 sm:mr-6 group-hover:bg-[#E52321] transition-colors duration-500 shadow-lg shadow-black/10 group-hover:shadow-red-500/20 flex-shrink-0">
              <SafeIcon icon={metric.icon} className="text-white text-lg sm:text-2xl" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 truncate">{metric.label}</p>
              <p className="text-2xl sm:text-3xl font-black text-black tracking-tighter leading-none mb-1">{metric.value}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium truncate">{metric.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MetricsStrip;
