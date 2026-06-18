import { SUBSCRIPTION_PLANS, UserProfile, USER_VIEW_OPTIONS, UserView } from './types';

const ACCOUNT_STORAGE_KEY = 'vistor_account';
const ACCOUNT_UPDATED_EVENT = 'vistor-account-updated';
const VIEW_PROFILES: Record<UserView, Pick<UserProfile, 'name' | 'email' | 'role'>> = {
  corretor: {
    name: 'João da Silva',
    email: 'joao.dasilva@vistor.ia',
    role: 'Corretor / Vistoriador',
  },
  imobiliaria: {
    name: 'Maria Oliveira',
    email: 'maria.oliveira@vistor.ia',
    role: 'Gestor da imobiliária',
  },
};

const DEFAULT_ACCOUNT: UserProfile = {
  name: VIEW_PROFILES.corretor.name,
  email: VIEW_PROFILES.corretor.email,
  company: 'Vistor.ia Operações',
  role: VIEW_PROFILES.corretor.role,
  userView: 'corretor',
  selectedPlanId: 'basic',
};

function applyViewProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    ...VIEW_PROFILES[profile.userView],
  };
}

export const AccountStorage = {
  get: (): UserProfile => {
    const data = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!data) return DEFAULT_ACCOUNT;

    const parsed = JSON.parse(data);
    return applyViewProfile({
      ...DEFAULT_ACCOUNT,
      ...parsed,
    });
  },

  save: (profile: UserProfile): void => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(applyViewProfile(profile)));
    window.dispatchEvent(new CustomEvent(ACCOUNT_UPDATED_EVENT));
  },

  update: (partial: Partial<UserProfile>): UserProfile => {
    const updated = {
      ...AccountStorage.get(),
      ...partial,
    };

    AccountStorage.save(updated);
    return updated;
  },

  getSelectedPlan: () => {
    const account = AccountStorage.get();
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === account.selectedPlanId) || SUBSCRIPTION_PLANS[0];
  },

  getSelectedView: (): UserView => {
    return AccountStorage.get().userView;
  },

  getViewLabel: (view?: UserView) => {
    const currentView = view || AccountStorage.getSelectedView();
    return USER_VIEW_OPTIONS.find((option) => option.id === currentView)?.label || 'Corretor';
  },

  subscribe: (listener: () => void) => {
    window.addEventListener(ACCOUNT_UPDATED_EVENT, listener);
    return () => window.removeEventListener(ACCOUNT_UPDATED_EVENT, listener);
  },
};
