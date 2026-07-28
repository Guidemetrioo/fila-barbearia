import { Barber, Service, ShopConfig } from '@/types';

export const shopConfig: ShopConfig = {
  name: 'JG BARBEARIA',
  description:
    'JG BARBEARIA oferece uma experiência completa, unindo serviços de alta qualidade com um ambiente moderno. Focada na satisfação, busca proporcionar conforto e confiança com excelente atendimento e um "tapa no visual" de respeito. "Mais que um corte, uma revolução no seu estilo"',
  instagram: 'https://www.instagram.com/',
  address: 'Rua Principal, 100 - São Paulo - SP',
  phone: '(11) 99999-9999',
  logo: '/images/logo.png',
  queueOpenTime: '09:00',
  shopOpenTime: '10:00',
  workingDays: 'Segunda a Sábado: 09:00–20:00 | Domingo: Fechado',
  isOpen: true,
  isQueueOpen: true,
};

export const initialBarbers: Barber[] = [
  {
    id: 'barber-1',
    name: 'GABRIEL',
    avatar: '/images/barber1.png',
    status: 'available',
  },
  {
    id: 'barber-2',
    name: 'CLAUDIO',
    avatar: '/images/barber2.png',
    status: 'busy',
  },
  {
    id: 'barber-3',
    name: 'LUCAS',
    avatar: '/images/barber3.png',
    status: 'busy',
  },
  {
    id: 'barber-4',
    name: 'RAPHAEL',
    avatar: '/images/barber1.png',
    status: 'busy',
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
