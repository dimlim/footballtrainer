import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
export const SubscriptionManager: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { user } = useAuthStore();
  const {
    teamSubscriptions,
    subscriptionPlans,
    isLoading,
    loadUserSubscriptions,
    loadTeamSubscriptions,
    loadSubscriptionPlans,
    openCustomerPortal,
    getActiveSubscription
  } = useSubscriptionStore();

  useEffect(() => {
    if (user?.id) {
      loadUserSubscriptions(user.id);
      loadTeamSubscriptions(user.id);
      loadSubscriptionPlans();
    }
  }, [user?.id]);

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'subscription': { uk: 'Підписка', en: 'Subscription', cs: 'Předplatné' },
      'noSubscription': { uk: 'Немає активної підписки', en: 'No active subscription', cs: 'Žádné aktivní předplatné' },
      'subscribeTo': { uk: 'Підпишіться для доступу до преміум програм', en: 'Subscribe to access premium programs', cs: 'Předplaťte si přístup k prémiovým programům' },
      'viewPlans': { uk: 'Переглянути плани', en: 'View Plans', cs: 'Zobrazit plány' },
      'managePlan': { uk: 'Керувати підпискою', en: 'Manage Subscription', cs: 'Spravovat předplatné' },
      'currentPlan': { uk: 'Поточний план', en: 'Current Plan', cs: 'Aktuální plán' },
      'nextBilling': { uk: 'Наступний платіж', en: 'Next billing', cs: 'Další platba' },
      'trialEnds': { uk: 'Пробний період закінчується', en: 'Trial ends', cs: 'Zkušební období končí' },
      'canceledOn': { uk: 'Скасовано', en: 'Canceled on', cs: 'Zrušeno' },
      'accessUntil': { uk: 'Доступ до', en: 'Access until', cs: 'Přístup do' },
      'active': { uk: 'Активна', en: 'Active', cs: 'Aktivní' },
      'trialing': { uk: 'Пробний період', en: 'Trial', cs: 'Zkušební období' },
      'canceled': { uk: 'Скасована', en: 'Canceled', cs: 'Zrušeno' },
      'pastDue': { uk: 'Прострочено', en: 'Past Due', cs: 'Po splatnosti' },
      'teamSubscriptions': { uk: 'Командні підписки', en: 'Team Subscriptions', cs: 'Týmová předplatná' },
      'paymentHistory': { uk: 'Історія платежів', en: 'Payment History', cs: 'Historie plateb' },
      'perMonth': { uk: '/місяць', en: '/month', cs: '/měsíc' },
      'perYear': { uk: '/рік', en: '/year', cs: '/rok' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'bg-green-100 text-green-700', text: getText('active') },
      trialing: { color: 'bg-blue-100 text-blue-700', text: getText('trialing') },
      canceled: { color: 'bg-gray-100 text-gray-700', text: getText('canceled') },
      past_due: { color: 'bg-red-100 text-red-700', text: getText('pastDue') },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return 'Unknown';
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return 'Unknown';
    return language === 'uk' ? plan.name_uk : language === 'cs' ? plan.name_cs : plan.name_en;
  };

  const activeSub = getActiveSubscription();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        {getText('subscription')}
      </h3>

      {/* No active subscription */}
      {!activeSub && (
        <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Crown className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {getText('noSubscription')}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              {getText('subscribeTo')}
            </p>
            <Button onClick={() => navigate('/app/pricing')}>
              {getText('viewPlans')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* Active subscription */}
      {activeSub && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-2 border-primary-200 bg-primary-50/50 dark:bg-primary-900/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {getText('currentPlan')}: {getPlanName(activeSub.subscription_plan_id)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {activeSub.billing_period === 'yearly' ? getText('perYear') : getText('perMonth')}
                  </p>
                </div>
              </div>
              {getStatusBadge(activeSub.status)}
            </div>

            {/* Subscription details */}
            <div className="space-y-2 mb-4">
              {activeSub.status === 'trialing' && activeSub.trial_end && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Clock className="w-4 h-4" />
                  {getText('trialEnds')}: {formatDate(activeSub.trial_end)}
                </div>
              )}

              {activeSub.status === 'active' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {getText('nextBilling')}: {formatDate(activeSub.current_period_end)}
                </div>
              )}

              {activeSub.canceled_at && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  {getText('canceledOn')}: {formatDate(activeSub.canceled_at)}
                  <br />
                  {getText('accessUntil')}: {formatDate(activeSub.current_period_end)}
                </div>
              )}
            </div>

            {/* Manage button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => user?.id && openCustomerPortal(user.id)}
            >
              {getText('managePlan')}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Team subscriptions */}
      {teamSubscriptions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            {getText('teamSubscriptions')}
          </h4>
          <div className="space-y-3">
            {teamSubscriptions.map((sub) => (
              <Card key={sub.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Team: {sub.team_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getText('accessUntil')}: {formatDate(sub.current_period_end)}
                    </p>
                  </div>
                  {getStatusBadge(sub.status)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
