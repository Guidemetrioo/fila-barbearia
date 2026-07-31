'use client';

import { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import { useLayout, SectionId } from '@/context/LayoutContext';
import QueueHeader from '@/components/QueueHeader';
import ShopProfile from '@/components/ShopProfile';
import ShopInfo from '@/components/ShopInfo';
import HelpSection from '@/components/HelpSection';
import BarberCard from '@/components/BarberCard';
import QueueList from '@/components/QueueList';
import ServicesSection from '@/components/ServicesSection';
import JoinQueueModal from '@/components/JoinQueueModal';
import AccountModal from '@/components/AccountModal';

export default function Home() {
  const { config, barbers, queue } = useQueue();
  const { layoutConfig } = useLayout();
  const { branding, sectionsOrder, hiddenSections, floatingButtons } = layoutConfig;

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'barbers' | 'services' | 'help'>('queue');
  const [filterBarberId, setFilterBarberId] = useState<string | null>(null);

  const handleToggleBarberFilter = (barberId: string) => {
    setFilterBarberId(prev => prev === barberId ? null : barberId);
  };

  const activeFilterBarber = barbers.find(b => b.id === filterBarberId);

  const isSectionVisible = (id: SectionId) => !hiddenSections.includes(id);

  // Helper to render sections in dynamic custom order
  const renderSection = (id: SectionId) => {
    if (!isSectionVisible(id)) return null;

    switch (id) {
      case 'profile':
        return <ShopProfile key="profile" />;

      case 'banner':
        return (
          <div key="banner" className="announcement-banner" style={{ marginBottom: '1.25rem' }}>
            {branding.bannerText1 && (
              <div className="announcement-banner__item">
                <span>{branding.bannerText1}</span>
              </div>
            )}
            {branding.bannerText2 && (
              <div className="announcement-banner__item">
                <span>{branding.bannerText2}</span>
              </div>
            )}
            {branding.bannerText3 && (
              <div
                className="announcement-banner__item announcement-banner__item--clickable"
                onClick={() => setShowAccountModal(true)}
              >
                <span>{branding.bannerText3}</span>
              </div>
            )}
          </div>
        );

      case 'action':
        return (
          <div key="action" className="action-center" style={{ marginBottom: '1.25rem' }}>
            {config.isOpen && config.isQueueOpen ? (
              <button
                className={`btn btn-gold btn-large ${branding.ctaButtonPulse ? 'btn-pulse' : ''}`}
                onClick={() => setShowJoinModal(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                {branding.ctaButtonText || 'ENTRAR NA FILA DE CORTE'}
              </button>
            ) : (
              <button className="btn btn-closed" disabled>
                {!config.isOpen ? 'Barbearia fechada' : 'Fila fechada'}
              </button>
            )}
          </div>
        );

      case 'barbers':
        return (
          <div key="barbers" className="section-card" style={{ marginBottom: '1.25rem' }}>
            <h3 className="barbers-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
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
        );

      case 'queue':
        return (
          <div key="queue" style={{ marginBottom: '1.25rem' }}>
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
            <QueueList filterBarberId={filterBarberId} />
          </div>
        );

      case 'services':
        return null;

      case 'help':
        return null;

      case 'info':
        return <ShopInfo key="info" />;

      default:
        return null;
    }
  };

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

        {/* Navigation Tabs Bar */}
        <div className="nav-tabs" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`nav-tab ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Fila em Tempo Real
          </button>
          <button
            className={`nav-tab ${activeTab === 'barbers' ? 'active' : ''}`}
            onClick={() => setActiveTab('barbers')}
          >
            Profissionais ({barbers.filter(b => b.status !== 'offline').length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Serviços e Preços
          </button>
          <button
            className={`nav-tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            Como Funciona
          </button>
        </div>

        {/* Render sections dynamically according to configured order */}
        {activeTab === 'queue' && (
          sectionsOrder.map(sectionId => renderSection(sectionId))
        )}

        {activeTab === 'barbers' && (
          <div className="section-card">
            <h3 className="barbers-section__title" style={{ marginBottom: '1.25rem' }}>Equipe de Barbeiros</h3>
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
        {activeTab === 'help' && <HelpSection />}
      </main>

      {/* Floating Action Buttons Stack (Instagram top, WhatsApp bottom) */}
      <div className="floating-buttons-stack">
        {floatingButtons.showInstagram && (
          <a
            href={config.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-btn floating-instagram"
            title="Siga-nos no Instagram"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        )}

        {floatingButtons.showWhatsapp && (
          <a
            href={`https://wa.me/55${config.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-btn floating-whatsapp"
            title="Falar no WhatsApp"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </a>
        )}
      </div>

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
