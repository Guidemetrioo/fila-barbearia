'use client';

import { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import QueueHeader from '@/components/QueueHeader';
import ShopProfile from '@/components/ShopProfile';
import ShopInfo from '@/components/ShopInfo';
import HelpSection from '@/components/HelpSection';
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
  const [activeTab, setActiveTab] = useState<'queue' | 'barbers' | 'services' | 'help'>('queue');
  const [filterBarberId, setFilterBarberId] = useState<string | null>(null);

  const handleToggleBarberFilter = (barberId: string) => {
    setFilterBarberId(prev => prev === barberId ? null : barberId);
  };

  const activeFilterBarber = barbers.find(b => b.id === filterBarberId);

  return (
    <>
      <main className="page-container">
        {/* Header with queue count and action buttons */}
        <QueueHeader
          onJoinQueue={() => setShowJoinModal(true)}
          onMyAccount={() => setShowAccountModal(true)}
        />

        {/* Gold separator */}
        <hr className="gold-separator" />

        {/* Shop Profile Card */}
        <ShopProfile />

        {/* Status Announcement Banner */}
        <div className="announcement-banner">
          <div className="announcement-banner__item">✅ HORÁRIOS BASE PODEM TER ALTERAÇÕES ⚠️</div>
          <div className="announcement-banner__item">⏰ FILA ABRE ÀS {config.queueOpenTime} 🔓</div>
          <div className="announcement-banner__item">💈 BARBEARIA ABRE À PARTIR DAS {config.shopOpenTime} 🏁</div>
          <div
            className="announcement-banner__item announcement-banner__item--clickable"
            onClick={() => setShowAccountModal(true)}
          >
            🚨 (Para CANCELAR clique em -&gt;] ENTRAR NA MINHA CONTA) 🚨
          </div>
        </div>

        {/* Main Action Button */}
        <div className="action-center">
          {config.isOpen && config.isQueueOpen ? (
            <button
              className="btn btn-gold btn-large"
              onClick={() => setShowJoinModal(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              Entrar na fila de corte
            </button>
          ) : (
            <button className="btn btn-closed" disabled>
              {!config.isOpen ? 'Barbearia fechada' : 'Fila fechada'}
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            💈 Fila em Tempo Real
          </button>
          <button
            className={`nav-tab ${activeTab === 'barbers' ? 'active' : ''}`}
            onClick={() => setActiveTab('barbers')}
          >
            ✂️ Profissionais ({barbers.filter(b => b.status !== 'offline').length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            🏷️ Serviços e Preços
          </button>
          <button
            className={`nav-tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            ❓ Como Funciona
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'queue' && (
          <>
            {/* Barbers Quick Overview Grid */}
            <div className="section-card">
              <h3 className="barbers-section__title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
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

            {/* Filter indicator */}
            {filterBarberId && activeFilterBarber && (
              <div className="queue-filter-banner">
                <span>🔍 Filtrando fila de: <strong>{activeFilterBarber.name}</strong></span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setFilterBarberId(null)}
                  style={{ padding: '0.25rem 0.75rem' }}
                >
                  ✕ Ver todos
                </button>
              </div>
            )}

            {/* General Queue List */}
            <QueueList filterBarberId={filterBarberId} />
          </>
        )}

        {activeTab === 'barbers' && (
          <div className="section-card">
            <h3 className="barbers-section__title">Equipe de Barbeiros</h3>
            <div className="barbers-grid">
              {barbers
                .filter(b => b.status !== 'offline')
                .map(barber => (
                  <BarberCard key={barber.id} barber={barber} queueEntries={queue} />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && <ServicesSection />}

        {activeTab === 'help' && (
          <>
            <HelpSection />
            <ShopInfo />
          </>
        )}

        {/* Rating */}
        <RatingSection />
      </main>

      {/* Floating Action Button */}
      <a
        href={`https://wa.me/55${config.phone.replace(/\D/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="Falar no WhatsApp"
      >
        💬
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
