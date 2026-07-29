'use client';

import { useQueue } from '@/context/QueueContext';

interface QueueListProps {
  filterBarberId?: string | null;
}

export default function QueueList({ filterBarberId }: QueueListProps) {
  const { queue } = useQueue();

  let waitingEntries = queue
    .filter(e => e.status === 'waiting')
    .sort((a, b) => a.position - b.position);
  let servingEntries = queue.filter(e => e.status === 'being-served');

  // Apply barber filter if active
  if (filterBarberId) {
    waitingEntries = waitingEntries.filter(e => e.barberId === filterBarberId || !e.barberId);
    servingEntries = servingEntries.filter(e => e.barberId === filterBarberId);
  }

  return (
    <div className="section-card">
      <h3 className="queue-list__title">
        Fila de espera
      </h3>

      {waitingEntries.length === 0 && servingEntries.length === 0 ? (
        <div className="queue-list__empty">
          <div className="queue-list__empty-icon">🕐</div>
          <p className="queue-list__empty-text">Ninguém na fila</p>
        </div>
      ) : (
        <div className="queue-list__items">
          {servingEntries.map(entry => (
            <div key={entry.id} className="queue-list__item queue-list__item--serving">
              <div className="queue-list__item-left">
                <div className="queue-list__item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="queue-list__item-name">{entry.clientName}</div>
                  <div className="queue-list__item-service">
                    {(entry.services || []).map(s => s?.name).filter(Boolean).join(' + ')}
                  </div>
                  {entry.barberName && (
                    <div className="queue-list__item-barber">
                      Profissional: {entry.barberName}
                    </div>
                  )}
                </div>
              </div>
              <div className="queue-list__item-badge queue-list__item-badge--serving">
                Em atendimento
              </div>
            </div>
          ))}

          {waitingEntries.map(entry => (
            <div key={entry.id} className={`queue-list__item ${entry.mode === 'scheduled' ? 'queue-list__item--scheduled' : ''}`}>
              <div className="queue-list__item-left">
                <div className="queue-list__item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div className="queue-list__item-name">{entry.clientName}</div>
                  <div className="queue-list__item-service">
                    {(entry.services || []).map(s => s?.name).filter(Boolean).join(' + ')}
                  </div>
                  {entry.barberName && (
                    <div className="queue-list__item-barber">
                      Profissional: {entry.barberName}
                    </div>
                  )}
                  {!entry.barberName && (
                    <div className="queue-list__item-barber" style={{ opacity: 0.5 }}>
                      Sem preferência de profissional
                    </div>
                  )}
                </div>
              </div>
              <div className="queue-list__item-wait">
                {entry.mode === 'scheduled' && entry.scheduledTime ? (
                  <div className="queue-list__item-badge queue-list__item-badge--scheduled">
                    📅 {entry.scheduledDate ? entry.scheduledDate.split('-').reverse().join('/') : ''} às {entry.scheduledTime}
                  </div>
                ) : (
                  <div>~{entry.estimatedWait} min</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
