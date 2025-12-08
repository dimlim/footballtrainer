import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { PricingCard } from './PricingCard';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { stripeService, ProgramPrice } from '@/lib/stripe';

interface ProgramPricingProps {
  programId: string;
  programName: string;
  teamId?: string; // If provided, show team pricing
  onAccessGranted?: () => void;
}

export const ProgramPricing: React.FC<ProgramPricingProps> = ({
  programId,
  programName,
  teamId,
  onAccessGranted,
}) => {
  const { language } = useTranslation();
  const { profile } = useAuthStore();
  const { 
    loadProgramAccess, 
    createCheckout, 
    createTeamCheckout,
    startTrial,
    hasAccess,
    isTrialing,
    getTrialEndDate,
    isLoading 
  } = useSubscriptionStore();

  const [prices, setPrices] = useState<ProgramPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  useEffect(() => {
    loadPrices();
    if (profile?.id) {
      loadProgramAccess(profile.id);
    }
  }, [programId, profile?.id]);

  const loadPrices = async () => {
    setLoadingPrices(true);
    const programPrices = await stripeService.getProgramPrices(programId);
    setPrices(programPrices);
    setLoadingPrices(false);
  };

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'accessRequired': { uk: 'Потрібен доступ', en: 'Access Required', cs: 'Vyžadován přístup' },
      'subscribeToAccess': { uk: 'Підпишіться для доступу до програми', en: 'Subscribe to access this program', cs: 'Předplaťte si přístup k programu' },
      'individual': { uk: 'Індивідуальна підписка', en: 'Individual Subscription', cs: 'Individuální předplatné' },
      'team': { uk: 'Командна ліцензія', en: 'Team License', cs: 'Týmová licence' },
      'individualDesc': { uk: 'Для особистого використання', en: 'For personal use', cs: 'Pro osobní použití' },
      'teamDesc': { uk: 'Для вашої команди до 30 гравців', en: 'For your team up to 30 players', cs: 'Pro váš tým až 30 hráčů' },
      'fullAccess': { uk: 'Повний доступ до програми', en: 'Full program access', cs: 'Plný přístup k programu' },
      'progressTracking': { uk: 'Відстеження прогресу', en: 'Progress tracking', cs: 'Sledování pokroku' },
      'achievements': { uk: 'Досягнення та XP', en: 'Achievements & XP', cs: 'Úspěchy a XP' },
      'teamStats': { uk: 'Статистика команди', en: 'Team statistics', cs: 'Týmová statistika' },
      'playerMonitoring': { uk: 'Моніторинг гравців', en: 'Player monitoring', cs: 'Monitorování hráčů' },
      'verification': { uk: 'Верифікація прогресу', en: 'Progress verification', cs: 'Ověření pokroku' },
      'hasAccess': { uk: 'У вас є доступ', en: 'You have access', cs: 'Máte přístup' },
      'trialActive': { uk: 'Пробний період активний', en: 'Trial period active', cs: 'Zkušební období aktivní' },
      'loading': { uk: 'Завантаження...', en: 'Loading...', cs: 'Načítání...' },
      'noPricing': { uk: 'Ціни недоступні', en: 'Pricing not available', cs: 'Ceny nejsou k dispozici' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const handleSubscribe = async (priceId: string, licenseType: 'individual' | 'team') => {
    if (!profile?.id) return;

    if (licenseType === 'team' && teamId) {
      await createTeamCheckout(profile.id, priceId, programId, teamId);
    } else {
      await createCheckout(profile.id, priceId, programId);
    }
  };

  const handleStartTrial = async () => {
    if (!profile?.id) return;
    
    const result = await startTrial(profile.id, programId);
    if (result.success && onAccessGranted) {
      onAccessGranted();
    }
  };

  const userHasAccess = hasAccess(programId);
  const userIsTrialing = isTrialing(programId);
  const trialEndDate = getTrialEndDate(programId);

  // If user has access, show status
  if (userHasAccess && !userIsTrialing) {
    return (
      <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
            <Unlock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-200">
              {getText('hasAccess')}
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              {programName}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loadingPrices) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Filter prices based on context (team or individual)
  const filteredPrices = teamId 
    ? prices.filter(p => p.license_type === 'team')
    : prices.filter(p => p.license_type === 'individual');

  if (filteredPrices.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <p>{getText('noPricing')}</p>
        </div>
      </Card>
    );
  }

  const individualFeatures = [
    getText('fullAccess'),
    getText('progressTracking'),
    getText('achievements'),
  ];

  const teamFeatures = [
    getText('fullAccess'),
    getText('progressTracking'),
    getText('achievements'),
    getText('teamStats'),
    getText('playerMonitoring'),
    getText('verification'),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full mb-4">
          <Lock className="w-4 h-4" />
          {getText('accessRequired')}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {programName}
        </h2>
        <p className="text-gray-500">
          {getText('subscribeToAccess')}
        </p>
      </div>

      {/* Trial Status */}
      {userIsTrialing && trialEndDate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">
                {getText('trialActive')}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {new Date(trialEndDate).toLocaleDateString(
                  language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className={`grid gap-6 ${filteredPrices.length > 1 ? 'md:grid-cols-2' : 'max-w-md mx-auto'}`}>
        {filteredPrices.map((programPrice) => (
          <PricingCard
            key={programPrice.id}
            title={programPrice.license_type === 'team' ? getText('team') : getText('individual')}
            description={programPrice.license_type === 'team' ? getText('teamDesc') : getText('individualDesc')}
            price={programPrice.price.unit_amount}
            currency={programPrice.price.currency}
            interval={programPrice.price.interval}
            trialDays={programPrice.price.trial_period_days ?? undefined}
            features={programPrice.license_type === 'team' ? teamFeatures : individualFeatures}
            licenseType={programPrice.license_type}
            maxUsers={programPrice.max_users}
            isPopular={programPrice.license_type === 'individual'}
            isPremium={programPrice.license_type === 'team'}
            isLoading={isLoading}
            hasAccess={userHasAccess}
            isTrialing={userIsTrialing}
            trialEndsAt={trialEndDate ?? undefined}
            onSubscribe={() => handleSubscribe(programPrice.price_id, programPrice.license_type)}
            onStartTrial={programPrice.price.trial_period_days ? handleStartTrial : undefined}
          />
        ))}
      </div>
    </div>
  );
};

