import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Trophy, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  labelKey: string;
  roles?: ('player' | 'parent' | 'coach')[];
}

const navItems: NavItem[] = [
  { 
    path: '/app', 
    icon: <Home className="w-5 h-5" />, 
    labelKey: 'nav.home',
  },
  { 
    path: '/app/calendar', 
    icon: <Calendar className="w-5 h-5" />, 
    labelKey: 'nav.calendar',
  },
  { 
    path: '/app/team', 
    icon: <Users className="w-5 h-5" />, 
    labelKey: 'nav.team',
  },
  { 
    path: '/app/achievements', 
    icon: <Trophy className="w-5 h-5" />, 
    labelKey: 'stats.achievements',
  },
  { 
    path: '/app/profile', 
    icon: <User className="w-5 h-5" />, 
    labelKey: 'nav.profile',
  },
];

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuthStore();
  const location = useLocation();

  const filteredItems = navItems.filter(item => {
    if (!item.roles) return true;
    return profile?.role && item.roles.includes(profile.role);
  });

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-50 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/app' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[60px]',
                isActive 
                  ? 'text-primary-600' 
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">
                {t(item.labelKey as any)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

