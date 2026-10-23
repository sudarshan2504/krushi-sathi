import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, Phone, User, MapPin, Globe, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { LanguageCode } from '../i18n';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { language, setLanguage, languages, t } = useTranslation();

  const prefilledPhone = (location.state as any)?.phone || '';

  const [formData, setFormData] = useState({
    name: '',
    phone: prefilledPhone || '',
    language: language || 'en',
    state: 'Karnataka',
    district: '',
    village: '',
    farmSize: 2.0,
    farmUnit: 'Acres',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(formData);
      setLanguage(formData.language as LanguageCode);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-mint-light flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2 text-center"
      >
        <Link to="/" className="inline-block group focus:outline-none mb-1">
          <img
            src="/krushi-sathi-logo.png"
            alt="Krushi Sathi Logo"
            className="h-16 sm:h-20 w-auto object-contain mx-auto drop-shadow-sm transition-transform group-hover:scale-105"
          />
        </Link>
        <h1 className="text-2xl font-extrabold text-dark-text">
          {t('createAccount')}
        </h1>
        <p className="text-xs text-dark-muted font-medium">
          {t('joinKrishiSathi')} — No password or Gmail needed
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-3.5 my-auto py-4"
      >
        {error && (
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-dark-text mb-1">
            {t('fullName')} *
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 w-4 h-4 text-forest" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('namePlaceholder')}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-semibold"
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-dark-text mb-1">
            {t('phoneNumber')} *
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-dark-muted border-r border-gray-200 pr-2">
              <Phone className="w-3.5 h-3.5 text-forest" />
              <span>+91</span>
            </div>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
              placeholder="98765 43210"
              className="w-full pl-20 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-bold tracking-wide"
            />
          </div>
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-xs font-bold text-dark-text mb-1">
            {t('chooseLanguage')}
          </label>
          <div className="relative flex items-center">
            <Globe className="absolute left-3.5 w-4 h-4 text-forest pointer-events-none" />
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value as LanguageCode })}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-sm font-semibold appearance-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* State & District Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-dark-text mb-1">
              {t('state')}
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-dark-text mb-1">
              {t('district')}
            </label>
            <input
              type="text"
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-xs font-semibold"
            />
          </div>
        </div>

        {/* Village / Town (Optional) */}
        <div>
          <label className="block text-xs font-bold text-dark-text mb-1">
            {t('village')} <span className="text-dark-muted font-normal">(Optional)</span>
          </label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-3.5 h-3.5 text-forest" />
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="e.g. Koppa (Hobli)"
              className="w-full pl-8 pr-3 py-2.5 rounded-2xl bg-white border border-gray-200 focus:border-forest outline-none text-xs font-semibold"
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={isLoading}
          className="shadow-xl shadow-forest/20 mt-3"
        >
          <span>{t('createAccount')}</span>
        </Button>
      </motion.form>


      {/* Footer Navigation to Login */}
      <div className="text-center pb-4 text-xs">
        <span className="text-dark-muted">{t('alreadyHaveAccount')} </span>
        <Link to="/login" className="text-forest font-bold underline ml-1">
          {t('welcomeBack')}
        </Link>
      </div>
    </div>
  );
};
