import { SUBSCRIPTION_PLANS, UserProfile } from './types';

const ACCOUNT_STORAGE_KEY = 'vistor_account';
const ACCOUNT_UPDATED_EVENT = 'vistor-account-updated';

const DEFAULT_ACCOUNT: UserProfile = {
  name: 'Gustavo Almeida',
  email: 'gustavo@vistor.ia',
  company: 'Vistor.ia Operações',
  role: 'Corretor / Vistoriador',
  selectedPlanId: 'basic',
};

export const AccountStorage = {
  get: (): UserProfile => {
    const data = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!data) return DEFAULT_ACCOUNT;

    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_ACCOUNT,
      ...parsed,
    };
  },

  save: (profile: UserProfile): void => {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(profile));
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

  subscribe: (listener: () => void) => {
    window.addEventListener(ACCOUNT_UPDATED_EVENT, listener);
    return () => window.removeEventListener(ACCOUNT_UPDATED_EVENT, listener);
  },
};
