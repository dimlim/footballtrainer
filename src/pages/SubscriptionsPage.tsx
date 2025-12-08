import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionManager } from '@/components/subscription';
import { useTranslation } from '@/lib/i18n';

export const SubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'title': { uk: 'Мої підписки', en: 'My Subscriptions', cs: 'Moje předplatné' },
      'back': { uk: 'Назад', en: 'Back', cs: 'Zpět' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{getText('back')}</span>
          </button>

          <h1 className="text-2xl font-black text-white">
            {getText('title')}
          </h1>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <SubscriptionManager />
      </div>
    </div>
  );
};

