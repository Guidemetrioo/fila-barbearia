'use client';

import Image from 'next/image';
import { useQueue } from '@/context/QueueContext';

export default function ShopProfile() {
  const { config } = useQueue();

  return (
    <div className="section-card shop-profile" style={{ paddingBottom: '1.25rem' }}>
      <div className="shop-profile__avatar-wrapper">
        <Image
          src={config.logo}
          alt={config.name}
          width={84}
          height={84}
          className="shop-profile__avatar"
          priority
        />
      </div>
      <h2 className="shop-profile__name">{config.name}</h2>
      <div className={`shop-profile__badge ${!config.isOpen ? 'shop-profile__badge--closed' : ''}`} style={{ marginBottom: '0.25rem' }}>
        {config.isOpen ? 'FILA EM TEMPO REAL' : 'BARBEARIA FECHADA'}
      </div>
    </div>
  );
}
