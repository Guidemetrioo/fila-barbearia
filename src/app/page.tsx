'use client';

import { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import QueueHeader from '@/components/QueueHeader';
import ShopProfile from '@/components/ShopProfile';
import ShopInfo from '@/components/ShopInfo';
import BarberCard from '@/components/BarberCard';
import QueueList from '@/components/QueueList';
import ServicesSection from '@/components/ServicesSection';
import JoinQueueModal from '@/components/JoinQueueModal';
import AccountModal from '@/components/AccountModal';
import RatingSection from '@/components/RatingSection';

export default function Home() {
  const { config, barbers, queue } = useQueue();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [filterBarberId, setFilterBarberId] = useState<string | null>(null);

  const handleToggleBarberFilter = (barberId: string) => {
    setFilterBarberId(prev => prev === barberId ? null : barberId);
  };

  const activeFilterBarber = barbers.find(b => b.id === filterBarberId);

  return (
    <>
      <main className="page-container">
        {/* 1. Header with queue count and action buttons */}
        <QueueHeader
          onJoinQueue={() => setShowJoinModal(true)}
          onMyAccount={() => setShowAccountModal(true)}
        />

        {/* Gold separator */}
        <hr className="gold-separator" />

        {/* 2. Shop Profile Card */}
        <ShopProfile />

        {/* 3. Status Announcement Banner */}
        <div className="announcement-banner">
          <div className="announcement-banner__item">
            <span>Horários base sujeitos a pequenas alterações de tolerância</span>
          </div>
          <div className="announcement-banner__item">
            <span>Fila abre às {config.queueOpenTime} | Atendimento a partir das {config.shopOpenTime}</span>
          </div>
          <div
            className="announcement-banner__item announcement-banner__item--clickable"
            onClick={() => setShowAccountModal(true)}
          >
            <span>Para CANCELAR ou consultar sua posição: clique em <strong>ENTRAR NA MINHA CONTA</strong></span>
          </div>
        </div>

        {/* 4. Barbeiros Section */}
        <div className="section-card">
          <h3 className="barbers-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Barbeiros — Clique para filtrar a fila
          </h3>
          <div className="barbers-grid">
            {barbers
              .filter(b => b.status !== 'offline')
              .map(barber => (
                <BarberCard
                  key={barber.id}
                  barber={barber}
                  queueEntries={queue}
                  isFilterActive={filterBarberId === barber.id}
                  onToggleFilter={handleToggleBarberFilter}
                />
              ))}
          </div>
        </div>

        {/* Barber filter banner indicator if active */}
        {filterBarberId && activeFilterBarber && (
          <div className="queue-filter-banner" style={{ marginBottom: '1.25rem' }}>
            <span>Filtrando fila de: <strong>{activeFilterBarber.name}</strong></span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setFilterBarberId(null)}
              style={{ padding: '0.25rem 0.75rem' }}
            >
              ✕ Ver todos
            </button>
          </div>
        )}

        {/* 5. Fila de Espera Section */}
        <QueueList filterBarberId={filterBarberId} />

        {/* 6. Avaliar Barbearia Section */}
        <RatingSection />

        {/* 7. Instagram & Informações do Estabelecimento */}
        <ShopInfo />
      </main>

      {/* Floating Action Button */}
      <a
        href={`https://wa.me/55${config.phone.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="Falar no WhatsApp"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </a>

      {/* Modals */}
      <JoinQueueModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </>
  );
}
