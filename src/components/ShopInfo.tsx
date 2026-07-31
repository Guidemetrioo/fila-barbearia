'use client';

import { useQueue } from '@/context/QueueContext';

export default function ShopInfo() {
  const { config } = useQueue();

  return (
    <div className="section-card" style={{ padding: '1.35rem 1.5rem', marginBottom: '1.5rem' }}>
      <h3 className="shop-info__title">
        <span className="shop-info__title-icon">📍</span>
        <span>Informações do Estabelecimento</span>
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
  );
}
