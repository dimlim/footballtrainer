import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileQuestion, 
  Search, 
  Users, 
  Trophy, 
  Calendar,
  Target,
  Inbox,
  WifiOff
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

type EmptyStateType = 
  | 'no-data' 
  | 'no-results' 
  | 'no-team' 
  | 'no-achievements' 
  | 'no-programs'
  | 'no-calendar'
  | 'offline'
  | 'error';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const emptyStateConfig: Record<EmptyStateType, { 
  icon: React.ReactNode; 
  defaultTitle: Record<string, string>;
  defaultDescription: Record<string, string>;
  color: string;
}> = {
  'no-data': {
    icon: <Inbox className="w-16 h-16" />,
    defaultTitle: { uk: 'Немає даних', en: 'No data', cs: 'Žádná data' },
    defaultDescription: { uk: 'Тут поки нічого немає', en: 'Nothing here yet', cs: 'Zatím zde nic není' },
    color: 'text-gray-400',
  },
  'no-results': {
    icon: <Search className="w-16 h-16" />,
    defaultTitle: { uk: 'Нічого не знайдено', en: 'No results found', cs: 'Nic nenalezeno' },
    defaultDescription: { uk: 'Спробуйте змінити параметри пошуку', en: 'Try changing your search criteria', cs: 'Zkuste změnit kritéria vyhledávání' },
    color: 'text-amber-400',
  },
  'no-team': {
    icon: <Users className="w-16 h-16" />,
    defaultTitle: { uk: 'Немає команди', en: 'No team', cs: 'Žádný tým' },
    defaultDescription: { uk: 'Створіть команду або приєднайтесь до існуючої', en: 'Create a team or join an existing one', cs: 'Vytvořte tým nebo se připojte k existujícímu' },
    color: 'text-blue-400',
  },
  'no-achievements': {
    icon: <Trophy className="w-16 h-16" />,
    defaultTitle: { uk: 'Немає досягнень', en: 'No achievements yet', cs: 'Zatím žádné úspěchy' },
    defaultDescription: { uk: 'Почніть тренуватись, щоб отримати досягнення', en: 'Start training to earn achievements', cs: 'Začněte trénovat a získejte úspěchy' },
    color: 'text-purple-400',
  },
  'no-programs': {
    icon: <Target className="w-16 h-16" />,
    defaultTitle: { uk: 'Немає програм', en: 'No programs', cs: 'Žádné programy' },
    defaultDescription: { uk: 'Оберіть програму для початку тренувань', en: 'Choose a program to start training', cs: 'Vyberte program pro zahájení tréninku' },
    color: 'text-green-400',
  },
  'no-calendar': {
    icon: <Calendar className="w-16 h-16" />,
    defaultTitle: { uk: 'Календар порожній', en: 'Calendar is empty', cs: 'Kalendář je prázdný' },
    defaultDescription: { uk: 'Почніть програму, щоб бачити розклад', en: 'Start a program to see your schedule', cs: 'Začněte program pro zobrazení rozvrhu' },
    color: 'text-orange-400',
  },
  'offline': {
    icon: <WifiOff className="w-16 h-16" />,
    defaultTitle: { uk: 'Немає з\'єднання', en: 'No connection', cs: 'Žádné připojení' },
    defaultDescription: { uk: 'Перевірте підключення до інтернету', en: 'Check your internet connection', cs: 'Zkontrolujte připojení k internetu' },
    color: 'text-red-400',
  },
  'error': {
    icon: <FileQuestion className="w-16 h-16" />,
    defaultTitle: { uk: 'Щось пішло не так', en: 'Something went wrong', cs: 'Něco se pokazilo' },
    defaultDescription: { uk: 'Спробуйте оновити сторінку', en: 'Try refreshing the page', cs: 'Zkuste obnovit stránku' },
    color: 'text-red-400',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  icon,
  action,
  className,
}) => {
  const config = emptyStateConfig[type];
  const language = 'uk'; // TODO: Get from context

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {/* Icon with animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn('mb-6', config.color)}
      >
        {icon || config.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {title || config.defaultTitle[language] || config.defaultTitle.en}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 dark:text-gray-400 max-w-sm"
      >
        {description || config.defaultDescription[language] || config.defaultDescription.en}
      </motion.p>

      {/* Action button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;

