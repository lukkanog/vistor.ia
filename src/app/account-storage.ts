import { AgencyMembership, BrokerInvite, SUBSCRIPTION_PLANS, UserProfile, USER_VIEW_OPTIONS, UserView } from './types';

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
    role: 'Gestora da imobiliária',
  },
};

const DEFAULT_CORRETOR_AGENCIES: AgencyMembership[] = [
  { id: 'agency-vistoria', name: 'Vistor.ia Operações', selectedPlanId: 'basic' },
  { id: 'agency-jardins', name: 'Jardins Imobiliária', selectedPlanId: 'premium' },
];

const DEFAULT_ACCOUNT: UserProfile = {
  name: VIEW_PROFILES.corretor.name,
  email: VIEW_PROFILES.corretor.email,
  company: 'Vistor.ia Operações',
  role: VIEW_PROFILES.corretor.role,
  userView: 'corretor',
  agencies: DEFAULT_CORRETOR_AGENCIES,
  invitedBrokers: [],
};

function normalizeInvitedBrokers(profile: Partial<UserProfile>): BrokerInvite[] {
  if (!Array.isArray(profile.invitedBrokers)) return [];

  return profile.invitedBrokers.map((broker, index) => ({
    id: broker.id || `invited-broker-${index + 1}`,
    email: broker.email || '',
    name: broker.name || 'Corretor convidado',
    region: broker.region || 'A definir',
    status: 'pendente',
    invitedAt: broker.invitedAt || new Date().toISOString(),
  }));
}

function normalizeAgencies(profile: Partial<UserProfile> & { selectedPlanId?: string }): AgencyMembership[] {
  if (Array.isArray(profile.agencies) && profile.agencies.length > 0) {
    return profile.agencies.map((agency, index) => ({
      id: agency.id || `agency-${index + 1}`,
      name: agency.name || `Imobiliária ${index + 1}`,
      selectedPlanId: agency.selectedPlanId || 'basic',
      pendingPlanChangeRequest: agency.pendingPlanChangeRequest
        ? {
            requestedPlanId: agency.pendingPlanChangeRequest.requestedPlanId || agency.selectedPlanId || 'basic',
            status: agency.pendingPlanChangeRequest.status || 'pendente',
            requestedAt: agency.pendingPlanChangeRequest.requestedAt,
            reviewedAt: agency.pendingPlanChangeRequest.reviewedAt,
          }
        : undefined,
    }));
  }

  if (profile.userView === 'corretor') {
    const legacyAgencyName = profile.company || DEFAULT_CORRETOR_AGENCIES[0].name;
    const legacyPlanId = (profile.selectedPlanId as AgencyMembership['selectedPlanId']) || DEFAULT_CORRETOR_AGENCIES[0].selectedPlanId;

    return [
      {
        id: 'agency-legacy',
        name: legacyAgencyName,
        selectedPlanId: legacyPlanId,
      },
    ];
  }

  return [];
}

function applyViewProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    ...VIEW_PROFILES[profile.userView],
    agencies: normalizeAgencies(profile),
    invitedBrokers: normalizeInvitedBrokers(profile),
  };
}

export const AccountStorage = {
  get: (): UserProfile => {
    const data = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!data) {
      return applyViewProfile({
        ...DEFAULT_ACCOUNT,
        agencies: [...DEFAULT_ACCOUNT.agencies],
        invitedBrokers: [],
      });
    }

    const parsed = JSON.parse(data);
    return applyViewProfile({
      ...DEFAULT_ACCOUNT,
      ...parsed,
      agencies: normalizeAgencies(parsed),
      invitedBrokers: normalizeInvitedBrokers(parsed),
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
    const primaryAgency = account.agencies[0];
    return SUBSCRIPTION_PLANS.find((plan) => plan.id === primaryAgency?.selectedPlanId) || SUBSCRIPTION_PLANS[0];
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
