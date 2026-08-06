import { motion } from 'framer-motion';
import SafeIcon from '../../../../common/SafeIcon';

const DEFAULT_TITLE = 'Global Projects Impact Reports';
const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000';

// Splits the single editable title string into two display lines, with the
// second half highlighted — preserving the original two-tone look while
// keeping the admin-facing field a single plain text input.
const splitTitle = (title) => {
  const words = (title || DEFAULT_TITLE).trim().split(/\s+/);
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
};

const PortalHero = ({ title, backgroundImage }) => {
  const [line1, line2] = splitTitle(title);

  return (
    <section className="bg-[#0B0D0F] pt-40 pb-28 md:pt-48 md:pb-44 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src={backgroundImage || DEFAULT_BACKGROUND}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D0F] via-transparent to-[#0B0D0F]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
          <span className="inline-flex items-center gap-2 bg-[#D1FAE5] text-[#065F46] border border-[#065F46]/20 px-4 py-2 rounded-full text-[10px] font-black tracking-[0.25em] uppercase mb-6">
            <SafeIcon icon="FiCheck" className="text-sm" /> Verified Transparency
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 sm:mb-8 tracking-tighter leading-[1.1] sm:leading-[0.9] uppercase">
            {line1}
            {line2 && (
              <>
                <br className="hidden sm:block" />
                <span className="text-[#E52321]">{line2}</span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
            A comprehensive database of our global initiatives, ensuring every contribution is
            accounted for through verified field documentation.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PortalHero;
