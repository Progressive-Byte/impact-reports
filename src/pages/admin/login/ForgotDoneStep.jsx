import SafeIcon from '../../../common/SafeIcon';

const ForgotDoneStep = () => (
  <div className="text-center py-4">
    <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
      <SafeIcon icon="FiCheckCircle" className="text-green-400 text-2xl" />
    </div>
    <h2 className="text-white font-black text-lg mb-2">Password Updated!</h2>
    <p className="text-gray-400 text-sm">Redirecting you to login…</p>
  </div>
);

export default ForgotDoneStep;
