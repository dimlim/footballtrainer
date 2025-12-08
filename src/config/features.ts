/**
 * Feature Flags
 * Use these to enable/disable features in the app
 */

export const FEATURES = {
  // Subscription/Payment features - set to true when ready to launch
  SUBSCRIPTIONS_ENABLED: false,
  
  // Premium programs - show premium badge but allow access for now
  PREMIUM_PROGRAMS_LOCKED: false,
  
  // Coach features
  COACH_FEATURES_ENABLED: true,
  
  // Team features
  TEAM_FEATURES_ENABLED: true,
  
  // Schedule/Calendar features
  SCHEDULE_ENABLED: true,
  
  // Push notifications
  PUSH_NOTIFICATIONS_ENABLED: true,
  
  // Fitness tracker integration
  FITNESS_TRACKER_ENABLED: false,
  
  // Activity logging for coaches
  ACTIVITY_LOGGING_ENABLED: true,
} as const;

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURES): boolean => {
  return FEATURES[feature];
};

