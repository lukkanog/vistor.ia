export type InspectionType = 'entrada' | 'saida';
export type InspectionStatus = 'em_andamento' | 'concluida';
export type ComparisonStatus = 'novo_dano' | 'sem_alteracao' | 'resolvido' | 'modificado';
export type SignatureStatus = 'pendente' | 'assinado' | 'recusado';

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
