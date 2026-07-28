'use client';

import { useQueue } from '@/context/QueueContext';

export default function QueueList() {
  const { queue } = useQueue();
  const waitingEntries = queue
    .filter(e => e.status === 'waiting')
    .sort((a, b) => a.position - b.position);
  const servingEntries = queue.filter(e => e.status === 'being-served');

  return (
    <div className="section-card">
      <h3 className="queue-list__title">Fila de espera</h3>

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
                <div className="queue-list__item-position" style={{
                  background: 'var(--gold-glow-strong)',
                  borderColor: 'var(--gold)',
                }}>
                  ✂️
                </div>
                <div>
                  <div className="queue-list__item-name">{entry.clientName}</div>
                  <div className="queue-list__item-service">
                    {entry.services.map(s => s.name).join(', ')}
                  </div>
                </div>
              </div>
              <div className="queue-list__item-wait">
                <div style={{ color: 'var(--gold)', fontWeight: 600 }}>Sendo atendido</div>
              </div>
            </div>
          ))}

          {waitingEntries.map(entry => (
            <div key={entry.id} className="queue-list__item">
              <div className="queue-list__item-left">
                <div className="queue-list__item-position">{entry.position}</div>
                <div>
                  <div className="queue-list__item-name">{entry.clientName}</div>
                  <div className="queue-list__item-service">
                    {entry.services.map(s => s.name).join(', ')}
                  </div>
                </div>
              </div>
              <div className="queue-list__item-wait">
                <div>~{entry.estimatedWait} min</div>
                <div className="queue-list__item-wait-label">espera estimada</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
