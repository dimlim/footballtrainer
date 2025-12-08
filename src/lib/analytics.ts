// @ts-nocheck
/**
 * Analytics & DataLayer Service
 * Pushes events to dataLayer for Google Tag Manager / GA4
 */

// Declare dataLayer type
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Initialize dataLayer
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

// Push event to dataLayer
export function pushEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventParams,
    timestamp: new Date().toISOString(),
  });

  // Debug in development
  if ((import.meta as any).env?.DEV) {
    console.log('📊 DataLayer Push:', eventName, eventParams);
  }
}

// ==================== USER EVENTS ====================

export function trackUserRegistration(method: string, role: string) {
  pushEvent('user_registration', {
    method, // email, google, etc.
    user_role: role, // player, coach, parent
  });
}

export function trackUserLogin(method: string) {
  pushEvent('user_login', {
    method,
  });
}

export function trackUserLogout() {
  pushEvent('user_logout');
}

export function trackProfileUpdate(fields: string[]) {
  pushEvent('profile_update', {
    updated_fields: fields.join(','),
  });
}

// ==================== TRAINING EVENTS ====================

export function trackProgramStart(programId: string, programName: string, category: string) {
  pushEvent('program_start', {
    program_id: programId,
    program_name: programName,
    program_category: category,
  });
}

export function trackProgramComplete(programId: string, programName: string, daysCompleted: number) {
  pushEvent('program_complete', {
    program_id: programId,
    program_name: programName,
    days_completed: daysCompleted,
  });
}

export function trackDayStart(programId: string, dayNumber: number) {
  pushEvent('training_day_start', {
    program_id: programId,
    day_number: dayNumber,
  });
}

export function trackDayComplete(programId: string, dayNumber: number, xpEarned: number, duration?: number) {
  pushEvent('training_day_complete', {
    program_id: programId,
    day_number: dayNumber,
    xp_earned: xpEarned,
    duration_seconds: duration,
  });
}

export function trackExerciseComplete(exerciseId: string, exerciseType: string, xpEarned: number) {
  pushEvent('exercise_complete', {
    exercise_id: exerciseId,
    exercise_type: exerciseType,
    xp_earned: xpEarned,
  });
}

export function trackMeasurementSaved(exerciseId: string, value: string) {
  pushEvent('measurement_saved', {
    exercise_id: exerciseId,
    measurement_value: value,
  });
}

// ==================== ACHIEVEMENT EVENTS ====================

export function trackAchievementUnlocked(achievementId: string, achievementName: string, xpReward: number) {
  pushEvent('achievement_unlocked', {
    achievement_id: achievementId,
    achievement_name: achievementName,
    xp_reward: xpReward,
  });
}

// ==================== TEAM EVENTS ====================

export function trackTeamCreate(teamId: string, teamName: string) {
  pushEvent('team_create', {
    team_id: teamId,
    team_name: teamName,
  });
}

export function trackTeamJoin(teamId: string, method: string) {
  pushEvent('team_join', {
    team_id: teamId,
    join_method: method, // code, invite
  });
}

export function trackTeamLeave(teamId: string) {
  pushEvent('team_leave', {
    team_id: teamId,
  });
}

// ==================== ENGAGEMENT EVENTS ====================

export function trackPageView(pageName: string, pageUrl: string) {
  pushEvent('page_view', {
    page_name: pageName,
    page_url: pageUrl,
  });
}

export function trackStreakUpdate(currentStreak: number, isNewRecord: boolean) {
  pushEvent('streak_update', {
    current_streak: currentStreak,
    is_new_record: isNewRecord,
  });
}

export function trackLevelUp(newLevel: number, totalXp: number) {
  pushEvent('level_up', {
    new_level: newLevel,
    total_xp: totalXp,
  });
}

// ==================== FITNESS TRACKER EVENTS ====================

export function trackFitnessTrackerConnect(provider: string) {
  pushEvent('fitness_tracker_connect', {
    provider, // web, apple_health, google_fit
  });
}

export function trackFitnessTrackerDisconnect(provider: string) {
  pushEvent('fitness_tracker_disconnect', {
    provider,
  });
}

export function trackWorkoutSessionStart(programId?: string, dayKey?: string) {
  pushEvent('workout_session_start', {
    program_id: programId,
    day_key: dayKey,
  });
}

export function trackWorkoutSessionEnd(duration: number, steps: number, calories: number, heartRateAvg?: number) {
  pushEvent('workout_session_end', {
    duration_seconds: duration,
    steps,
    calories_burned: calories,
    heart_rate_avg: heartRateAvg,
  });
}

// ==================== NOTIFICATION EVENTS ====================

export function trackNotificationPermission(granted: boolean) {
  pushEvent('notification_permission', {
    permission_granted: granted,
  });
}

export function trackNotificationSubscribe() {
  pushEvent('notification_subscribe');
}

export function trackNotificationUnsubscribe() {
  pushEvent('notification_unsubscribe');
}

export function trackNotificationClick(notificationType: string) {
  pushEvent('notification_click', {
    notification_type: notificationType,
  });
}

// ==================== APP EVENTS ====================

export function trackAppInstall() {
  pushEvent('app_install', {
    platform: 'pwa',
  });
}

export function trackAppUpdate(version: string) {
  pushEvent('app_update', {
    version,
  });
}

export function trackOfflineMode(isOffline: boolean) {
  pushEvent('offline_mode', {
    is_offline: isOffline,
  });
}

export function trackSyncComplete(itemsSynced: number) {
  pushEvent('sync_complete', {
    items_synced: itemsSynced,
  });
}

// ==================== ERROR EVENTS ====================

export function trackError(errorType: string, errorMessage: string, context?: string) {
  pushEvent('app_error', {
    error_type: errorType,
    error_message: errorMessage,
    error_context: context,
  });
}

// ==================== E-COMMERCE (for future premium) ====================

export function trackViewProgram(programId: string, programName: string, isPremium: boolean, price?: number) {
  pushEvent('view_item', {
    item_id: programId,
    item_name: programName,
    item_category: 'training_program',
    is_premium: isPremium,
    price,
    currency: 'USD',
  });
}

export function trackPurchaseStart(programId: string, programName: string, price: number) {
  pushEvent('begin_checkout', {
    item_id: programId,
    item_name: programName,
    price,
    currency: 'USD',
  });
}

export function trackPurchaseComplete(programId: string, programName: string, price: number, transactionId: string) {
  pushEvent('purchase', {
    transaction_id: transactionId,
    item_id: programId,
    item_name: programName,
    price,
    currency: 'USD',
  });
}

