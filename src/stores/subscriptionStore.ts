// @ts-nocheck
import { create } from 'zustand';
import { 
  stripeService, 
  Product, 
  SubscriptionPlan, 
  UserSubscription, 
  TeamSubscription,
  ProgramAccess,
  getStripe
} from '@/lib/stripe';

interface SubscriptionState {
  // Data
  products: Product[];
  subscriptionPlans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  teamSubscriptions: TeamSubscription[];
  purchasedPrograms: string[];
  programAccess: Record<string, ProgramAccess>;
  
  // Loading states
  isLoading: boolean;
  isCheckingOut: boolean;
  
  // Cache for program access
  programAccessCache: Record<string, ProgramAccess>;

  // Actions
  loadProducts: () => Promise<void>;
  loadSubscriptionPlans: () => Promise<void>;
  loadUserSubscriptions: (userId: string) => Promise<void>;
  loadTeamSubscriptions: (coachId: string) => Promise<void>;
  loadPurchasedPrograms: (userId: string) => Promise<void>;
  loadProgramAccess: (userId: string) => Promise<void>;
  
  checkProgramAccess: (userId: string, programId: string) => Promise<ProgramAccess>;
  hasProgramAccess: (programId: string) => boolean;
  hasAccess: (programId: string) => boolean;
  isTrialing: (programId: string) => boolean;
  getTrialEndDate: (programId: string) => string | null;
  
  // Checkout
  startCheckout: (params: {
    userId: string;
    priceId: string;
    productId?: string;
    planId?: string;
    teamId?: string;
    programId?: string;
    promoCode?: string;
  }) => Promise<void>;
  
  createCheckout: (userId: string, priceId: string, programId: string) => Promise<void>;
  createTeamCheckout: (userId: string, priceId: string, programId: string, teamId: string) => Promise<void>;
  startTrial: (userId: string, programId: string) => Promise<{ success: boolean; error?: string }>;
  
  openCustomerPortal: (userId: string) => Promise<void>;
  
  // Helpers
  getActiveSubscription: () => UserSubscription | null;
  isSubscribed: () => boolean;
  getSubscriptionEndDate: () => Date | null;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  products: [],
  subscriptionPlans: [],
  userSubscriptions: [],
  teamSubscriptions: [],
  purchasedPrograms: [],
  programAccess: {},
  isLoading: false,
  isCheckingOut: false,
  programAccessCache: {},

  loadProducts: async () => {
    set({ isLoading: true });
    const products = await stripeService.getProducts();
    set({ products, isLoading: false });
  },

  loadSubscriptionPlans: async () => {
    set({ isLoading: true });
    const subscriptionPlans = await stripeService.getSubscriptionPlans();
    set({ subscriptionPlans, isLoading: false });
  },

  loadUserSubscriptions: async (userId: string) => {
    const userSubscriptions = await stripeService.getUserSubscriptions(userId);
    set({ userSubscriptions });
  },

  loadTeamSubscriptions: async (coachId: string) => {
    const teamSubscriptions = await stripeService.getTeamSubscriptions(coachId);
    set({ teamSubscriptions });
  },

  loadPurchasedPrograms: async (userId: string) => {
    const purchasedPrograms = await stripeService.getPurchasedPrograms(userId);
    set({ purchasedPrograms });
  },

  loadProgramAccess: async (userId: string) => {
    // Load all user subscriptions and purchased programs
    await Promise.all([
      get().loadUserSubscriptions(userId),
      get().loadTeamSubscriptions(userId),
      get().loadPurchasedPrograms(userId),
    ]);
  },

  checkProgramAccess: async (userId: string, programId: string) => {
    const { programAccessCache } = get();
    
    // Check cache first
    const cacheKey = `${userId}-${programId}`;
    if (programAccessCache[cacheKey]) {
      return programAccessCache[cacheKey];
    }
    
    // Fetch from API
    const access = await stripeService.checkProgramAccess(userId, programId);
    
    // Update cache
    set({
      programAccessCache: {
        ...programAccessCache,
        [cacheKey]: access
      },
      programAccess: {
        ...get().programAccess,
        [programId]: access
      }
    });
    
    return access;
  },

