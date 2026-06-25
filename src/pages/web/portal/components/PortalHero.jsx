import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const PortalHero = () => (
  <section className="bg-[#0B0D0F] pt-40 pb-28 md:pt-48 md:pb-44 relative overflow-hidden">
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <img
        src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000"
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D0F] via-transparent to-[#0B0D0F]" />
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
        <span className="inline-flex items-center gap-2 bg-[#E52321]/20 backdrop-blur-md border border-[#E52321]/30 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-[0.25em] uppercase mb-6 border border-[#E52321]/20">
          <SafeIcon icon="FiCheck" className="text-sm text-[#E52321]" /> Verified Transparency
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-[1.1] sm:leading-[0.9] uppercase">
          Global Projects <br className="hidden sm:block" />
          <span className="text-[#E52321]">Impact Reports</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
          A comprehensive database of our global initiatives, ensuring every contribution is
          accounted for through verified field documentation.
        </p>
      </motion.div>
    </div>
  </section>
);

export default PortalHero;
