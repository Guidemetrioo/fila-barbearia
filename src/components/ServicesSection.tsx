'use client';

import { useQueue } from '@/context/QueueContext';

export default function ServicesSection() {
  const { services } = useQueue();

  return (
    <div className="section-card">
      <h3 className="section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        Serviços e Preços
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Confira nossa tabela de serviços e valores atualizados.
      </p>

      <div className="services-public-grid">
        {services.map(svc => (
          <div key={svc.id} className="service-card-public">
            <div className="service-card-public__header">
              <span className="service-card-public__name">{svc.name}</span>
              <span className="service-card-public__price">R$ {svc.price.toFixed(2)}</span>
            </div>
            {svc.description && (
              <p className="service-card-public__desc">{svc.description}</p>
            )}
            <div className="service-card-public__footer">
              <span className="service-card-public__duration">⏱️ Duração estimada: {svc.duration} min</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
