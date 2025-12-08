// @ts-nocheck
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Star, 
  Zap, 
  Users, 
  Crown,
  Loader2,
  Gift,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { Button, Card } from '@/components/ui';
import { formatPrice, getLocalizedPrice } from '@/lib/stripe';

export const PricingPage = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { profile, user } = useAuthStore();
  const {
    subscriptionPlans,
    products,
    userSubscriptions,
    isLoading,
    isCheckingOut,
    loadSubscriptionPlans,
    loadProducts,
    loadUserSubscriptions,
    startCheckout,
    isSubscribed,
    isTrialing,
    getSubscriptionEndDate
  } = useSubscriptionStore();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    loadSubscriptionPlans();
    loadProducts();
    if (user?.id) {
      loadUserSubscriptions(user.id);
    }
  }, [user?.id]);

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'title': { uk: 'Оберіть свій план', en: 'Choose Your Plan', cs: 'Vyberte si plán' },
      'subtitle': { uk: 'Розблокуйте повний потенціал тренувань', en: 'Unlock your full training potential', cs: 'Odemkněte svůj plný tréninkový potenciál' },
      'monthly': { uk: 'Щомісяця', en: 'Monthly', cs: 'Měsíčně' },
      'yearly': { uk: 'Щорічно', en: 'Yearly', cs: 'Ročně' },
      'save': { uk: 'Економія', en: 'Save', cs: 'Ušetříte' },
      'mostPopular': { uk: 'Найпопулярніший', en: 'Most Popular', cs: 'Nejoblíbenější' },
      'perMonth': { uk: '/місяць', en: '/month', cs: '/měsíc' },
      'perYear': { uk: '/рік', en: '/year', cs: '/rok' },
      'startTrial': { uk: 'Почати 7-денний trial', en: 'Start 7-day trial', cs: 'Začít 7denní zkušební období' },
      'subscribe': { uk: 'Підписатися', en: 'Subscribe', cs: 'Předplatit' },
      'currentPlan': { uk: 'Ваш поточний план', en: 'Your current plan', cs: 'Váš aktuální plán' },
      'managePlan': { uk: 'Керувати підпискою', en: 'Manage subscription', cs: 'Spravovat předplatné' },
      'trialActive': { uk: 'Trial активний', en: 'Trial active', cs: 'Zkušební období aktivní' },
      'endsOn': { uk: 'Закінчується', en: 'Ends on', cs: 'Končí' },
      'free': { uk: 'Безкоштовно', en: 'Free', cs: 'Zdarma' },
      'promoCode': { uk: 'Промокод', en: 'Promo code', cs: 'Promo kód' },
      'apply': { uk: 'Застосувати', en: 'Apply', cs: 'Použít' },
      'forPlayers': { uk: 'Для гравців', en: 'For players', cs: 'Pro hráče' },
      'forCoaches': { uk: 'Для тренерів', en: 'For coaches', cs: 'Pro trenéry' },
      'allPrograms': { uk: 'Всі преміум програми', en: 'All premium programs', cs: 'Všechny prémiové programy' },
      'unlimitedAccess': { uk: 'Необмежений доступ', en: 'Unlimited access', cs: 'Neomezený přístup' },
      'teamManagement': { uk: 'Управління командою', en: 'Team management', cs: 'Správa týmu' },
      'playerStats': { uk: 'Статистика гравців', en: 'Player statistics', cs: 'Statistiky hráčů' },
      'prioritySupport': { uk: 'Пріоритетна підтримка', en: 'Priority support', cs: 'Prioritní podpora' },
      'upTo30Players': { uk: 'До 30 гравців', en: 'Up to 30 players', cs: 'Až 30 hráčů' },
      'activityTracking': { uk: 'Відстеження активності', en: 'Activity tracking', cs: 'Sledování aktivity' },
      'verification': { uk: 'Верифікація прогресу', en: 'Progress verification', cs: 'Ověření pokroku' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const getFeatures = (planType: string): string[] => {
    if (planType === 'individual') {
      return [
        getText('allPrograms'),
        getText('unlimitedAccess'),
        getText('activityTracking'),
        getText('prioritySupport'),
      ];
    } else {
      return [
        getText('allPrograms'),
        getText('upTo30Players'),
        getText('teamManagement'),
        getText('playerStats'),
        getText('activityTracking'),
        getText('verification'),
        getText('prioritySupport'),
      ];
    }
  };

  const handleSubscribe = async (plan: typeof subscriptionPlans[0]) => {
    if (!user?.id) {
      navigate('/auth');
      return;
    }

    const priceId = billingPeriod === 'yearly' 
      ? plan.stripe_price_yearly_id 
      : plan.stripe_price_monthly_id;

    if (!priceId) {
      console.error('No price ID for this plan');
      return;
    }

    await startCheckout({
      userId: user.id,
      priceId,
      planId: plan.id,
      promoCode: promoCode || undefined,
    });
  };

  const getCurrency = () => {
    switch (language) {
      case 'cs': return 'czk';
      case 'uk': return 'usd';
      default: return 'usd';
    }
  };

  const getCurrencySymbol = () => {
    switch (language) {
      case 'cs': return 'Kč';
      case 'uk': return '$';
      default: return '$';
    }
  };

  const individualPlans = subscriptionPlans.filter(p => p.license_type === 'individual');
  const teamPlans = subscriptionPlans.filter(p => p.license_type === 'team');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            {getText('title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/80"
          >
            {getText('subtitle')}
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 inline-flex items-center bg-white/10 rounded-full p-1"
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full transition-colors ${
                billingPeriod === 'monthly' 
                  ? 'bg-white text-primary-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {getText('monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full transition-colors flex items-center gap-2 ${
                billingPeriod === 'yearly' 
                  ? 'bg-white text-primary-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {getText('yearly')}
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {getText('save')} 33%
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Current subscription banner */}
      {(isSubscribed() || isTrialing()) && (
        <div className="max-w-6xl mx-auto px-4 -mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">
                  {isTrialing() ? getText('trialActive') : getText('currentPlan')}
                </p>
                <p className="text-sm text-green-600">
                  {getText('endsOn')}: {getSubscriptionEndDate()?.toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => useSubscriptionStore.getState().openCustomerPortal(user?.id || '')}
            >
              {getText('managePlan')}
            </Button>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Individual Plans */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getText('forPlayers')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Free tier */}
            <Card className="p-6 border-2 border-gray-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {getText('free')}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {language === 'uk' ? 'Базові програми' : language === 'cs' ? 'Základní programy' : 'Basic programs'}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {getCurrencySymbol()}0
                </span>
                <span className="text-gray-500">{getText('perMonth')}</span>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  {language === 'uk' ? '2 базові програми' : language === 'cs' ? '2 základní programy' : '2 basic programs'}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  {language === 'uk' ? 'Відстеження прогресу' : language === 'cs' ? 'Sledování pokroku' : 'Progress tracking'}
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <Check className="w-5 h-5 text-green-500" />
                  {language === 'uk' ? 'Досягнення' : language === 'cs' ? 'Úspěchy' : 'Achievements'}
                </li>
              </ul>

              <Button variant="outline" className="w-full" onClick={() => navigate('/app')}>
                {language === 'uk' ? 'Продовжити безкоштовно' : language === 'cs' ? 'Pokračovat zdarma' : 'Continue free'}
              </Button>
            </Card>

            {/* Premium plans */}
            {individualPlans.map((plan, index) => {
              const price = getLocalizedPrice(plan, getCurrency() as any, billingPeriod === 'yearly');
              const isPopular = plan.is_featured;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Card className={`p-6 border-2 relative ${
                    isPopular ? 'border-primary-500 shadow-lg shadow-primary-100' : 'border-gray-200'
                  }`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {getText('mostPopular')}
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'uk' ? plan.name_uk : language === 'cs' ? plan.name_cs : plan.name_en}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {language === 'uk' ? plan.description_uk : language === 'cs' ? plan.description_cs : plan.description_en}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(price, getCurrency().toUpperCase())}
                      </span>
                      <span className="text-gray-500">
                        {billingPeriod === 'yearly' ? getText('perYear') : getText('perMonth')}
                      </span>
                    </div>

                    {plan.trial_days > 0 && (
                      <div className="mb-4 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {plan.trial_days} {language === 'uk' ? 'днів безкоштовно' : language === 'cs' ? 'dní zdarma' : 'days free'}
                        </span>
                      </div>
                    )}

                    <ul className="space-y-3 mb-6">
                      {getFeatures('individual').map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600">
                          <Check className="w-5 h-5 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isPopular ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => handleSubscribe(plan)}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {plan.trial_days > 0 ? getText('startTrial') : getText('subscribe')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Team Plans */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getText('forCoaches')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamPlans.map((plan, index) => {
              const price = getLocalizedPrice(plan, getCurrency() as any, billingPeriod === 'yearly');
              const isPopular = plan.is_featured;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Card className={`p-6 border-2 relative ${
                    isPopular ? 'border-indigo-500 shadow-lg shadow-indigo-100' : 'border-gray-200'
                  }`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-indigo-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {getText('mostPopular')}
                        </span>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {language === 'uk' ? plan.name_uk : language === 'cs' ? plan.name_cs : plan.name_en}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">
                        {language === 'uk' ? plan.description_uk : language === 'cs' ? plan.description_cs : plan.description_en}
                      </p>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(price, getCurrency().toUpperCase())}
                      </span>
                      <span className="text-gray-500">
                        {billingPeriod === 'yearly' ? getText('perYear') : getText('perMonth')}
                      </span>
                    </div>

                    {plan.trial_days > 0 && (
                      <div className="mb-4 flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {plan.trial_days} {language === 'uk' ? 'днів безкоштовно' : language === 'cs' ? 'dní zdarma' : 'days free'}
                        </span>
                      </div>
                    )}

                    <ul className="space-y-3 mb-6">
                      {getFeatures('team').map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600">
                          <Check className="w-5 h-5 text-green-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isPopular ? 'primary' : 'outline'}
                      className="w-full"
                      onClick={() => handleSubscribe(plan)}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {plan.trial_days > 0 ? getText('startTrial') : getText('subscribe')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Promo code */}
        <div className="mt-12 max-w-md mx-auto">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {getText('promoCode')}
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError('');
                }}
                placeholder="PROMO2024"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Button variant="outline">
                {getText('apply')}
              </Button>
            </div>
            {promoError && (
              <p className="text-red-500 text-sm mt-2">{promoError}</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

