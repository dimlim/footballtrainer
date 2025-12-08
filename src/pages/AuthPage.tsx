import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Globe } from 'lucide-react';
import { LoginForm, RegisterForm } from '@/components/auth';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation, languageOptions } from '@/lib/i18n';
import type { Language } from '@/types/database';

export const AuthPage: React.FC = () => {
  const { user, isLoading } = useAuthStore();
  const { language, setLanguage } = useTranslation();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex flex-col">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">
              {languageOptions.find(l => l.value === language)?.flag}
            </span>
          </button>
          
          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-w-[150px]"
              >
                {languageOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setLanguage(option.value as Language);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                      language === option.value ? 'bg-primary-50 text-primary-600' : ''
                    }`}
                  >
                    <span>{option.flag}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Logo */}
      <div className="pt-16 pb-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4"
        >
          <Zap className="w-10 h-10 text-white" fill="currentColor" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-black italic tracking-tight text-gray-900"
        >
          FOOTBALL TRAINER
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 font-medium mt-1"
        >
          PRO
        </motion.p>
      </div>

      {/* Auth Forms */}
      <div className="flex-1 px-6 pb-8">
        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <LoginForm 
              key="login"
              onSwitchToRegister={() => setView('register')} 
            />
          ) : (
            <RegisterForm 
              key="register"
              onSwitchToLogin={() => setView('login')} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="text-center pb-6 text-xs text-gray-400">
        © 2025 Football Trainer Pro
      </div>
    </div>
  );
};