  hasProgramAccess: (programId: string) => {
    const { userSubscriptions, teamSubscriptions, purchasedPrograms, subscriptionPlans, programAccess } = get();
    
    // Check cached access first
    if (programAccess[programId]?.has_access) {
      return true;
    }
    
    // Check if purchased
    if (purchasedPrograms.includes(programId)) {
      return true;
    }
    
    // Check active subscriptions
    const activeUserSub = userSubscriptions.find(
      s => ['active', 'trialing'].includes(s.status) && 
           new Date(s.current_period_end) > new Date()
    );
    
    if (activeUserSub) {
      // Check if subscription includes this program
      if (activeUserSub.subscription_plan_id) {
        const plan = subscriptionPlans.find(p => p.id === activeUserSub.subscription_plan_id);
        if (plan?.includes_all_programs) return true;
        if (plan?.included_programs?.includes(programId)) return true;
      }
    }
    
    // Check team subscriptions
    const activeTeamSub = teamSubscriptions.find(
      s => s.status === 'active' && 
           s.program_id === programId &&
           new Date(s.current_period_end) > new Date()
    );
    
    if (activeTeamSub) {
      return true;
    }
    
    return false;
  },

  hasAccess: (programId: string) => {
    return get().hasProgramAccess(programId);
  },

  isTrialing: (programId: string) => {
    const { userSubscriptions, programAccess } = get();
    
    // Check cached access
    if (programAccess[programId]?.access_type === 'subscription') {
      const activeSub = userSubscriptions.find(
        s => s.status === 'trialing' && new Date(s.current_period_end) > new Date()
      );
      return !!activeSub;
    }
    
    return false;
  },

  getTrialEndDate: (programId: string) => {
    const { userSubscriptions } = get();
    const trialingSub = userSubscriptions.find(
      s => s.status === 'trialing' && new Date(s.current_period_end) > new Date()
    );
    return trialingSub?.trial_end || null;
  },

  startCheckout: async (params) => {
    set({ isCheckingOut: true });
    
    try {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }
      
      const result = await stripeService.createCheckoutSession({
        ...params,
        successUrl: `${window.location.origin}/app/subscription/success`,
        cancelUrl: `${window.location.origin}/app/pricing`,
      });
      
      if (result?.url) {
        window.location.href = result.url;
      } else if (result?.sessionId) {
        await stripe.redirectToCheckout({ sessionId: result.sessionId });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      set({ isCheckingOut: false });
    }
  },

  createCheckout: async (userId: string, priceId: string, programId: string) => {
    await get().startCheckout({
      userId,
      priceId,
      programId,
    });
  },

  createTeamCheckout: async (userId: string, priceId: string, programId: string, teamId: string) => {
    await get().startCheckout({
      userId,
      priceId,
      programId,
      teamId,
    });
  },

  startTrial: async (userId: string, programId: string) => {
    // Check if user can start trial
    const canTrial = await stripeService.canStartTrial(userId, programId);
    
    if (!canTrial) {
      return { success: false, error: 'Trial already used' };
    }
    
    // Get the product for this program with trial
    const { products } = get();
    const product = products.find(p => p.program_id === programId && p.trial_days > 0);
    
    if (!product?.stripe_price_id) {
      return { success: false, error: 'No trial available' };
    }
    
    // Start checkout with trial
    await get().startCheckout({
      userId,
      priceId: product.stripe_price_id,
      productId: product.id,
      programId,
    });
    
    return { success: true };
  },

  openCustomerPortal: async (userId: string) => {
    const result = await stripeService.createPortalSession(
      userId, 
      `${window.location.origin}/app/profile`
    );
    
    if (result?.url) {
      window.location.href = result.url;
    }
  },

  getActiveSubscription: () => {
    const { userSubscriptions } = get();
    return userSubscriptions.find(
      s => ['active', 'trialing'].includes(s.status) && 
           new Date(s.current_period_end) > new Date()
    ) || null;
  },

  isSubscribed: () => {
    const sub = get().getActiveSubscription();
    return sub?.status === 'active';
  },

  getSubscriptionEndDate: () => {
    const sub = get().getActiveSubscription();
    return sub ? new Date(sub.current_period_end) : null;
  },
}));
