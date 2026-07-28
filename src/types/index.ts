export interface Barber {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentClient?: string;
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
  barberId?: string; // specific barber ID or undefined for "sem preferência"
  barberName?: string;
  dependents?: Dependent[];
  status: 'waiting' | 'being-served' | 'completed' | 'cancelled';
  position: number;
  joinedAt: number;
  estimatedWait: number; // in minutes
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
