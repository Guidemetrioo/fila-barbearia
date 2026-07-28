import { Barber, Service, ShopConfig } from '@/types';

export const shopConfig: ShopConfig = {
  name: 'BARBEARIA DEL REY',
  description:
    '"NA CENA" Toda honra e toda glória a Deus! Since 2011. Barbearia Del Rey oferece uma experiência premium com serviços de alta qualidade em um ambiente moderno. Conforto, confiança e excelente atendimento — o melhor do Belenzinho.',
  instagram: 'https://www.instagram.com/delrey_barbearia/',
  address: 'R. Sapucaia, 359 - Belenzinho, São Paulo - SP, 03170-050',
  phone: '(11) 97236-2628',
  logo: '/images/logo.png',
  queueOpenTime: '08:30',
  shopOpenTime: '09:00',
  workingDays: 'Segunda a Sexta: 09:00–20:00 | Sábado: 09:00–19:00 | Domingo: Fechado',
  isOpen: true,
  isQueueOpen: true,
};

export const initialBarbers: Barber[] = [
  {
    id: 'barber-1',
    name: 'LUCAS',
    avatar: '/images/barber1.png',
    status: 'available',
  },
  {
    id: 'barber-2',
    name: 'RAFAEL',
    avatar: '/images/barber2.png',
    status: 'available',
  },
  {
    id: 'barber-3',
    name: 'MATHEUS',
    avatar: '/images/barber3.png',
    status: 'available',
  },
];

export const services: Service[] = [
  { id: 'svc-1', name: 'Corte Máquina', price: 35, duration: 30 },
  { id: 'svc-2', name: 'Corte Tesoura', price: 45, duration: 40 },
  { id: 'svc-3', name: 'Barba', price: 30, duration: 25 },
  { id: 'svc-4', name: 'Corte + Barba', price: 65, duration: 55 },
  { id: 'svc-5', name: 'Navalhado', price: 50, duration: 40 },
  { id: 'svc-6', name: 'Sobrancelha', price: 15, duration: 10 },
];
