// @ts-nocheck
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, Footprints, MapPin, Watch, Smartphone, 
  Activity, Bluetooth, Check, X,
  RefreshCw, Plus, AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFitnessTracker } from '@/hooks/useFitnessTracker';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface FitnessTrackerSettingsProps {
  playerId: string;
}

export const FitnessTrackerSettings: React.FC<FitnessTrackerSettingsProps> = ({ playerId }) => {
  const { language } = useTranslation();
  const {
    support,
    isHRConnected,
    connectHR,
    disconnectHR,
    weeklyData,
    saveManualData,
  } = useFitnessTracker(playerId);

  const [isConnecting, setIsConnecting] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualSteps, setManualSteps] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualActiveMinutes, setManualActiveMinutes] = useState('');

  const getText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      'title': { uk: 'Фітнес-трекери', en: 'Fitness Trackers', cs: 'Fitness trackery' },
      'webSupport': { uk: 'Підтримка браузера', en: 'Browser Support', cs: 'Podpora prohlížeče' },
      'stepCounter': { uk: 'Крокомір', en: 'Step Counter', cs: 'Krokoměr' },
      'heartRate': { uk: 'Пульсометр', en: 'Heart Rate', cs: 'Tepová frekvence' },
      'gps': { uk: 'GPS трекінг', en: 'GPS Tracking', cs: 'GPS sledování' },
      'motion': { uk: 'Датчик руху', en: 'Motion Sensor', cs: 'Pohybový senzor' },
      'supported': { uk: 'Підтримується', en: 'Supported', cs: 'Podporováno' },
      'notSupported': { uk: 'Не підтримується', en: 'Not supported', cs: 'Nepodporováno' },
      'connectedDevices': { uk: "Підключені пристрої", en: 'Connected Devices', cs: 'Připojená zařízení' },
      'connectHR': { uk: 'Підключити пульсометр', en: 'Connect Heart Rate Monitor', cs: 'Připojit měřič tepu' },
      'disconnect': { uk: 'Відключити', en: 'Disconnect', cs: 'Odpojit' },
      'connecting': { uk: 'Підключення...', en: 'Connecting...', cs: 'Připojování...' },
      'connected': { uk: 'Підключено', en: 'Connected', cs: 'Připojeno' },
      'manualEntry': { uk: 'Ручне введення', en: 'Manual Entry', cs: 'Ruční zadání' },
      'steps': { uk: 'Кроки', en: 'Steps', cs: 'Kroky' },
      'calories': { uk: 'Калорії', en: 'Calories', cs: 'Kalorie' },
      'activeMinutes': { uk: 'Активні хвилини', en: 'Active Minutes', cs: 'Aktivní minuty' },
      'save': { uk: 'Зберегти', en: 'Save', cs: 'Uložit' },
      'todayStats': { uk: 'Статистика сьогодні', en: "Today's Stats", cs: 'Dnešní statistiky' },
      'weeklyStats': { uk: 'За тиждень', en: 'Weekly Stats', cs: 'Týdenní statistiky' },
      'noData': { uk: 'Немає даних', en: 'No data', cs: 'Žádná data' },
      'appleHealth': { uk: 'Apple Health', en: 'Apple Health', cs: 'Apple Health' },
      'googleFit': { uk: 'Google Fit', en: 'Google Fit', cs: 'Google Fit' },
      'comingSoon': { uk: 'Скоро', en: 'Coming Soon', cs: 'Již brzy' },
      'nativeAppRequired': { uk: 'Потрібен нативний додаток', en: 'Native app required', cs: 'Vyžaduje nativní aplikaci' },
      'bluetoothHint': { uk: 'Для підключення пульсометра потрібен Bluetooth', en: 'Bluetooth required for heart rate monitor', cs: 'Pro měřič tepu je vyžadován Bluetooth' },
    };
    return texts[key]?.[language] || texts[key]?.en || key;
  };

  const handleConnectHR = async () => {
    setIsConnecting(true);
    await connectHR();
    setIsConnecting(false);
  };

  const handleSaveManual = async () => {
    await saveManualData({
      steps: manualSteps ? parseInt(manualSteps) : undefined,
      calories: manualCalories ? parseInt(manualCalories) : undefined,
      activeMinutes: manualActiveMinutes ? parseInt(manualActiveMinutes) : undefined,
    });
    setManualSteps('');
    setManualCalories('');
    setManualActiveMinutes('');
    setShowManualEntry(false);
  };

  // Calculate weekly totals
  const weeklyTotals = weeklyData.reduce((acc, day) => ({
    steps: acc.steps + (day.steps || 0),
    calories: acc.calories + (day.calories || 0),
    activeMinutes: acc.activeMinutes + (day.activeMinutes || 0),
  }), { steps: 0, calories: 0, activeMinutes: 0 });

  const supportItems = [
    { key: 'pedometer', icon: <Footprints className="w-5 h-5" />, label: getText('stepCounter'), supported: support.pedometer },
    { key: 'heartRate', icon: <Heart className="w-5 h-5" />, label: getText('heartRate'), supported: support.heartRate },
    { key: 'geolocation', icon: <MapPin className="w-5 h-5" />, label: getText('gps'), supported: support.geolocation },
    { key: 'deviceMotion', icon: <Activity className="w-5 h-5" />, label: getText('motion'), supported: support.deviceMotion },
  ];

  const externalTrackers = [
    { 
      id: 'apple_health', 
      name: getText('appleHealth'), 
      icon: <Smartphone className="w-6 h-6" />,
      color: 'bg-red-500',
      available: false,
    },
    { 
      id: 'google_fit', 
      name: getText('googleFit'), 
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-green-500',
      available: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Browser Support */}
      <Card className="p-4">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Watch className="w-5 h-5" />
          {getText('webSupport')}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {supportItems.map((item) => (
            <div 
              key={item.key}
              className={cn(
                'flex items-center gap-2 p-3 rounded-xl',
                item.supported ? 'bg-green-50' : 'bg-gray-50'
              )}
            >
              <div className={item.supported ? 'text-green-600' : 'text-gray-400'}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                <p className={cn(
                  'text-xs',
                  item.supported ? 'text-green-600' : 'text-gray-400'
                )}>
                  {item.supported ? getText('supported') : getText('notSupported')}
                </p>
              </div>
              {item.supported ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Heart Rate Monitor Connection */}
      {support.heartRate && (
        <Card className="p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {getText('heartRate')}
          </h4>
          
          {isHRConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Bluetooth className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{getText('connected')}</p>
                  <p className="text-sm text-gray-500">Bluetooth HR Monitor</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectHR}
              >
                {getText('disconnect')}
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">{getText('bluetoothHint')}</p>
              <Button
                onClick={handleConnectHR}
                disabled={isConnecting}
                leftIcon={isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bluetooth className="w-4 h-4" />}
                className="w-full"
              >
                {isConnecting ? getText('connecting') : getText('connectHR')}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* External Trackers (Coming Soon) */}
      <Card className="p-4">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          {getText('connectedDevices')}
        </h4>
        
        <div className="space-y-3">
          {externalTrackers.map((tracker) => (
            <div 
              key={tracker.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white', tracker.color)}>
                  {tracker.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tracker.name}</p>
                  <p className="text-xs text-gray-500">{getText('nativeAppRequired')}</p>
                </div>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {getText('comingSoon')}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            {language === 'uk' 
              ? 'Інтеграція з Apple Health та Google Fit буде доступна в нативному додатку'
              : language === 'cs'
              ? 'Integrace s Apple Health a Google Fit bude k dispozici v nativní aplikaci'
              : 'Apple Health and Google Fit integration will be available in native app'}
          </p>
        </div>
      </Card>

      {/* Weekly Stats */}
      <Card className="p-4">
        <h4 className="font-bold text-gray-900 mb-3">{getText('weeklyStats')}</h4>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <Footprints className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              {weeklyTotals.steps.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{getText('steps')}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-xl">
            <Activity className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              {weeklyTotals.calories.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{getText('calories')}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <Watch className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              {weeklyTotals.activeMinutes}
            </p>
            <p className="text-xs text-gray-500">{getText('activeMinutes')}</p>
          </div>
        </div>
      </Card>

      {/* Manual Entry */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {getText('manualEntry')}
          </h4>
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="text-primary-600 text-sm font-medium"
          >
            {showManualEntry 
              ? (language === 'uk' ? 'Закрити' : language === 'cs' ? 'Zavřít' : 'Close')
              : (language === 'uk' ? 'Додати' : language === 'cs' ? 'Přidat' : 'Add')}
          </button>
        </div>

        {showManualEntry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('steps')}
              </label>
              <Input
                type="number"
                value={manualSteps}
                onChange={(e) => setManualSteps(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('calories')}
              </label>
              <Input
                type="number"
                value={manualCalories}
                onChange={(e) => setManualCalories(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getText('activeMinutes')}
              </label>
              <Input
                type="number"
                value={manualActiveMinutes}
                onChange={(e) => setManualActiveMinutes(e.target.value)}
                placeholder="0"
              />
            </div>
            <Button 
              onClick={handleSaveManual}
              className="w-full"
              disabled={!manualSteps && !manualCalories && !manualActiveMinutes}
            >
              {getText('save')}
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default FitnessTrackerSettings;

