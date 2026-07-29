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
        padding: '0.75rem 0.5rem',
      }}
    >
      {/* Filter indicator badge if filter is active */}
      {isFilterActive && (
        <div className="barber-card__filter-badge" style={{ marginBottom: '0.4rem', fontSize: '0.7rem' }}>
          Filtrando fila
        </div>
      )}

      {/* Compact Avatar with status dot */}
      <div style={{ position: 'relative', marginBottom: '0.4rem' }}>
        <Image
          src={barber.avatar}
          alt={barber.name}
          width={52}
          height={52}
          className="barber-card__avatar"
          style={{ borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: isAvailable ? '#10B981' : '#EF4444',
            border: '2px solid #071710',
          }}
        />
      </div>

      {/* Barber Name */}
      <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
        {barber.name}
      </h4>

      {/* Status Badge: Disponível / Indisponível */}
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '0.15rem 0.6rem',
        borderRadius: '10px',
        background: isAvailable ? 'rgba(16, 185, 129, 0.14)' : 'rgba(239, 68, 68, 0.14)',
        color: isAvailable ? '#34D399' : '#F87171',
        border: `1px solid ${isAvailable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        marginBottom: '0.45rem',
      }}>
        {isAvailable ? 'Disponível' : 'Indisponível'}
      </div>

      {/* Wait Time: Tempo estimado: Livre / Tempo estimado: X minutos */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>
          Tempo estimado: {totalWait === 0 ? 'Livre' : `${totalWait} minutos`}
        </span>
      </div>
    </div>
  );
}
