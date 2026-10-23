import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldCheck, ArrowRight, RotateCcw, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  ConfirmationResult,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Button } from '../ui/Button';

// Extend window object for RecaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

interface PhoneAuthProps {
  onSuccessRedirect?: string;
}

export const PhoneAuth: React.FC<PhoneAuthProps> = ({ onSuccessRedirect = '/home' }) => {
  const navigate = useNavigate();
  const { setFirebaseSession, login } = useAuth();
  const { t } = useTranslation();

  // Step state: 'phone' or 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isShaking, setIsShaking] = useState(false);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Confirmation result from signInWithPhoneNumber
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // 30-second countdown for Resend OTP
  const [countdown, setCountdown] = useState<number>(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup recaptcha and timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('[PhoneAuth] Error clearing recaptcha on unmount:', e);
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [countdown]);

  // Safe RecaptchaVerifier creation with proper cleanup to prevent "reCAPTCHA already rendered"
  const getOrCreateRecaptcha = (): RecaptchaVerifier => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('[PhoneAuth] Clearing prior verifier:', e);
      }
      window.recaptchaVerifier = null;
    }

    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }

    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // Invisible reCAPTCHA resolved
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please tap "Send OTP" again.');
      },
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  };

  const formatFirebaseError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number. Please enter a valid 10-digit number with country code.';
      case 'auth/missing-phone-number':
        return 'Phone number cannot be empty.';
      case 'auth/invalid-verification-code':
        return 'Wrong OTP code. Please check the 6-digit code and try again.';
      case 'auth/code-expired':
        return 'The OTP has expired. Please tap "Resend OTP" to get a new code.';
      case 'auth/billing-not-enabled':
        return 'Real SMS requires Firebase Blaze (pay-as-you-go) plan. Please enable billing in your Firebase Console or use test phone numbers configured under Authentication > Sign-in method.';
      case 'auth/too-many-requests':
        return 'Too many SMS requests from this phone number or IP. Please wait a few minutes before trying again.';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Please refresh and try again.';
      case 'auth/quota-exceeded':
        return 'Daily SMS quota exceeded. Please use Firebase test phone numbers (e.g. +91 99999 99999).';
      case 'auth/network-request-failed':
        return 'Network connection error. Please verify your internet connection.';
      case 'auth/app-not-authorized':
        return 'Domain not authorized. Add "localhost" under Firebase Console > Auth > Settings > Authorized domains.';
      default:
        return err?.message || 'Authentication error. Please try again.';
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        e.preventDefault();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else if (otpDigits[index]) {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // Step 1: Send OTP via Firebase signInWithPhoneNumber
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanNumber = phone.trim().replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber.slice(-10)}`;
    setError(null);
    setSuccessInfo(null);
    setIsLoading(true);

    // If Firebase keys are not set, provide informative instructions or fallback
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      setError(
        'Firebase is not configured yet. Please add your VITE_FIREBASE_* credentials to client/.env (see client/.env.example). You can still sign in using demo mode code 123456 below.'
      );
      // Still allow step progression for quick testing if user desires
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(30);
      return;
    }

    try {
      const appVerifier = getOrCreateRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(30);
      setSuccessInfo(`OTP sent successfully to ${fullPhoneNumber}`);
    } catch (err: any) {
      console.error('[PhoneAuth] Send OTP error:', err);
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {}
        window.recaptchaVerifier = null;
      }
      setError(formatFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpDigits.join('').trim().replace(/\D/g, '');

    if (!cleanOtp || cleanOtp.length < 6) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setError(t('wrongOtp') || 'Please enter the 6-digit verification code');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      if (confirmationResult) {
        // 1. Verify OTP with Firebase Web SDK
        const userCredential = await confirmationResult.confirm(cleanOtp);
        const fbUser = userCredential.user;

        // 2. Obtain verified Firebase ID token
        const idToken = await fbUser.getIdToken();

        // 3. Send ID token to backend /api/auth/firebase-login
        // DO NOT silently catch! If backend rejects, sign out of Firebase and display clear error
        let loginResult;
        try {
          loginResult = await api.auth.firebaseLogin(idToken);
        } catch (serverErr: any) {
          await signOut(auth).catch(() => {});
          throw new Error(
            serverErr?.message || 'Backend rejected Firebase authentication token. Please login again.'
          );
        }

        // 4. Update AuthContext session with verified Prisma user
        setFirebaseSession(fbUser, loginResult.user);

        // 5. Success feedback before redirect
        setIsVerifiedSuccess(true);
        await new Promise((res) => setTimeout(res, 650));

        // 6. Route: New users go to /register (with phone in state); existing users go to onSuccessRedirect
        if (loginResult.isNewUser) {
          const userPhone = loginResult.user.phone || phone.slice(-10);
          navigate('/register', { state: { phone: userPhone } });
        } else {
          navigate(onSuccessRedirect, { replace: true });
        }
      } else {
        // Fallback demo login when Firebase is unconfigured
        const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
        const { isNewUser } = await login(cleanPhone, cleanOtp);

        // Success feedback before redirect
        setIsVerifiedSuccess(true);
        await new Promise((res) => setTimeout(res, 650));

        if (isNewUser) {
          navigate('/register', { state: { phone: cleanPhone } });
        } else {
          navigate(onSuccessRedirect, { replace: true });
        }
      }
    } catch (err: any) {
      console.error('[PhoneAuth] Verify OTP error:', err);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setError(formatFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtpDigits(['', '', '', '', '', '']);
    setIsVerifiedSuccess(false);
    setIsShaking(false);
    setError(null);
    setSuccessInfo(null);
    setCountdown(0);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    await handleSendOtp();
  };

  const formattedDisplayPhone = `${countryCode} ${phone.slice(-10)}`;

  return (
    <div className="w-full">
      {/* Invisible reCAPTCHA container required by Firebase */}
      <div id="recaptcha-container" />

      {/* Info notice about Firebase Test Phone numbers for Demo */}
      <div className="mb-4 p-3 rounded-2xl bg-forest/5 border border-forest/15 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-dark-text leading-relaxed">
          <span className="font-bold text-forest block">Firebase Phone Authentication (Demo Mode)</span>
          <span>
            Test numbers (e.g., <strong className="font-bold">+91 99999 99999</strong> with code <strong className="font-bold">123456</strong>) bypass real SMS limits for instant demo verification.
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Success Notification */}
      {successInfo && (
        <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-200 text-xs text-green-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          /* STEP 1: Phone Number Input */
          <motion.form
            key="phone-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleSendOtp}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-dark-text mb-1.5">
                {t('phoneNumber') || 'Mobile Phone Number'}
              </label>

              <div className="relative flex items-center">
                {/* Country Code Selector (Default +91) */}
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
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full pl-32 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 focus:border-forest focus:ring-2 focus:ring-forest/15 outline-none font-bold text-base tracking-wide transition-all shadow-sm"
                />
              </div>

              <p className="text-[11px] text-dark-muted mt-1.5 flex items-center gap-1 font-medium">
                <Lock className="w-3 h-3 text-forest" />
                <span>We protect your privacy. Zero spam, purely for farming assistance.</span>
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              isLoading={isLoading}
              className="shadow-xl shadow-forest/20 mt-2 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Verifying reCAPTCHA...' : 'Send OTP'}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </motion.form>
        ) : (
          /* STEP 2: 6-Digit OTP Verification */
          <motion.form
            key="otp-step"
            initial={{ opacity: 0, x: 10 }}
            animate={
              isShaking
                ? { x: [-12, 12, -8, 8, -4, 4, 0] }
                : { opacity: 1, x: 0 }
            }
            exit={{ opacity: 0, x: -10 }}
            transition={isShaking ? { duration: 0.5, ease: 'easeInOut' } : { duration: 0.2 }}
            onSubmit={handleVerifyOtp}
            className="space-y-4"
          >
            {isVerifiedSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                role="status"
                aria-live="polite"
                className="py-8 px-4 text-center space-y-3 bg-mint-light rounded-3xl border border-forest/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1] }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="w-16 h-16 rounded-full bg-forest text-white flex items-center justify-center mx-auto shadow-xl shadow-forest/30"
                >
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </motion.div>
                <h3 className="text-base font-black text-forest">
                  {t('verifiedSuccess')}
                </h3>
              </motion.div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-dark-text">
                    6-Digit OTP for {formattedDisplayPhone}
                  </label>
                  <button
                    type="button"
                    onClick={handleChangeNumber}
                    className="text-xs text-forest underline font-bold hover:text-forest-dark transition"
                  >
                    Change number
                  </button>
                </div>

                {/* 6 Separate OTP Boxes */}
                <div
                  role="group"
                  aria-label="6-Digit Verification Code"
                  className="grid grid-cols-6 gap-2 sm:gap-2.5 my-3"
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      aria-label={t('otpBoxLabel', { digit: idx + 1 })}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-full h-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-white border-2 border-gray-200 focus:border-forest focus:ring-2 focus:ring-forest/20 outline-none transition-all shadow-sm select-none"
                    />
                  ))}
                </div>

                {/* Resend OTP Row with 30-Second Countdown */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  {/* Quick Fill for test phone numbers */}
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDigits(['1', '2', '3', '4', '5', '6']);
                      inputRefs.current[5]?.focus();
                    }}
                    className="text-xs text-forest font-bold hover:underline"
                  >
                    Fill test code (123456)
                  </button>

                  {countdown > 0 ? (
                    <span className="text-dark-muted font-medium flex items-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                      <span>Resend OTP in <strong className="text-forest font-bold">{countdown}s</strong></span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-forest font-bold hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isVerifiedSuccess && (
              <Button
                type="submit"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="shadow-xl shadow-forest/20 mt-2 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Verifying OTP...' : 'Verify & Continue'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
              </Button>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneAuth;
