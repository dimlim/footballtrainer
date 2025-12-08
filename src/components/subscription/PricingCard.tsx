import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Users, Clock, Crown } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';
import { formatPrice } from '@/lib/stripe';

interface PricingCardProps {
  title: string;
  description?: string;
  price: number;
  currency?: string;
  interval?: string;
  trialDays?: number;
  features: string[];
  isPopular?: boolean;
  isPremium?: boolean;
  licenseType: 'individual' | 'team';
  maxUsers?: number;
  isLoading?: boolean;
  hasAccess?: boolean;
  isTrialing?: boolean;
  trialEndsAt?: string;
  onSubscribe: () => void;
  onStartTrial?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  currency = 'usd',
  interval,
  trialDays,
  features,
  isPopular,
  isPremium,
  licenseType,
  maxUsers = 1,
  isLoading,
  hasAccess,
  isTrialing,
  trialEndsAt,
  onSubscribe,
  onStartTrial,
}) => {
  const { language } = useTranslation();

  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      'perMonth': { uk: '/місяць', en: '/month', cs: '/měsíc' },
      'perYear': { uk: '/рік', en: '/year', cs: '/rok' },
      'oneTime': { uk: 'одноразово', en: 'one-time', cs: 'jednorázově' },
      'subscribe': { uk: 'Підписатися', en: 'Subscribe', cs: 'Předplatit' },
      'startTrial': { uk: 'Почати пробний період', en: 'Start Free Trial', cs: 'Začít zkušební období' },
      'trialDays': { uk: 'днів безкоштовно', en: 'days free', cs: 'dní zdarma' },
      'popular': { uk: 'Популярний', en: 'Popular', cs: 'Populární' },
      'premium': { uk: 'Преміум', en: 'Premium', cs: 'Premium' },
      'forTeam': { uk: 'Для команди', en: 'For Team', cs: 'Pro tým' },
      'upToPlayers': { uk: 'до гравців', en: 'up to players', cs: 'až hráčů' },
      'currentPlan': { uk: 'Поточний план', en: 'Current Plan', cs: 'Aktuální plán' },
      'trialActive': { uk: 'Пробний період активний', en: 'Trial Active', cs: 'Zkušební období aktivní' },
      'trialEnds': { uk: 'Закінчується', en: 'Ends', cs: 'Končí' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'uk' ? 'uk-UA' : language === 'cs' ? 'cs-CZ' : 'en-US',
      { day: 'numeric', month: 'short' }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`relative overflow-hidden ${
        isPopular ? 'ring-2 ring-blue-500 shadow-xl' : ''
      } ${isPremium ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20' : ''}`}>
        {/* Badge */}
        {(isPopular || isPremium) && (
          <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white ${
            isPopular ? 'bg-blue-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
          }`}>
            {isPopular ? getText('popular') : getText('premium')}
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {licenseType === 'team' ? (
                <Users className="w-5 h-5 text-blue-500" />
              ) : isPremium ? (
                <Crown className="w-5 h-5 text-amber-500" />
              ) : (
                <Zap className="w-5 h-5 text-green-500" />
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                {formatPrice(price, currency)}
              </span>
              {interval && (
                <span className="text-gray-500">
                  {interval === 'month' ? getText('perMonth') : getText('perYear')}
                </span>
              )}
              {!interval && (
                <span className="text-gray-500">{getText('oneTime')}</span>
              )}
            </div>
            
            {licenseType === 'team' && maxUsers > 1 && (
              <p className="text-sm text-blue-600 mt-1">
                <Users className="w-4 h-4 inline mr-1" />
                {getText('upToPlayers')} {maxUsers}
              </p>
            )}

            {trialDays && trialDays > 0 && !hasAccess && !isTrialing && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {trialDays} {getText('trialDays')}
              </p>
            )}
          </div>

          {/* Trial Status */}
          {isTrialing && trialEndsAt && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                {getText('trialActive')}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                {getText('trialEnds')}: {formatDate(trialEndsAt)}
              </p>
            </div>
          )}

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="space-y-2">
            {hasAccess ? (
              <Button
                variant="outline"
                className="w-full"
                disabled
              >
                <Check className="w-4 h-4 mr-2" />
                {getText('currentPlan')}
              </Button>
            ) : (
              <>
                {trialDays && trialDays > 0 && onStartTrial && !isTrialing && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onStartTrial}
                    disabled={isLoading}
                  >
                    {getText('startTrial')}
                  </Button>
                )}
                <Button
                  variant={isPopular ? 'primary' : 'outline'}
                  className={`w-full ${isPopular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  onClick={onSubscribe}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : null}
                  {getText('subscribe')}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

