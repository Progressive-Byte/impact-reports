import { BackLink, ErrorBanner, Field, Btn } from './LoginUI';

const ForgotEmailStep = ({ flow }) => {
  const { fpEmail, setFpEmail, error, loading, handleForgotEmail, goBackToLogin } = flow;

  return (
    <>
      <BackLink onClick={goBackToLogin} label="Back to login" />

      <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">
        Forgot Password
      </h2>
      <p className="text-gray-500 text-xs mb-6">
        Enter your registered email address and we'll send you a verification code.
      </p>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleForgotEmail} className="space-y-4">
        <Field
          label="Email Address" icon="FiMail" type="email"
          value={fpEmail}
          onChange={setFpEmail}
          placeholder="Enter your email"
        />
        <Btn loading={loading} label="Send Verification Code" icon="FiSend" />
      </form>
    </>
  );
};

export default ForgotEmailStep;
