import { Inspection, DEFAULT_ROOMS } from './types';
import { InspectionStorage } from './storage';

export function seedMockData() {
  // Check if data already exists
  const existing = InspectionStorage.getAll();
  if (existing.length > 0) {
    return;
  }

  // Create mock inspections with realistic dates (April 2026)
  const mockInspections: Inspection[] = [
    {
      id: '1',
      propertyAddress: 'Rua das Flores, 123 - Apto 45',
      type: 'entrada',
      status: 'concluida',
      notes: 'Vistoria realizada com o proprietário presente.',
      createdAt: new Date('2026-03-28T10:30:00'),
      completedAt: new Date('2026-03-28T11:45:00'),
      currentRoomIndex: 7,
      rooms: DEFAULT_ROOMS.map(room => ({
        ...room,
        items: room.id === 'cozinha' ? [
          {
            id: '1',
            description: 'Arranhão na bancada de mármore próximo à pia',
            createdAt: new Date('2026-03-28T10:35:00'),
          },
          {
            id: '2',
            description: 'Porta do armário solto, precisa apertar dobradiças',
            createdAt: new Date('2026-03-28T10:38:00'),
          },
        ] : room.id === 'banheiro' ? [
          {
            id: '3',
            description: 'Azulejo trincado atrás do vaso sanitário',
            createdAt: new Date('2026-03-28T11:05:00'),
          },
        ] : [],
        photos: [],
      })),
    },
    {
      id: '2',
      propertyAddress: 'Av. Paulista, 1000 - Sala 301',
      type: 'saida',
      status: 'em_andamento',
      createdAt: new Date('2026-04-01T14:30:00'),
      currentRoomIndex: 2,
      rooms: DEFAULT_ROOMS.slice(0, 5).map(room => ({
        ...room,
        items: room.id === 'sala' ? [
          {
            id: '4',
            description: 'Mancha no piso laminado próximo à janela',
            createdAt: new Date('2026-04-01T14:40:00'),
          },
        ] : [],
        photos: [],
      })),
    },
  ];

  mockInspections.forEach(inspection => {
    InspectionStorage.save(inspection);
  });
}