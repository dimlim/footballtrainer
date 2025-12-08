import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { OfflineIndicator } from '@/components/ui';
import { useOfflineCache } from '@/hooks/useOffline';
import { useAuthStore } from '@/stores/authStore';

interface AppLayoutProps {
  totalXp?: number;
  isSyncing?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ totalXp = 0, isSyncing = false }) => {
  const { profile } = useAuthStore();
  const { cacheAllData } = useOfflineCache();

  // Cache data for offline use when user is logged in
  useEffect(() => {
    if (profile?.id) {
      cacheAllData(profile.id);
    }
  }, [profile?.id, cacheAllData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline indicator at top */}
      <OfflineIndicator />
      
      <Header totalXp={totalXp} isSyncing={isSyncing} />
      
      <main className="pb-20">
        <Outlet />
      </main>
      
      <BottomNav />
    </div>
  );
};

