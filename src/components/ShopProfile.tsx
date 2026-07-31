'use client';

import Image from 'next/image';
import { useQueue } from '@/context/QueueContext';
import { useLayout } from '@/context/LayoutContext';

export default function ShopProfile() {
  const { config } = useQueue();
  const { layoutConfig } = useLayout();
  const { branding } = layoutConfig;

  const shopTitle = branding.shopName || config.name;
  const shopLogo = branding.logoUrl || config.logo;
  const shopDesc = branding.shopDescription || config.description;

  return (
    <div className="section-card shop-profile" style={{ paddingBottom: '1.25rem' }}>
      <div className="shop-profile__avatar-wrapper" style={{ cursor: 'pointer' }}>
        <a href="/admin" title="Acesso Administrador" style={{ display: 'block' }}>
          <Image
            src={shopLogo}
            alt={shopTitle}
            width={84}
            height={84}
            className="shop-profile__avatar"
            priority
          />
        </a>
      </div>
      <h2 className="shop-profile__name">{shopTitle}</h2>
      {shopDesc && (
        <p className="shop-profile__tagline" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {shopDesc}
        </p>
      )}
      <div className={`shop-profile__badge ${!config.isOpen ? 'shop-profile__badge--closed' : ''}`} style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
        {config.isOpen ? 'FILA EM TEMPO REAL' : 'BARBEARIA FECHADA'}
      </div>
    </div>
  );
}
