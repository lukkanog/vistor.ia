import { Inspection } from './types';

const STORAGE_KEY = 'vistor_inspections';

export const InspectionStorage = {
  getAll: (): Inspection[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const inspections = JSON.parse(data);
    // Convert date strings back to Date objects
    return inspections.map((i: any) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      completedAt: i.completedAt ? new Date(i.completedAt) : undefined,
      rooms: i.rooms.map((r: any) => ({
        ...r,
        items: r.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })),
      })),
    }));
  },

  getById: (id: string): Inspection | undefined => {
    const inspections = InspectionStorage.getAll();
    return inspections.find(i => i.id === id);
  },

  save: (inspection: Inspection): void => {
    const inspections = InspectionStorage.getAll();
    const index = inspections.findIndex(i => i.id === inspection.id);
    
    if (index >= 0) {
      inspections[index] = inspection;
    } else {
      inspections.push(inspection);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inspections));
  },

  delete: (id: string): void => {
    const inspections = InspectionStorage.getAll();
    const filtered = inspections.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
};
