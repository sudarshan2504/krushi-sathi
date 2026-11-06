import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { PhoneAuth } from '../components/auth/PhoneAuth';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh bg-bg dark:bg-dark-bg flex flex-col justify-between pt-[max(1.5rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] px-6 max-w-sm mx-auto w-full">
      {/* Brand & Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 text-center"
      >
        <Link to="/" className="inline-block group focus:outline-none mb-3">
          <div className="w-16 h-16 rounded-3xl bg-brand-700 p-3 shadow-card flex items-center justify-center mx-auto">
            <picture className="w-full h-full flex items-center justify-center">
              <source srcSet="/krushi-sathi-logo.webp" type="image/webp" />
              <img
                src="/krushi-sathi-logo.png"
                alt="Krushi Sathi"
                width="48"
                height="48"
                className="w-full h-full object-contain brightness-0 invert"
              />
            </picture>
          </div>
        </Link>

        <h1 className="text-display font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
          {t('welcomeBack') || 'Welcome Back'}
        </h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium mt-1 leading-relaxed">
          {t('loginToAccount') || 'Sign in to access your crop advisories and farm data'}
        </p>
      </motion.div>

      {/* Login Card with Phone Auth */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.08 }}
        className="my-auto py-4"
      >
        <PhoneAuth onSuccessRedirect="/home" />
      </motion.div>

      {/* Footer Navigation to Register */}
      <div className="text-center pb-2 text-[13px] flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 font-medium">
          {t('dontHaveAccount') || "Don't have an account?"}
        </span>
        <Link
          to="/register"
          className="text-brand-700 dark:text-brand-400 font-bold hover:underline ml-1.5 p-1"
        >
          {t('signUp') || 'Register Farmer'}
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
