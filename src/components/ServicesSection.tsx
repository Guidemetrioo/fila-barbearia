'use client';

import { useQueue } from '@/context/QueueContext';

export default function ServicesSection() {
  const { services } = useQueue();

  return (
    <section className="section-card services-showcase">
      <h3 className="services-showcase__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Serviços e Preços
      </h3>

      <div className="services-showcase__grid">
        {services.map(service => (
          <article key={service.id} className="services-showcase__card">
            <span className="services-showcase__name">{service.name}</span>
            <strong className="services-showcase__price">
              R$ {service.price.toFixed(2).replace('.', ',')}
            </strong>
            <span className="services-showcase__duration">⏱ {service.duration} min</span>
          </article>
        ))}
      </div>
    </section>
  );
}
