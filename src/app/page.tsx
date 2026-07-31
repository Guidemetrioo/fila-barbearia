'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'queue' | 'services' | 'help'>('queue');
  const [filterBarberId, setFilterBarberId] = useState<string | null>(null);
  const pendingQueueScroll = useRef(false);

  const scrollToWaitingQueue = () => {
    document.getElementById('queue-waiting-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    if (activeTab !== 'queue' || !pendingQueueScroll.current) return;

    pendingQueueScroll.current = false;
    const frame = requestAnimationFrame(scrollToWaitingQueue);
    return () => cancelAnimationFrame(frame);
  }, [activeTab]);

  const handleQueueNavigation = () => {
    if (activeTab === 'queue') {
      scrollToWaitingQueue();
      return;
    }

    pendingQueueScroll.current = true;
    setActiveTab('queue');
  };

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
          <div id="queue-waiting-section" className="queue-waiting-section" key="queue" style={{ marginBottom: '1.25rem' }}>
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

  const renderNavigation = () => (
    <div className="nav-tabs-shell">
      <div className="nav-tabs" aria-label="Navegação principal">
        <button
          className={`nav-tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={handleQueueNavigation}
        >
          Fila em Tempo Real
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
    </div>
  );

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

        {activeTab !== 'queue' && renderNavigation()}

        {/* Render sections dynamically according to configured order */}
        {activeTab === 'queue' && (
          sectionsOrder.map(sectionId => (
            <Fragment key={sectionId}>
              {renderSection(sectionId)}
              {sectionId === 'action' && renderNavigation()}
            </Fragment>
          ))
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
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.065 2.107 1.213 2.256c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a10.24 10.24 0 0 1-5.223-1.43l-.374-.222-3.884 1.018 1.036-3.787-.243-.389a10.235 10.235 0 0 1-1.57-5.473A10.28 10.28 0 0 1 12.275 2.005a10.21 10.21 0 0 1 7.269 3.015 10.227 10.227 0 0 1 2.997 7.275 10.28 10.28 0 0 1-10.266 10.262m8.734-19.331A12.151 12.151 0 0 0 12.283.003C5.52.003.016 5.507.013 12.272c0 2.164.564 4.276 1.636 6.137L.01 24.397l6.125-1.606a12.27 12.27 0 0 0 6.143 1.564h.005c6.762 0 12.267-5.505 12.27-12.272a12.2 12.2 0 0 0-3.568-8.662" />
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
