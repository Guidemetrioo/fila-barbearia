'use client';

import Image from 'next/image';
import { useQueue } from '@/context/QueueContext';

export default function ShopProfile() {
  const { config } = useQueue();

  return (
    <div className="section-card shop-profile">
      <div className="shop-profile__avatar-wrapper">
        <Image
          src={config.logo}
          alt={config.name}
          width={100}
          height={100}
          className="shop-profile__avatar"
          priority
        />
      </div>
      <h2 className="shop-profile__name">{config.name}</h2>
      <div className={`shop-profile__badge ${!config.isOpen ? 'shop-profile__badge--closed' : ''}`}>
        {config.isOpen ? 'FILA EM TEMPO REAL' : 'BARBEARIA FECHADA'}
      </div>
      <p className="shop-profile__description">{config.description}</p>
      <a
        href={config.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-instagram"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
        Instagram
      </a>
    </div>
  );
}
