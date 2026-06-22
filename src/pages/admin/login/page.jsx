import { motion, AnimatePresence } from 'framer-motion';
import { useLoginFlow } from './useLoginFlow';
import LoginStep       from './components/LoginStep';
import ForgotEmailStep from './components/ForgotEmailStep';
import ForgotOtpStep   from './components/ForgotOtpStep';
import ForgotResetStep from './components/ForgotResetStep';
import ForgotDoneStep  from './components/ForgotDoneStep';

// Per-step enter/exit animation config
const STEP_MOTION = {
  'login':        { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x:  16 }, transition: { duration: 0.2 } },
  'forgot-email': { initial: { opacity: 0, x:  16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } },
  'forgot-otp':   { initial: { opacity: 0, x:  16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } },
  'forgot-reset': { initial: { opacity: 0, x:  16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2 } },
  'forgot-done':  { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.25 } },
};

const AdminLogin = () => {
  const flow        = useLoginFlow();
  const { step }    = flow;
  const stepMotion  = STEP_MOTION[step] ?? STEP_MOTION['forgot-email'];

  return (
    <div className="min-h-screen bg-[#0B0D0F] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E52321]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E52321]/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-5 overflow-hidden">
            <img
              src="https://media-manager-c.questera.ai/greta-media/89a4c5054b952da31823a698574da50f94645c57fede58bf38e1dc553a5f65aa2a5866630191987f5de6ebb268aeb9b2/images/aW1hZ2UvcG5n/236c9d88c2db247a8226fc26d4a8c574.png"
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Admin Portal</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Human Concern USA</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div key={step} {...stepMotion}>
              {step === 'login'        && <LoginStep       flow={flow} />}
              {step === 'forgot-email' && <ForgotEmailStep flow={flow} />}
              {step === 'forgot-otp'   && <ForgotOtpStep   flow={flow} />}
              {step === 'forgot-reset' && <ForgotResetStep flow={flow} />}
              {step === 'forgot-done'  && <ForgotDoneStep />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
