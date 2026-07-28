'use client';

import { useQueue } from '@/context/QueueContext';

export default function ShopInfo() {
  const { config } = useQueue();

  return (
    <div className="section-card shop-info">
      <p className="shop-info__alert">
        ✅ HORÁRIOS BASE PODEM TER ALTERAÇÕES ⚠️
      </p>
      <p className="shop-info__time">
        🕐 FILA ABRE ÀS {config.queueOpenTime} 📂
      </p>
      <p className="shop-info__time">
        📍 BARBEARIA ABRE À PARTIR DAS {config.shopOpenTime} 💈
      </p>
      <p className="shop-info__time" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
        📅 {config.workingDays}
      </p>
      <div style={{
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'center',
      }}>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Barbearia+Del+Rey,+R.+Sapucaia,+359+-+Belenzinho,+São+Paulo+-+SP&travelmode=driving"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
        >
          📍 {config.address}
        </a>
        <a
          href={`https://wa.me/55${(config.phone || '').replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.8rem',
            color: 'var(--green-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          📱 {config.phone}
        </a>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          💳 Crédito, Débito e NFC • 🚻 Banheiro • 👶 Bom para crianças
        </p>
      </div>
      <p className="shop-info__cancel-note">
        💇 ( Para CANCELAR clique em {'->'} ENTRAR NA MINHA CONTA ) 💇
      </p>
    </div>
  );
}
