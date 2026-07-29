'use client';

import { useQueue } from '@/context/QueueContext';

export default function ShopInfo() {
  const { config } = useQueue();

  return (
    <>
      {/* Instagram Button Card (Exact match with reference video) */}
      <a
        href={config.instagram}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem',
          width: '100%',
          padding: '0.95rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(212, 175, 55, 0.28)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--gold-light)',
          fontSize: '0.95rem',
          fontWeight: 700,
          textDecoration: 'none',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-card)',
          transition: 'all var(--transition-base)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
        Instagram
      </a>

      {/* Establishment Info Card (Exact match with reference video) */}
      <div className="section-card" style={{ padding: '1.35rem 1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#EF4444' }}>📍</span> Informações do Estabelecimento
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
          <div>
            <strong style={{ color: 'var(--gold)' }}>Nome:</strong>{' '}
            <span style={{ color: '#F8FAFC', fontWeight: 800, textTransform: 'uppercase' }}>{config.name}</span>
          </div>

          <div>
            <strong style={{ color: 'var(--gold)' }}>Endereço:</strong>{' '}
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Barbearia+Del+Rey,+R.+Sapucaia,+359+-+Belenzinho,+São+Paulo+-+SP"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#E2E8F0', textDecoration: 'underline' }}
            >
              {config.address}
            </a>
          </div>

          <div>
            <strong style={{ color: 'var(--gold)' }}>Telefone:</strong>{' '}
            <span style={{ color: '#E2E8F0' }}>{config.phone}</span>
          </div>

          <div>
            <strong style={{ color: 'var(--gold)' }}>Horários:</strong>{' '}
            <span style={{ color: '#E2E8F0' }}>{config.workingDays}</span>
          </div>

          <div>
            <strong style={{ color: 'var(--gold)' }}>Fila abre:</strong>{' '}
            <span style={{ color: '#E2E8F0', fontWeight: 700 }}>{config.queueOpenTime}</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>|</span>
            <strong style={{ color: 'var(--gold)' }}>Barbearia abre:</strong>{' '}
            <span style={{ color: '#E2E8F0', fontWeight: 700 }}>{config.shopOpenTime}</span>
          </div>

          <div>
            <strong style={{ color: 'var(--gold)' }}>Instagram:</strong>{' '}
            <a
              href={config.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold-light)' }}
            >
              @delrey_barbearia
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
