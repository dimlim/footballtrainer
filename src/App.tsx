import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { AppLayout } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import { OnboardingFlow } from '@/components/onboarding';
import { 
  AuthPage, 
  HomePage, 
  ProfilePage, 
  StatsPage, 
  CalendarPage, 
  TeamPage, 
  AchievementsPage,
  ProgramsPage,
  ProgramDetailPage,
  ProgramDayPage,
  SubscriptionsPage,
  SubscriptionSuccessPage,
  PricingPage,
  SchedulePage
} from '@/pages';
import { CoachProgramsPage, ProgramEditorPage, DayEditorPage, TeamProgramsPage, PlayerActivityPage, PlayerDetailPage } from '@/pages/coach';
import { AdminProgramsPage, AdminProgramEditorPage } from '@/pages/admin';
import { AchievementUnlockedModal } from '@/components/achievements';
import { Loader2 } from 'lucide-react';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { initialize, isInitialized, profile, updateProfile } = useAuthStore();
  const { newAchievement, dismissNewAchievement, loadEarnedAchievements } = useAchievementStore();
  const [totalXp] = useState(0);
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
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

        {/* Subscription Routes */}
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

        {/* Redirect root to app or auth */}
        <Route path="/" element={<Navigate to="/app" replace />} />
        
        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>

      {/* Achievement Unlocked Modal */}
      <AchievementUnlockedModal 
        achievement={newAchievement} 
        onClose={dismissNewAchievement} 
      />

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </ToastProvider>
  );
}

export default App;

