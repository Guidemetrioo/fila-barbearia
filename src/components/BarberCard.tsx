'use client';

import Image from 'next/image';
import { Barber, QueueEntry } from '@/types';

interface BarberCardProps {
  barber: Barber;
  queueEntries: QueueEntry[];
}

export default function BarberCard({ barber, queueEntries }: BarberCardProps) {
  const servingEntry = queueEntries.find(
    e => e.barberId === barber.id && e.status === 'being-served'
  );
  const barberQueueCount = queueEntries.filter(
    e => e.status === 'waiting'
  ).length;

  const getStatusClass = () => {
    switch (barber.status) {
      case 'available': return 'barber-card--available';
      case 'busy': return 'barber-card--busy';
      case 'break':
      case 'offline': return 'barber-card--offline';
    }
  };

  const getStatusText = () => {
    switch (barber.status) {
      case 'available': return 'Livre - Sem fila!';
      case 'busy': return servingEntry ? `Atendendo: ${servingEntry.clientName}` : 'Ocupado';
      case 'break': return 'Em pausa';
      case 'offline': return 'Indisponível';
    }
  };

  const getStatusDotClass = () => {
    switch (barber.status) {
      case 'available': return 'barber-card__status-dot--available';
      case 'busy': return 'barber-card__status-dot--busy';
      default: return 'barber-card__status-dot--offline';
    }
  };

  const getStatusTextClass = () => {
    switch (barber.status) {
      case 'available': return 'barber-card__status--available';
      case 'busy': return 'barber-card__status--busy';
      default: return 'barber-card__status--offline';
    }
  };

  const getWaitText = () => {
    if (barber.status === 'available') return 'Atendimento imediato';
    if (barber.status === 'busy') {
      if (barberQueueCount === 0) return 'Próximo disponível';
      return `${barberQueueCount} na espera`;
    }
    return 'Sem previsão';
  };

  return (
    <div className={`barber-card ${getStatusClass()}`}>
      <div className="barber-card__header">
        <Image
          src={barber.avatar}
          alt={barber.name}
          width={48}
          height={48}
          className="barber-card__avatar"
        />
        <span className="barber-card__name">{barber.name}</span>
      </div>
      <div className={`barber-card__status ${getStatusTextClass()}`}>
        <span className={`barber-card__status-dot ${getStatusDotClass()}`} />
        {getStatusText()}
      </div>
      <div className="barber-card__wait">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
        {getWaitText()}
      </div>
    </div>
  );
}
