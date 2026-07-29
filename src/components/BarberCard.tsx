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

  const servingEntry = queueEntries.find(
    e => e.barberId === barber.id && e.status === 'being-served'
  );

  const barberQueue = queueEntries.filter(
    e => e.status === 'waiting' && (e.barberId === barber.id || (!e.barberId && e.position === 1))
  );

  const totalWait = getBarberWaitTime(barber.id);

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
      case 'available': return '🟢 Livre';
      case 'busy': return '🔴 Atendendo';
      case 'break': return '🟡 Em pausa';
      case 'offline': return '⚪ Indisponível';
    }
  };

  return (
    <div
      className={`barber-card ${getStatusClass()} ${isFilterActive ? 'barber-card--filter-active' : ''}`}
      onClick={() => onToggleFilter?.(barber.id)}
      style={{ cursor: onToggleFilter ? 'pointer' : 'default' }}
    >
      {/* Filter indicator */}
      {isFilterActive && (
        <div className="barber-card__filter-badge">
          🔍 Filtrando fila
        </div>
      )}

      {/* Header */}
      <div className="barber-card__header">
        <div style={{ position: 'relative' }}>
          <Image
            src={barber.avatar}
            alt={barber.name}
            width={52}
            height={52}
            className="barber-card__avatar"
          />
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: barber.status === 'available' ? '#22c55e' : barber.status === 'busy' ? '#ef4444' : '#6b7280',
              border: '2px solid #18181b',
            }}
          />
        </div>
        <div>
          <h4 className="barber-card__name">{barber.name}</h4>
          <span className="barber-card__badge">{getStatusText()}</span>
        </div>
      </div>

      {/* Serving Client Info */}
      <div className="barber-card__serving-box">
        <span className="barber-card__serving-label">Atendendo no momento:</span>
        {servingEntry ? (
          <div className="barber-card__serving-client">
            <span className="barber-card__client-name">{servingEntry.clientName}</span>
            <span className="barber-card__service-name">
              ({(servingEntry.services || []).map(s => s?.name).filter(Boolean).join(', ')})
            </span>
          </div>
        ) : (
          <div className="barber-card__empty-serving">
            {barber.status === 'available' ? 'Atendimento Imediato!' : 'Ninguém na cadeira'}
          </div>
        )}
      </div>

      {/* Sub Queue for this barber */}
      {barberQueue.length > 0 && (
        <div className="barber-card__subqueue">
          <span className="barber-card__subqueue-title">
            Fila de espera ({barberQueue.length}):
          </span>
          <div className="barber-card__subqueue-list">
            {barberQueue.map((entry, idx) => (
              <div key={entry.id} className="barber-card__subqueue-item">
                <span className="barber-card__subqueue-pos">#{idx + 1}</span>
                <span className="barber-card__subqueue-name">
                  {entry.clientName}
                  {entry.dependents && entry.dependents.length > 0 ? ` (+${entry.dependents.length})` : ''}
                </span>
                <span className="barber-card__subqueue-wait">~{entry.estimatedWait}m</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total wait footer */}
      <div className="barber-card__footer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
        <span>
          Tempo de espera: {totalWait === 0 ? 'Sem espera (Livre)' : `~${totalWait} min de espera`}
        </span>
      </div>
    </div>
  );
}
