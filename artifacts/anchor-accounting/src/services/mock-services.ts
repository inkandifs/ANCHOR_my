export const mockCreate = <T,>(record: T) => Promise.resolve(record);
export const mockUpdate = <T,>(record: T) => Promise.resolve(record);
export const mockDelete = (id: string) => Promise.resolve({ id, deleted: true });
export const mockStage = <T,>(record: T, status: string) => Promise.resolve({ ...record as object, status } as T);
export const mockPay = (id: string) => Promise.resolve({ id, status: 'Paid' });
export const mockRevise = <T,>(record: T) => Promise.resolve(record);