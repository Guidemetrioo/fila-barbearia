import { Barber, Service, ShopConfig } from '@/types';

export const shopConfig: ShopConfig = {
  name: 'BARBEARIA DEL REY',
  description:
    '"NA CENA" Toda honra e toda glória a Deus! Since 2011. Barbearia Del Rey oferece uma experiência premium com serviços de alta qualidade em um ambiente moderno. Conforto, confiança e excelente atendimento — o melhor do Belenzinho. ⭐ 4,8 estrelas no Google (33 avaliações)',
  instagram: 'https://www.instagram.com/delrey_barbearia/',
  address: 'R. Sapucaia, 359 - Belenzinho, São Paulo - SP, 03170-050',
  phone: '(11) 97236-2628',
  logo: '/images/logo.png',
  queueOpenTime: '08:30',
  shopOpenTime: '09:00',
  workingDays: 'Terça a Domingo: 09:00–20:00 | Segunda: Fechado',
  isOpen: true,
  isQueueOpen: true,
};

export const initialBarbers: Barber[] = [
  {
    id: 'barber-1',
    name: 'JUCA',
    avatar: '/images/barber1.png',
    status: 'available',
  },
  {
    id: 'barber-2',
    name: 'VITORIA',
    avatar: '/images/barber2.png',
    status: 'available',
  },
  {
    id: 'barber-3',
    name: 'ANDERSON',
    avatar: '/images/barber3.png',
    status: 'available',
  },
];

export const services: Service[] = [
  {
    id: 'svc-1',
    name: 'CORTE',
    price: 50,
    duration: 40,
    description: 'Corte tradicional ou moderno com tesoura e máquina.',
  },
  {
    id: 'svc-2',
    name: 'BARBA',
    price: 40,
    duration: 30,
    description: 'Modelagem de barba com toalha quente e finalização.',
  },
  {
    id: 'svc-3',
    name: 'CORTE + BARBA',
    price: 90,
    duration: 70,
    description: 'Combo completo de corte e barba.',
  },
  {
    id: 'svc-4',
    name: 'CORTE + SOBRANCELHA',
    price: 70,
    duration: 50,
    description: 'Corte masculino + alinhamento de sobrancelha.',
  },
  {
    id: 'svc-5',
    name: 'SOBRANCELHA',
    price: 20,
    duration: 10,
    description: 'Design e alinhamento de sobrancelha na navalha.',
  },
  {
    id: 'svc-6',
    name: 'BARBOTERAPIA',
    price: 60,
    duration: 45,
    description: 'Tratamento completo para a pele do rosto e barba com vapor e óleos.',
  },
  {
    id: 'svc-7',
    name: 'ACABAMENTO / PEZINHO',
    price: 25,
    duration: 15,
    description: 'Manutenção do contorno do cabelo e nuca.',
  },
  {
    id: 'svc-8',
    name: 'PROGRESSIVA',
    price: 100,
    duration: 60,
    description: 'Alisamento e redução de volume dos fios.',
  },
];
