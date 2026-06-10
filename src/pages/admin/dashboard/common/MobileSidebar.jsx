import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const MobileSidebar = ({ open, onClose, section, onNavigate, reportCount }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
        />
        <motion.aside
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#1F1F22] lg:hidden flex flex-col"
        >
          <Sidebar
            section={section}
            setSection={onNavigate}
            setSidebarOpen={onClose}
            reportCount={reportCount}
            mobile
          />
        </motion.aside>
      </>
    )}
  </AnimatePresence>
);

export default MobileSidebar;
