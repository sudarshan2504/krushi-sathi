import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Phone,
  ArrowRight,
  Zap,
  Sparkles,
  ShieldCheck,
  User,
  UserPlus,
  Sprout,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BrandLogo } from '../components/ui/BrandLogo';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { WaveFooter } from '../components/ui/WaveFooter';
import { IconTile } from '../components/ui/IconTile';
import { OTPInput } from '../components/ui/OTPInput';
import { SceneBackground, SceneStrip } from '../components/ui/SceneBackground';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { demoLogin, login } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // 1. One-Tap Instant Demo Access (Ramesh Kumar, Mandya)
  const handleInstantDemoLogin = async () => {
    setError(null);
    setIsLoadingDemo(true);
    try {
      await demoLogin();
      navigate('/home', { replace: true });
    } catch (err: any) {
      console.error('[LoginPage] Demo login failed:', err);
      setError(err?.message || 'Demo login failed. Please try again.');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // 2. Send Verification Code (OTP)
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
      await api.auth.sendOtp(cleanNumber, 'login');
      setIsOtpSent(true);
      setResendTimer(30);
    } catch (err: any) {
      console.error('[LoginPage] Send OTP failed:', err);
      setError(err?.message || 'Failed to send verification code. Please check your mobile number.');
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // 3. Verify OTP and sign in
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phone.trim().replace(/\D/g, '');
    if (otp.length < 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setError(null);
    setIsLoadingSubmit(true);
    try {
      await login(cleanNumber, otp);
      navigate('/home', { replace: true });
    } catch (err: any) {
      console.error('[LoginPage] Verify OTP error:', err);
      setError(err?.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <SceneBackground variant="login" className="justify-between relative">
      {/* 1. Top Header & Brand (3-18% screen height) */}
      <div className="pt-7 px-5 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          <BrandLogo size="md" variant="full" />
        </motion.div>

        {/* Title: "Welcome Back" with leaf top-right */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0D2B18] dark:text-cream inline-flex items-center gap-1.5">
          <span>{t('welcomeBack')}</span>
          <Sprout className="w-5 h-5 text-[#228B22] dark:text-emerald-400 rotate-12 inline-block shrink-0 -mt-1" />
        </h1>
        <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 font-medium mt-1">
          {t('loginToAccount')}
        </p>
      </div>

      {/* 2. Farmer Sunrise Scene Strip (20-33% screen height) */}
      <SceneStrip showFarmer farmerPosition="left" className="my-1" />

      {/* 3. Instant Demo Card (29-53% screen height) */}
      <div className="px-5 relative z-10 -mt-4">
        <div className="w-full max-w-sm mx-auto rounded-3xl bg-gradient-to-b from-[#144D29] via-[#104022] to-[#0A2E16] text-white p-4 sm:p-5 shadow-lg border border-[#84CC16]/40 relative overflow-hidden">
          {/* Subtle leaf watermark inside card */}
          <div
            className="absolute -right-3 -bottom-6 w-32 h-32 opacity-15 pointer-events-none"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M 10 90 C 20 60, 45 40, 80 20 C 85 45, 75 75, 45 90 C 30 95, 18 92, 10 90 Z" />
            </svg>
          </div>

          {/* INSTANT DEMO Badge with Zap Icon */}
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#84CC16] text-[#0A2E16] text-[11px] font-extrabold uppercase tracking-wider mb-2.5 shadow-xs">
            <Zap className="w-3 h-3 fill-current shrink-0" />
            <span>{t('instantDemoBadge')}</span>
          </div>

          {/* Sprout IconTile + Title */}
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-emerald-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#A3E635]" />
            </div>
            <h2 className="text-sm font-bold tracking-tight text-white leading-snug">
              {t('quickDemoTitle')}
            </h2>
          </div>

          <p className="text-xs text-emerald-100/90 leading-relaxed mb-3.5">
            {language === 'en' ? (
              <>
                One-tap instant access as <strong className="text-white font-bold">Ramesh Kumar</strong> (Mandya, Karnataka).
              </>
            ) : (
              t('quickDemoDesc')
            )}
          </p>

          {/* White Pill Button: "Enter as Ramesh Kumar ->" */}
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            disabled={isLoadingDemo}
            className="w-full min-h-[44px] py-3 px-4 rounded-full bg-white hover:bg-zinc-50 active:scale-98 text-[#0D2B18] font-bold text-xs sm:text-sm flex items-center justify-between shadow-md transition cursor-pointer select-none"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#144D29] flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>{t('enterAsRamesh')}</span>
            </div>
            {isLoadingDemo ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#144D29]" />
            ) : (
              <ArrowRight className="w-4 h-4 text-[#144D29] stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* 5. Divider: "OR WITH PHONE & OTP" */}
      <div className="px-7 my-3 relative z-10 flex items-center gap-3 max-w-sm mx-auto w-full">
        <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">
          {t('orWithPhoneOtp')}
        </span>
        <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700" />
      </div>

      {/* 6. White Phone Card (59-85% screen height) */}
      <div className="px-5 relative z-10">
        <div className="w-full max-w-sm mx-auto rounded-3xl bg-white dark:bg-zinc-800/95 p-4 sm:p-5 shadow-card border border-zinc-100 dark:border-zinc-700/60">
          {/* Header row: Phone icon + "Mobile Number" */}
          <div className="flex items-center gap-2.5 mb-3">
            <IconTile variant="mint" size="sm">
              <Phone className="w-3.5 h-3.5" />
            </IconTile>
            <span className="text-xs font-bold text-[#0D2B18] dark:text-zinc-100">
              {t('phoneNumber')}
            </span>
          </div>

          {!isOtpSent ? (
            /* Step A: Phone Number Input Pill */
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div className="flex items-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-3 py-0.5 min-h-[48px] focus-within:ring-2 focus-within:ring-forest transition">
                {/* Indian Flag & Dial Code */}
                <div className="flex items-center gap-1 pr-2.5 border-r border-zinc-200 dark:border-zinc-700 select-none">
                  <span className="text-base" role="img" aria-label="India flag">
                    🇮🇳
                  </span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    +91
                  </span>
                </div>

                {/* 10-Digit Mobile Number Field */}
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('phonePlaceholder')}
                  aria-label={t('phoneNumber')}
                  className="w-full min-h-[44px] bg-transparent pl-3 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>

              {/* Demo Mode Subtext */}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#228B22] shrink-0" />
                <span>{t('demoModeActiveNotice')}</span>
              </div>

              {error && (
                <div role="alert" className="p-2 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Send Verification Code CTA */}
              <PrimaryButton
                type="submit"
                fullWidth
                size="md"
                loading={isLoadingSubmit}
                iconRight={<ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                className="mt-1 shadow-md"
              >
                {t('sendVerificationCode')}
              </PrimaryButton>
            </form>
          ) : (
            /* Step B: 6-Digit OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div className="text-center pb-1">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Code sent to <span className="font-bold text-zinc-800 dark:text-zinc-200">+91 {phone}</span>
                </p>
              </div>

              <div className="flex justify-center my-1">
                <OTPInput value={otp} onChange={setOtp} autoFocus />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-forest hover:underline font-semibold cursor-pointer min-h-[44px] inline-flex items-center px-1"
                >
                  Change Number
                </button>
                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-forest font-bold hover:underline cursor-pointer min-h-[44px] inline-flex items-center px-1"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              {error && (
                <div role="alert" className="p-2 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <PrimaryButton
                type="submit"
                fullWidth
                size="md"
                loading={isLoadingSubmit}
                iconRight={<ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                className="mt-2 shadow-md"
              >
                {t('verifyAndLogin')}
              </PrimaryButton>
            </form>
          )}
        </div>
      </div>

      {/* 7. Bottom Navigation to Register */}
      <div className="relative z-10 py-3 text-center text-xs flex items-center justify-center gap-1.5 text-zinc-600 dark:text-zinc-400">
        <UserPlus className="w-4 h-4 text-[#228B22] shrink-0" />
        <span>{t('dontHaveAccount')}</span>
        <Link
          to="/register"
          className="text-[#144D29] dark:text-emerald-400 font-bold hover:underline min-h-[44px] inline-flex items-center px-1"
        >
          {t('signUp')}
        </Link>
      </div>

      {/* 8. Bottom Dark-Green Wave Footer */}
      <WaveFooter heightClass="min-h-[50px] pb-3 pt-0" />
    </SceneBackground>
  );
};

export default LoginPage;
