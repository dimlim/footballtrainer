// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, PartyPopper, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import confetti from 'canvas-confetti';

export const SubscriptionSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { loadUserSubscriptions, loadProgramAccess } = useSubscriptionStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Trigger confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Reload subscription data
    if (profile?.id) {
      Promise.all([
        loadUserSubscriptions(profile.id),
        loadProgramAccess(profile.id)
      ]).then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [profile?.id]);

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'success': { uk: 'Оплата успішна!', en: 'Payment Successful!', cs: 'Platba úspěšná!' },
      'thankYou': { uk: 'Дякуємо за підписку', en: 'Thank you for subscribing', cs: 'Děkujeme za předplatné' },
      'accessGranted': { 
        uk: 'Ваш доступ до програми активовано. Тепер ви можете почати тренування!', 
        en: 'Your program access has been activated. You can now start training!', 
        cs: 'Váš přístup k programu byl aktivován. Nyní můžete začít trénovat!' 
      },
      'startTraining': { uk: 'Почати тренування', en: 'Start Training', cs: 'Začít trénovat' },
      'viewSubscriptions': { uk: 'Мої підписки', en: 'My Subscriptions', cs: 'Moje předplatné' },
      'goHome': { uk: 'На головну', en: 'Go Home', cs: 'Domů' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <PartyPopper className="w-6 h-6 text-amber-500" />
              <h1 className="text-2xl font-black text-gray-900">
                {getText('success')}
              </h1>
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            
            <p className="text-lg font-medium text-gray-700 mb-2">
              {getText('thankYou')}
            </p>
            
            <p className="text-gray-500 mb-8">
              {getText('accessGranted')}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              onClick={() => navigate('/app')}
            >
              {getText('startTraining')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/app/subscriptions')}
            >
              {getText('viewSubscriptions')}
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

