import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { AppLayout } from '@/components/layout';
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
  ProgramDayPage
} from '@/pages';
import { CoachProgramsPage, ProgramEditorPage, DayEditorPage, TeamProgramsPage } from '@/pages/coach';
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
  const { initialize, isInitialized, profile } = useAuthStore();
  const { newAchievement, dismissNewAchievement, loadEarnedAchievements } = useAchievementStore();
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Load achievements when profile is available
  useEffect(() => {
    if (profile?.id) {
      loadEarnedAchievements(profile.id);
    }
  }, [profile?.id, loadEarnedAchievements]);

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
    <>
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
    </>
  );
}

export default App;

