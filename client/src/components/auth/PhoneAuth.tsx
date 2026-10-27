import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, AlertCircle, CheckCircle2, Sparkles, UserCheck, Sprout, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Button } from '../ui/Button';

interface PhoneAuthProps {
  onSuccessRedirect?: string;
}

export const PhoneAuth: React.FC<PhoneAuthProps> = ({ onSuccessRedirect = '/home' }) => {
  const navigate = useNavigate();
  const { guestLogin, directLogin } = useAuth();
  const { t } = useTranslation();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successName, setSuccessName] = useState<string>('');

  // 1. One-Tap Instant Demo Access (No OTP required)
  const handleOneTapDemo = async () => {
    setError(null);
    setIsLoadingDemo(true);
    try {
      const res = await guestLogin('9876543210', 'Ramesh Kumar (Farmer)');
      setSuccessName(res.user?.name || 'Ramesh Kumar');
      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 550));
      navigate(onSuccessRedirect, { replace: true });
    } catch (err: any) {
      console.error('[PhoneAuth] Guest login failed:', err);
      setError(err?.message || 'Demo login failed. Please check backend connection.');
      setIsLoadingDemo(false);
    }
  };

  // 2. Direct Phone Sign-In (Instant access without OTP)
  const handleDirectPhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phone.trim().replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setError(null);
    setIsLoadingPhone(true);
    try {
      const res = await directLogin(cleanNumber);
      setSuccessName(res.user?.name || 'Farmer');
      setIsSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 550));

      if (res.isNewUser) {
        navigate('/register', { state: { phone: cleanNumber } });
      } else {
        navigate(onSuccessRedirect, { replace: true });
      }
    } catch (err: any) {
      console.error('[PhoneAuth] Direct phone login failed:', err);
      setError(err?.message || 'Login failed. Please check your connection.');
      setIsLoadingPhone(false);
    }
  };

  return (
    <div className="w-full">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2 shadow-sm"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span className="leading-tight">{error}</span>
        </motion.div>
      )}

      {/* Success State Overlay */}
      <AnimatePresence>
        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            role="status"
            aria-live="polite"
            className="py-10 px-6 text-center space-y-3 bg-mint-light rounded-3xl border border-forest/20 shadow-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.25, 1] }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="w-16 h-16 rounded-full bg-forest text-white flex items-center justify-center mx-auto shadow-xl shadow-forest/30"
            >
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </motion.div>
            <h3 className="text-lg font-black text-forest">
              {t('welcomeBack') || 'Welcome Back'}, {successName}!
            </h3>
            <p className="text-xs text-dark-muted font-medium">
              {t('verifiedSuccess') || 'Signing you in...'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* ONE-TAP INSTANT DEMO LOGIN (PRIMARY ACTION) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-br from-forest via-forest to-forest-dark text-white shadow-xl shadow-forest/25 border border-forest-light/30"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-white/15 text-cream backdrop-blur-sm">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-harvest text-dark-text px-2 py-0.5 rounded-full mb-0.5 shadow-sm">
                      Instant Access
                    </span>
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      {t('quickDemoLogin') || 'Quick Demo Login'}
                    </h3>
                  </div>
                </div>
                <Sprout className="w-7 h-7 text-mint/40 shrink-0" />
              </div>

              <p className="text-xs text-white/85 mb-3.5 leading-snug">
                One-tap instant access as <strong className="text-cream font-bold">Ramesh Kumar</strong> (Mandya, Karnataka). No OTP or verification wait required.
              </p>

              <button
                type="button"
                onClick={handleOneTapDemo}
                disabled={isLoadingDemo || isLoadingPhone}
                className="w-full py-3.5 px-4 rounded-2xl bg-white text-forest font-black text-sm tracking-wide hover:bg-cream active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg min-h-[48px] disabled:opacity-60 cursor-pointer"
              >
                {isLoadingDemo ? (
                  <div className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-forest" />
                    <span>Enter as Ramesh Kumar</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </motion.div>

            {/* OR DIVIDER */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold text-dark-muted uppercase tracking-wider rounded-full border border-gray-100 shadow-2xs">
                Or Sign In With Mobile
              </span>
            </div>

            {/* DIRECT PHONE NUMBER SIGN-IN (NO OTP) */}
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onSubmit={handleDirectPhoneLogin}
              className="space-y-3 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div>
                <label className="block text-xs font-bold text-dark-text mb-1.5">
                  {t('phoneNumber') || 'Mobile Number'}
                </label>

                <div className="relative flex items-center">
                  {/* Country Prefix */}
                  <div className="absolute left-3.5 flex items-center gap-1 text-sm font-bold text-dark-muted border-r border-gray-200 pr-2.5">
                    <Phone className="w-4 h-4 text-forest" />
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-transparent font-bold outline-none cursor-pointer text-dark-text"
                      aria-label="Country Code"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
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
                    className="w-full pl-32 pr-4 py-3 rounded-2xl bg-gray-50/70 border border-gray-200 focus:bg-white focus:border-forest focus:ring-2 focus:ring-forest/15 outline-none font-bold text-base tracking-wide transition-all min-h-[48px]"
                  />
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-dark-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                  <span>Direct instant login — no OTP SMS code required</span>
                </div>
              </div>

              <Button
                type="submit"
                size="md"
                variant="outline"
                fullWidth
                isLoading={isLoadingPhone}
                disabled={isLoadingDemo || !phone || phone.length < 10}
                className="mt-1 font-bold text-sm text-forest border-2 border-forest/30 hover:bg-forest hover:text-white transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>Sign In With Phone</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneAuth;
