import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import krushiLogo from '../assets/krushi-sathi-logo.png';
import { useTranslation } from '../context/LanguageContext';
import { PhoneAuth } from '../components/auth/PhoneAuth';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-mint-light flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Brand & Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-4 text-center"
      >
        <Link to="/" className="inline-block group focus:outline-none">
          <img
            src={krushiLogo}
            alt="Krushi Sathi — Your Farming Companion"
            className="h-20 sm:h-24 w-auto object-contain mx-auto drop-shadow-sm transition-transform group-hover:scale-105"
          />
        </Link>

        <h2 className="text-xl font-bold text-dark-text mt-3">
          {t('welcomeBack') || 'Welcome Back!'}
        </h2>
        <p className="text-xs text-dark-muted">
          {t('loginToAccount') || 'Sign in to access your crop advisories and farm data'}
        </p>
      </motion.div>

      {/* Login Card with Firebase Phone Auth */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="my-auto py-4"
      >
        <PhoneAuth onSuccessRedirect="/home" />
      </motion.div>

      {/* Footer Navigation to Sign Up */}
      <div className="text-center pb-4 text-xs">
        <span className="text-dark-muted">{t('dontHaveAccount') || "Don't have an account?"} </span>
        <Link to="/register" className="text-forest font-bold underline ml-1">
          {t('signUp') || 'Register Farmer'}
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;

