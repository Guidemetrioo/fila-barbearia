'use client';

import Image from 'next/image';
import { Barber, QueueEntry } from '@/types';
import { useQueue } from '@/context/QueueContext';

interface BarberCardProps {
  barber: Barber;
  queueEntries: QueueEntry[];
  isFilterActive?: boolean;
  onToggleFilter?: (barberId: string) => void;
}

export default function BarberCard({ barber, queueEntries, isFilterActive, onToggleFilter }: BarberCardProps) {
  const { getBarberWaitTime } = useQueue();

  const totalWait = getBarberWaitTime(barber.id);
  const isAvailable = barber.status === 'available';

  return (
    <div
      className={`barber-card ${isAvailable ? 'barber-card--available' : 'barber-card--offline'} ${isFilterActive ? 'barber-card--filter-active' : ''}`}
      onClick={() => onToggleFilter?.(barber.id)}
      style={{
        cursor: onToggleFilter ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1rem 0.85rem',
      }}
    >
      {/* Filter indicator badge if filter is active */}
      {isFilterActive && (
        <div className="barber-card__filter-badge" style={{ marginBottom: '0.5rem' }}>
          Filtrando fila
        </div>
      )}

      {/* Avatar with status dot */}
      <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
        <Image
          src={barber.avatar}
          alt={barber.name}
          width={64}
          height={64}
          className="barber-card__avatar"
          style={{ borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: isAvailable ? '#10B981' : '#EF4444',
            border: '2px solid #071710',
          }}
        />
      </div>

      {/* Barber Name */}
      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        {barber.name}
      </h4>

      {/* Status Badge: Disponível / Indisponível */}
      <div style={{
        fontSize: '0.775rem',
        fontWeight: 700,
        padding: '0.2rem 0.75rem',
        borderRadius: '12px',
        background: isAvailable ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
        color: isAvailable ? '#34D399' : '#F87171',
        border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        marginBottom: '0.65rem',
      }}>
        {isAvailable ? 'Disponível' : 'Indisponível'}
      </div>

      {/* Wait Time Footer: Livre / Tempo de espera estimado */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          {totalWait === 0 ? 'Livre' : `Tempo de espera estimado: ~${totalWait} min`}
        </span>
      </div>
    </div>
  );
}
