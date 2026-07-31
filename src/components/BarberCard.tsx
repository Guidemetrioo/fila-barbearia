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
  const isBreak = barber.status === 'break';
  
  const remainingBreak = isBreak && barber.breakUntil
    ? Math.max(0, Math.ceil((barber.breakUntil - Date.now()) / 60000))
    : 0;

  const estimatedWait = isBreak
    ? (remainingBreak > 0 ? `${remainingBreak} min (Pausa)` : 'Pausa')
    : (totalWait === 0 ? 'Livre' : `${totalWait} minutos`);
  const hasTimedWait = isBreak ? remainingBreak > 0 : totalWait > 0;

  const statusBg = isAvailable
    ? 'rgba(16, 185, 129, 0.14)'
    : isBreak
    ? 'rgba(245, 158, 11, 0.14)'
    : 'rgba(239, 68, 68, 0.14)';

  const statusColor = isAvailable
    ? '#34D399'
    : isBreak
    ? '#FBBF24'
    : '#F87171';

  const statusBorder = isAvailable
    ? 'rgba(16, 185, 129, 0.3)'
    : isBreak
    ? 'rgba(245, 158, 11, 0.3)'
    : 'rgba(239, 68, 68, 0.3)';

  const statusDotColor = isAvailable
    ? '#10B981'
    : isBreak
    ? '#F59E0B'
    : '#EF4444';

  const statusLabel = isAvailable
    ? 'Disponível'
    : isBreak
    ? `Em pausa ${remainingBreak > 0 ? `(${remainingBreak} min)` : ''}`
    : 'Indisponível';

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
            backgroundColor: statusDotColor,
            border: '2px solid #071710',
          }}
        />
      </div>

      {/* Barber Name */}
      <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
        {barber.name}
      </h4>

      {/* Status Badge */}
      <div style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        padding: '0.15rem 0.6rem',
        borderRadius: '10px',
        background: statusBg,
        color: statusColor,
        border: `1px solid ${statusBorder}`,
        marginBottom: '0.45rem',
      }}>
        {statusLabel}
      </div>

      {/* Wait Time */}
      <div className={`barber-card__wait ${hasTimedWait ? 'barber-card__wait--stacked' : ''}`}>
        <svg className="barber-card__wait-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="barber-card__wait-copy">
          <span className="barber-card__wait-label">Tempo estimado:</span>
          <span className="barber-card__wait-value">{estimatedWait}</span>
        </span>
      </div>
    </div>
  );
}
