import React from 'react';
import { Zap, Loader2, Cloud } from 'lucide-react';
import { Avatar, Progress } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { calculateLevel, calculateLevelProgress } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface HeaderProps {
  totalXp?: number;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ totalXp = 0, isSyncing = false }) => {
  const { t } = useTranslation();
  const { profile, user } = useAuthStore();
  
  const level = calculateLevel(totalXp);
  const levelProgress = calculateLevelProgress(totalXp);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Zap fill="currentColor" className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-lg italic tracking-tight text-gray-900">
                FOOTBALL TRAINER
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                {t('welcome.subtitle')}
                {isSyncing && <Loader2 className="w-3 h-3 animate-spin text-primary-500" />}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <div className="text-xs font-bold text-gray-700">
                {profile?.full_name || 'Guest'}
              </div>
              <div className="text-[10px] text-gray-500 font-mono flex items-center justify-end gap-1">
                {totalXp} XP
                {user && <Cloud className="w-2.5 h-2.5 text-success-500" fill="currentColor" />}
              </div>
            </div>
            <Avatar 
              name={profile?.full_name} 
              src={profile?.avatar_url}
              size="md"
            />
          </div>
        </div>

        {/* Level Progress */}
        <div className="flex items-center gap-2">
          <Progress 
            value={levelProgress} 
            className="flex-1" 
            size="sm"
          />
          <div className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
            {t('stats.level')} {level}
          </div>
        </div>
      </div>
    </header>
  );
};

