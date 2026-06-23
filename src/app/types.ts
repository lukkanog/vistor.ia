export type InspectionType = 'entrada' | 'saida';
export type InspectionStatus = 'em_andamento' | 'concluida';
export type ComparisonStatus = 'novo_dano' | 'sem_alteracao' | 'resolvido' | 'modificado';
export type SignatureStatus = 'pendente' | 'assinado' | 'recusado';
export type SubscriptionPlanId = 'basic' | 'pro' | 'premium';
export type UserView = 'corretor' | 'imobiliaria';
export type SubscriptionChangeRequestStatus = 'pendente' | 'aprovado' | 'recusado';
export type BrokerInviteStatus = 'pendente';

export interface Signature {
  id: string;
  role: string;
  name: string;
  email: string;
  status: SignatureStatus;
  signatureDataUrl?: string;
  signedAt?: Date;
}

export interface InspectionItem {
  id: string;
  description: string;
  createdAt: Date;
  comparisonStatus?: ComparisonStatus;
  originalDescription?: string;
}

export interface InspectionRoom {
  id: string;
  name: string;
  icon: string;
  items: InspectionItem[];
  photos: string[];
}

export interface Inspection {
  id: string;
  propertyAddress: string;
  type: InspectionType;
  status: InspectionStatus;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
  rooms: InspectionRoom[];
  currentRoomIndex: number;
  linkedEntryId?: string;
  signatures?: Signature[];
}

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  monthlyPrice: number;
  description: string;
  features: string[];
}

export interface AgencyMembership {
  id: string;
  name: string;
  selectedPlanId: SubscriptionPlanId;
  pendingPlanChangeRequest?: {
    requestedPlanId: SubscriptionPlanId;
    status: SubscriptionChangeRequestStatus;
    requestedAt?: string;
    reviewedAt?: string;
  };
}

export interface BrokerInvite {
  id: string;
  email: string;
  name: string;
  region: string;
  status: BrokerInviteStatus;
  invitedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  company: string;
  role: string;
  userView: UserView;
  photoDataUrl?: string;
  agencies: AgencyMembership[];
  invitedBrokers?: BrokerInvite[];
}

export const USER_VIEW_OPTIONS: { id: UserView; label: string; description: string }[] = [
  {
    id: 'corretor',
    label: 'Corretor',
    description: 'Executa vistorias, registra evidências e acompanha laudos.',
  },
  {
    id: 'imobiliaria',
    label: 'Imobiliária',
    description: 'Gerencia corretores, operação, agenda e assinaturas.',
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 299.9,
    description: 'Vistoria + docs + laudo + armazenamento padrão',
    features: [
      'Vistoria digital completa',
      'Documentos e laudo',
      'Armazenamento padrão',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 499.9,
    description: 'Basic + agenda/roteiro + IA Fotos',
    features: [
      'Tudo do Basic',
      'Agenda e roteiro operacional',
      'IA para análise de fotos',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 799.9,
    description: 'Pro + SLA + IA Fotos + vídeos',
    features: [
      'Tudo do Pro',
      'SLA prioritário',
      'IA para fotos e vídeos',
    ],
  },
];

export const DEFAULT_ROOMS: Omit<InspectionRoom, 'items' | 'photos'>[] = [
  { id: 'sala', name: 'Sala', icon: 'sofa' },
  { id: 'cozinha', name: 'Cozinha', icon: 'chef-hat' },
  { id: 'quarto1', name: 'Quarto 1', icon: 'bed' },
  { id: 'quarto2', name: 'Quarto 2', icon: 'bed' },
  { id: 'banheiro', name: 'Banheiro', icon: 'bath' },
  { id: 'area_servico', name: 'Área de Serviço', icon: 'washing-machine' },
  { id: 'varanda', name: 'Varanda', icon: 'wind' },
  { id: 'garagem', name: 'Garagem', icon: 'car' },
];
