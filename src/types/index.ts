export interface Barber {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentClient?: string;
  breakUntil?: number;
  breakMinutes?: number;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
}

export interface Dependent {
  id: string;
  name: string;
  services: Service[];
}

export interface QueueEntry {
  id: string;
  clientName: string;
  whatsapp: string;
  services: Service[];
  barberId?: string;
  barberName?: string;
  dependents?: Dependent[];
  status: 'waiting' | 'being-served' | 'completed' | 'cancelled';
  position: number;
  joinedAt: number;
  estimatedWait: number; // in minutes
  completedAt?: number;
  mode: 'queue' | 'scheduled';
  scheduledTime?: string; // HH:mm format
  scheduledDate?: string; // YYYY-MM-DD format
}

export interface HistoryEntry {
  id: string;
  clientName: string;
  whatsapp: string;
  services: Service[];
  barberId: string;
  barberName: string;
  dependents?: Dependent[];
  joinedAt: number;
  completedAt: number;
  totalPrice: number;
}

export interface ShopConfig {
  name: string;
  description: string;
  instagram: string;
  address: string;
  phone: string;
  logo: string;
  queueOpenTime: string;
  shopOpenTime: string;
  workingDays: string;
  isOpen: boolean;
  isQueueOpen: boolean;
}
