// @ts-nocheck
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { AppLayout } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import { OnboardingFlow } from '@/components/onboarding';
import { AchievementUnlockedModal } from '@/components/achievements';
import { InstallPrompt } from '@/components/pwa';
import { FEATURES } from '@/config/features';
import { Loader2 } from 'lucide-react';

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })));
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const StatsPage = lazy(() => import('@/pages/StatsPage').then(m => ({ default: m.StatsPage })));
const CalendarPage = lazy(() => import('@/pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const TeamPage = lazy(() => import('@/pages/TeamPage').then(m => ({ default: m.TeamPage })));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const ProgramsPage = lazy(() => import('@/pages/ProgramsPage').then(m => ({ default: m.ProgramsPage })));
const ProgramDetailPage = lazy(() => import('@/pages/ProgramDetailPage').then(m => ({ default: m.ProgramDetailPage })));
const ProgramDayPage = lazy(() => import('@/pages/ProgramDayPage').then(m => ({ default: m.ProgramDayPage })));
const SchedulePage = lazy(() => import('@/pages/SchedulePage').then(m => ({ default: m.SchedulePage })));

// Subscription pages
const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const SubscriptionSuccessPage = lazy(() => import('@/pages/SubscriptionSuccessPage').then(m => ({ default: m.SubscriptionSuccessPage })));
const PricingPage = lazy(() => import('@/pages/PricingPage').then(m => ({ default: m.PricingPage })));

// Coach pages
const CoachProgramsPage = lazy(() => import('@/pages/coach/CoachProgramsPage').then(m => ({ default: m.CoachProgramsPage })));
const ProgramEditorPage = lazy(() => import('@/pages/coach/ProgramEditorPage').then(m => ({ default: m.ProgramEditorPage })));
const DayEditorPage = lazy(() => import('@/pages/coach/DayEditorPage').then(m => ({ default: m.DayEditorPage })));
const TeamProgramsPage = lazy(() => import('@/pages/coach/TeamProgramsPage').then(m => ({ default: m.TeamProgramsPage })));
const PlayerActivityPage = lazy(() => import('@/pages/coach/PlayerActivityPage').then(m => ({ default: m.PlayerActivityPage })));
const PlayerDetailPage = lazy(() => import('@/pages/coach/PlayerDetailPage').then(m => ({ default: m.PlayerDetailPage })));

// Admin pages
const AdminProgramsPage = lazy(() => import('@/pages/admin/AdminProgramsPage').then(m => ({ default: m.AdminProgramsPage })));
const AdminProgramEditorPage = lazy(() => import('@/pages/admin/AdminProgramEditorPage').then(m => ({ default: m.AdminProgramEditorPage })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
      <p className="text-sm text-gray-500">Завантаження...</p>
    </div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initialize, isInitialized, profile, updateProfile } = useAuthStore();
  const { newAchievement, dismissNewAchievement, loadEarnedAchievements } = useAchievementStore();
  const [totalXp] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load achievements when profile is available
  useEffect(() => {
    if (profile?.id) {
      loadEarnedAchievements(profile.id);
      
      // Check if user needs onboarding (new user without role set)
      if (!profile.onboarding_completed && !profile.role) {
        setShowOnboarding(true);
      }
    }
  }, [profile?.id, profile?.onboarding_completed, profile?.role, loadEarnedAchievements]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    if (profile?.id) {
      await updateProfile({ onboarding_completed: true });
    }
  };

  if (!isInitialized) {
    return <PageLoader />;
  }

  return (
    <ToastProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected App Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout totalXp={totalXp} />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Programs Routes */}
          <Route
            path="/app/programs"
            element={
              <ProtectedRoute>
                <AppLayout totalXp={totalXp} />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProgramsPage />} />
          </Route>

          {/* Program Detail Page */}
          <Route
            path="/app/program/:programId"
            element={
              <ProtectedRoute>
                <ProgramDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Program Day Page - Full screen training */}
          <Route
            path="/app/program/:programId/day/:dayNumber"
            element={
              <ProtectedRoute>
                <ProgramDayPage />
              </ProtectedRoute>
            }
          />

          {/* Coach Routes */}
          <Route
            path="/app/coach/programs"
            element={
              <ProtectedRoute>
                <CoachProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/coach/programs/:programId"
            element={
              <ProtectedRoute>
                <ProgramEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/coach/programs/:programId/day/:dayId"
            element={
              <ProtectedRoute>
                <DayEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/coach/team/:teamId/programs"
            element={
              <ProtectedRoute>
                <TeamProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/coach/activity"
            element={
              <ProtectedRoute>
                <PlayerActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/coach/player/:playerId"
            element={
              <ProtectedRoute>
                <PlayerDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/programs"
            element={
              <ProtectedRoute>
                <AdminProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/programs/:programId"
            element={
              <ProtectedRoute>
                <AdminProgramEditorPage />
              </ProtectedRoute>
            }
          />

          {/* Subscription Routes - only if enabled */}
          {FEATURES.SUBSCRIPTIONS_ENABLED && (
            <>
              <Route
                path="/app/pricing"
                element={
                  <ProtectedRoute>
                    <PricingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/subscriptions"
                element={
                  <ProtectedRoute>
                    <SubscriptionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/subscription/success"
                element={
                  <ProtectedRoute>
                    <SubscriptionSuccessPage />
                  </ProtectedRoute>
                }
              />
            </>
          )}

          {/* Redirect root to app or auth */}
          <Route path="/" element={<Navigate to="/app" replace />} />
          
          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </Suspense>

      {/* Achievement Unlocked Modal */}
      <AchievementUnlockedModal 
        achievement={newAchievement} 
        onClose={dismissNewAchievement} 
      />

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </ToastProvider>
  );
}

export default App;
