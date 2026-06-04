import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NavigationProgress = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const isFirstRender = useRef(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    clearTimeout(hideTimer.current);
    setIsVisible(true);
    hideTimer.current = setTimeout(() => setIsVisible(false), 700);

    return () => clearTimeout(hideTimer.current);
  }, [location.key]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={location.key}
          className="fixed top-0 left-0 z-[200] h-[3px]"
          style={{
            background: '#E52321',
            boxShadow: '0 0 8px 1px rgba(229,35,33,0.6)',
          }}
          initial={{ width: '0%', opacity: 1 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            width: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.25 },
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default NavigationProgress;
