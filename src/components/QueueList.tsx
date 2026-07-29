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
    <div className="section-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Centered Italic Title matching reference image */}
      <h3 style={{
        textAlign: 'center',
        fontStyle: 'italic',
        fontWeight: 800,
        fontSize: '1.35rem',
        color: '#F8FAFC',
        marginBottom: '1.25rem',
        letterSpacing: '0.02em',
      }}>
        Fila de espera
      </h3>

      {waitingEntries.length === 0 && servingEntries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: '#94A3B8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <div style={{ fontSize: '1.75rem', opacity: 0.7 }}>⏱️</div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ninguém na fila</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Serving entries */}
          {servingEntries.map(entry => (
            <div
              key={entry.id}
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '14px',
                padding: '1rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1.5px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'rgba(16, 185, 129, 0.12)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.15rem' }}>
                    {entry.clientName}
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                    {(entry.services || []).map(s => s?.name).filter(Boolean).join(' + ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)' }}>
                    Profissional: {entry.barberName || 'LUCAS'}
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                whiteSpace: 'nowrap',
              }}>
                Em atendimento
              </div>
            </div>
          ))}

          {/* Waiting entries */}
          {waitingEntries.map(entry => (
            <div
              key={entry.id}
              style={{
                background: 'rgba(10, 24, 17, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '1rem 1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(212, 175, 55, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'rgba(212, 175, 55, 0.06)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.15rem' }}>
                    {entry.clientName}
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                    {(entry.services || []).map(s => s?.name).filter(Boolean).join(' + ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold)' }}>
                    {entry.barberName ? `Profissional: ${entry.barberName}` : 'Sem preferência de profissional'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                ~{entry.estimatedWait} min
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
