'use client';

import { useQueue } from '@/context/QueueContext';

export default function ServicesSection() {
  const { services } = useQueue();

  return (
    <div className="section-card" style={{ padding: '1.35rem 1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Serviços e Preços
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        Confira nossa tabela de serviços e valores atualizados.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {services.map(svc => (
          <div
            key={svc.id}
            style={{
              background: 'rgba(10, 24, 17, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.1rem 1.15rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {svc.name}
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold)' }}>
                  R$ {svc.price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {svc.description && (
                <p style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.4, marginBottom: '1rem', minHeight: '2.2rem' }}>
                  {svc.description}
                </p>
              )}
            </div>

            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.775rem', fontWeight: 600 }}>
              <span>⏱️</span> Duração estimada: {svc.duration} min
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
