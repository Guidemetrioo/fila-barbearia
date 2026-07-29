'use client';

import { useQueue } from '@/context/QueueContext';

export default function ShopInfo() {
  const { config } = useQueue();

  return (
    <div className="section-card shop-info" style={{ textAlign: 'center' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-light)', marginBottom: '0.85rem' }}>
        Informações e Funcionamento
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Fila abre às <strong>{config.queueOpenTime}</strong> | Atendimento a partir das <strong>{config.shopOpenTime}</strong>
      </p>
      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        {config.workingDays}
      </p>
      
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        alignItems: 'center',
      }}>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Barbearia+Del+Rey,+R.+Sapucaia,+359+-+Belenzinho,+São+Paulo+-+SP&travelmode=driving"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}
        >
          📍 {config.address}
        </a>
        <a
          href={`https://wa.me/55${(config.phone || '').replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.85rem',
            color: 'var(--green-text)',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          📱 WhatsApp: {config.phone}
        </a>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          💳 Crédito, Débito e Pix • 🚻 Ambiente Climatizado • ☕ Café & Wi-Fi
        </p>
      </div>
    </div>
  );
}
