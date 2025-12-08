import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useTranslation } from '@/lib/i18n';
import { PlayerCalendarEntry, TRAINING_DAY_TYPE_LABELS, TRAINING_DAY_TYPE_ICONS } from '@/types/schedule';
import { format, addDays, startOfWeek, isSameDay, isToday, isPast } from 'date-fns';
import { uk, enUS, cs } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RescheduleModalProps {
  entry: PlayerCalendarEntry;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  entry,
  onClose,
  onSuccess
}) => {
  const { language } = useTranslation();
  const { rescheduleTraining, calendar, isLoading, error } = useScheduleStore();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  
  const locales = { uk, en: enUS, cs };
  const locale = locales[language as keyof typeof locales] || enUS;
  const dayTypeLabels = TRAINING_DAY_TYPE_LABELS[language as keyof typeof TRAINING_DAY_TYPE_LABELS] || TRAINING_DAY_TYPE_LABELS.en;
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  
  const isDateAvailable = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingEntry = calendar.find(
      e => e.calendar_date === dateStr && e.day_type !== 'rest' && e.id !== entry.id
    );
    return !existingEntry && !isPast(date);
  };
  
  const handleReschedule = async () => {
    if (!selectedDate) return;
    
    const success = await rescheduleTraining(entry.id, selectedDate, reason || undefined);
    if (success) {
      onSuccess?.();
      onClose();
    }
  };
  
  const getText = (key: string): string => {
    const texts: Record<string, Record<string, string>> = {
      title: {
        uk: 'Перенести тренування',
        en: 'Reschedule Training',
        cs: 'Přeplánovat trénink'
      },
      from: {
        uk: 'З',
        en: 'From',
        cs: 'Z'
      },
      to: {
        uk: 'На',
        en: 'To',
        cs: 'Na'
      },
      selectDate: {
        uk: 'Оберіть нову дату',
        en: 'Select new date',
        cs: 'Vyberte nové datum'
      },
      reason: {
        uk: 'Причина (необов\'язково)',
        en: 'Reason (optional)',
        cs: 'Důvod (volitelné)'
      },
      reasonPlaceholder: {
        uk: 'Чому переносите тренування?',
        en: 'Why are you rescheduling?',
        cs: 'Proč přeplánováváte?'
      },
      cancel: {
        uk: 'Скасувати',
        en: 'Cancel',
        cs: 'Zrušit'
      },
      confirm: {
        uk: 'Підтвердити',
        en: 'Confirm',
        cs: 'Potvrdit'
      },
      dateOccupied: {
        uk: 'На цю дату вже заплановано тренування',
        en: 'This date already has training scheduled',
        cs: 'Na toto datum je již naplánován trénink'
      },
      pastDate: {
        uk: 'Не можна обрати минулу дату',
        en: 'Cannot select past date',
        cs: 'Nelze vybrat minulé datum'
      }
    };
    return texts[key]?.[language] || texts[key]?.['en'] || key;
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{getText('title')}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Entry Info */}
          <div className="bg-gray-50 p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{TRAINING_DAY_TYPE_ICONS[entry.day_type]}</span>
              <span className="font-medium">{dayTypeLabels[entry.day_type]}</span>
            </div>
            <div className="text-sm text-gray-500">
              {getText('from')}: {format(new Date(entry.calendar_date), 'EEEE, d MMMM', { locale })}
            </div>
          </div>
          
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeekStart(prev => addDays(prev, -7))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <span className="font-medium text-gray-700">
              {format(currentWeekStart, 'd MMM', { locale })} - {format(addDays(currentWeekStart, 6), 'd MMM', { locale })}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Date Selector */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, i) => {
              const isAvailable = isDateAvailable(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                  whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                  onClick={() => isAvailable && setSelectedDate(date)}
                  disabled={!isAvailable}
                  className={cn(
                    'p-3 rounded-xl text-center transition-all',
                    isSelected && 'bg-primary-500 text-white shadow-lg',
                    !isSelected && isAvailable && 'bg-gray-100 hover:bg-gray-200',
                    !isAvailable && 'bg-gray-50 text-gray-300 cursor-not-allowed',
                    isCurrentDay && !isSelected && 'ring-2 ring-primary-300'
                  )}
                >
                  <div className="text-[10px] font-medium mb-1">
                    {format(date, 'EEE', { locale })}
                  </div>
                  <div className="text-sm font-semibold">
                    {format(date, 'd')}
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* Selected Date Info */}
          {selectedDate && (
            <div className="bg-primary-50 p-3 rounded-xl">
              <div className="text-sm text-primary-700">
                {getText('to')}: {format(selectedDate, 'EEEE, d MMMM', { locale })}
              </div>
            </div>
          )}
          
          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getText('reason')}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={getText('reasonPlaceholder')}
              className="w-full p-3 border rounded-xl resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
            />
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {getText('cancel')}
          </Button>
          
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || isLoading}
            className="flex-1"
          >
            {getText('confirm')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default RescheduleModal;

