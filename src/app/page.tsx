'use client';

import { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import QueueHeader from '@/components/QueueHeader';
import ShopProfile from '@/components/ShopProfile';
import ShopInfo from '@/components/ShopInfo';
import HelpSection from '@/components/HelpSection';
import BarberCard from '@/components/BarberCard';
import QueueList from '@/components/QueueList';
import JoinQueueModal from '@/components/JoinQueueModal';
import AccountModal from '@/components/AccountModal';
import RatingSection from '@/components/RatingSection';

export default function Home() {
  const { config, barbers, queue } = useQueue();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

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

        {/* Shop Hours & Info */}
        <ShopInfo />

        {/* Help Section */}
        <HelpSection />

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
              Entrar na fila
            </button>
          ) : (
            <button className="btn btn-closed" disabled>
              {!config.isOpen ? 'Barbearia fechada' : 'Fila fechada'}
            </button>
          )}
        </div>

        {/* Available Barbers */}
        <div className="section-card">
          <h3 className="barbers-section__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Profissionais Disponíveis
          </h3>
          <div className="barbers-grid">
            {barbers
              .filter(b => b.status !== 'offline')
              .map(barber => (
                <BarberCard key={barber.id} barber={barber} queueEntries={queue} />
              ))}
          </div>
        </div>

        {/* Queue List */}
        <QueueList />

        {/* Rating */}
        <RatingSection />
      </main>

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
