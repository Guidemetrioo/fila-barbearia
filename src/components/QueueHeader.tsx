'use client';

import { useQueue } from '@/context/QueueContext';

interface QueueHeaderProps {
  onJoinQueue: () => void;
  onMyAccount: () => void;
}

export default function QueueHeader({ onJoinQueue, onMyAccount }: QueueHeaderProps) {
  const { queue, config } = useQueue();
  const waitingCount = queue.filter(e => e.status === 'waiting').length;

  return (
    <div className="queue-header">
      <h1 className="queue-header__title">Fila de espera</h1>
      <div className="queue-header__count">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        {waitingCount} {waitingCount === 1 ? 'pessoa' : 'pessoas'} na fila
      </div>
      <div className="queue-header__actions">
        <button className="btn btn-gold" onClick={onMyAccount}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10,17 15,12 10,7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Entrar na minha conta
        </button>
        <button
          className={`btn ${config.isOpen && config.isQueueOpen ? 'btn-gold' : 'btn-closed'}`}
          onClick={onJoinQueue}
          disabled={!config.isOpen || !config.isQueueOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Entrar na fila
        </button>
      </div>
    </div>
  );
}
