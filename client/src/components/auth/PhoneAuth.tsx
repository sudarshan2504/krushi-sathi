import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, AlertCircle, CheckCircle2, Sparkles, UserCheck, Sprout, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Button } from '../ui/Button';
import { OTPInput } from '../ui/OTPInput';
import { api } from '../../services/api';

interface PhoneAuthProps {
  onSuccessRedirect?: string;
}

export const PhoneAuth: React.FC<PhoneAuthProps> = ({ onSuccessRedirect = '/home' }) => {
  const navigate = useNavigate();
  const { guestLogin, directLogin, login } = useAuth();
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successName, setSuccessName] = useState<string>('');

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // 1. One-Tap Instant Demo Access
  const handleOneTapDemo = async () => {
    setError(null);
    setIsLoadingDemo(true);
    try {
      const res = await guestLogin('9876543210', 'Ramesh Kumar');
      setSuccessName(res.user?.name || 'Ramesh Kumar');
      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate(onSuccessRedirect, { replace: true });
    } catch (err: any) {
      console.error('[PhoneAuth] Guest login failed:', err);
      setError(err?.message || 'Demo login failed. Please check backend connection.');
      setIsLoadingDemo(false);
    }
  };

  // 2. Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNumber = phone.trim().replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError(null);
    setIsLoadingSubmit(true);
    try {
      // Send OTP via backend or enable direct mode
      await api.auth.sendOtp(cleanNumber).catch(() => {});
      setIsOtpSent(true);
      setResendTimer(30);
    } catch (err: any) {
      console.warn('Send OTP warning, enabling OTP input anyway:', err);
      setIsOtpSent(true);
      setResendTimer(30);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // 3. Verify OTP / Submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phone.trim().replace(/\D/g, '');
    if (otp.length < 6) {
      setError('Please enter the full 6-digit verification code');
      return;
    }

    setError(null);
    setIsLoadingSubmit(true);
    try {
      let isNewUser = false;
      try {
        const res = await login(cleanNumber, otp);
        isNewUser = res.isNewUser;
      } catch {
        // Fallback to directLogin for demo OTP
        const directRes = await directLogin(cleanNumber);
        isNewUser = directRes.isNewUser;
      }

      setSuccessName('Farmer');
      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (isNewUser) {
        navigate('/register', { state: { phone: cleanNumber } });
      } else {
        navigate(onSuccessRedirect, { replace: true });
      }
    } catch (err: any) {
      console.error('[PhoneAuth] Verification failed:', err);
      setError(err?.message || 'Verification failed. Demo code: 123456');
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="w-full">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3.5 rounded-2xl bg-danger-light border border-danger/20 text-xs text-danger-dark font-medium flex items-start gap-2.5 shadow-xs"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
          <span className="leading-snug">{error}</span>
        </motion.div>
      )}

      {/* Success State Overlay */}
      <AnimatePresence>
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            role="status"
            aria-live="polite"
            className="py-10 px-6 text-center space-y-3 bg-brand-50 dark:bg-dark-elevated rounded-4xl border border-brand-200 dark:border-dark-border shadow-card"
          >
            <div className="w-14 h-14 rounded-full bg-brand-700 text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">
              {t('welcomeBack') || 'Welcome Back'}, {successName}!
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
              Signing you in...
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* ONE-TAP INSTANT DEMO LOGIN */}
            <div className="p-4 rounded-4xl bg-brand-700 text-white shadow-card border border-brand-600 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-white/15 text-white">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full mb-0.5">
                      Instant Demo
                    </span>
                    <h3 className="text-[15px] font-bold text-white leading-tight">
                      {t('quickDemoLogin') || 'Quick Demo Login'}
                    </h3>
                  </div>
                </div>
                <Sprout className="w-6 h-6 text-white/40 shrink-0" />
              </div>

              <p className="text-[12px] text-white/80 leading-relaxed">
                One-tap instant access as <strong className="text-white font-bold">Ramesh Kumar</strong> (Mandya, Karnataka).
              </p>

              <button
                type="button"
                onClick={handleOneTapDemo}
                disabled={isLoadingDemo || isLoadingSubmit}
                className="w-full py-3 px-4 rounded-2xl bg-white text-brand-800 font-bold text-[14px] hover:bg-brand-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm min-h-[44px] disabled:opacity-60 cursor-pointer"
              >
                {isLoadingDemo ? (
                  <div className="w-4 h-4 border-2 border-brand-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Enter as Ramesh Kumar</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-dark-border" />
              </div>
              <span className="relative bg-bg dark:bg-dark-bg px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Or With Phone & OTP
              </span>
            </div>

            {/* PHONE & OTP FORM */}
            <form
              onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}
              className="space-y-4 bg-white dark:bg-dark-surface p-5 rounded-4xl border border-gray-100 dark:border-dark-border shadow-card"
            >
              {!isOtpSent ? (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('phoneNumber') || 'Mobile Number'}
                  </label>

                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 flex items-center gap-1 text-[13px] font-bold text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-dark-border pr-2">
                      <Phone className="w-3.5 h-3.5 text-brand-600" />
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent font-bold outline-none cursor-pointer text-gray-800 dark:text-gray-200"
                        aria-label="Country Code"
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                      </select>
                    </div>

                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      pattern="[0-9]*"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit number"
                      className="w-full pl-28 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-dark-elevated border border-gray-200 dark:border-dark-border focus:bg-white dark:focus:bg-dark-surface focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 outline-none font-bold text-[15px] tracking-wide transition-all min-h-[48px] text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>Demo mode active. Any 10-digit number accepted.</span>
                  </p>

                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    fullWidth
                    loading={isLoadingSubmit}
                    disabled={isLoadingDemo || !phone || phone.length < 10}
                    className="mt-4"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Send Verification Code
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 font-medium">Verification code sent to</span>
                      <p className="text-[13px] font-bold text-gray-900 dark:text-gray-100">
                        {countryCode} {phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-xs text-brand-700 dark:text-brand-400 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    label={t('enterOtp') || 'Enter 6-digit verification code'}
                    autoFocus
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-gray-400">Demo OTP: 123456</span>
                    {resendTimer > 0 ? (
                      <span className="text-gray-400 font-medium tabular">
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-brand-700 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend code</span>
                      </button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="md"
                    variant="primary"
                    fullWidth
                    loading={isLoadingSubmit}
                    disabled={isLoadingDemo || otp.length < 6}
                    className="mt-3"
                  >
                    Verify & Continue
                  </Button>
                </div>
              )}
            </form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneAuth;
