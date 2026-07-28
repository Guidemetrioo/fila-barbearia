'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQueue } from '@/context/QueueContext';

const ADMIN_PASSWORD = 'delrey2024';

export default function AdminPage() {
  const {
    config,
    barbers,
    queue,
    toggleShopOpen,
    toggleQueueOpen,
    callClient,
    finishClient,
    removeFromQueue,
    setBarberStatus,
  } = useQueue();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const waitingEntries = queue
    .filter(e => e.status === 'waiting')
    .sort((a, b) => a.position - b.position);
  const servingEntries = queue.filter(e => e.status === 'being-served');
  const availableBarbers = barbers.filter(b => b.status === 'available');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta');
    }
  };

  const handleCallNext = (barberId: string) => {
    if (waitingEntries.length > 0) {
      callClient(waitingEntries[0].id, barberId);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <form className="admin-login__card" onSubmit={handleLogin}>
          <Image
            src="/images/logo.png"
            alt="Del Rey"
            width={80}
            height={80}
            className="admin-login__logo"
          />
          <h1 className="admin-login__title">Painel Admin</h1>
          <p className="admin-login__subtitle">Barbearia Del Rey</p>
          {loginError && <p className="admin-login__error">{loginError}</p>}
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Digite a senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-gold btn-large">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header__left">
          <Image
            src="/images/logo.png"
            alt="Del Rey"
            width={48}
            height={48}
            className="admin-header__logo"
          />
          <div>
            <h1 className="admin-header__title">Painel Admin</h1>
            <p className="admin-header__subtitle">{config.name}</p>
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setIsLoggedIn(false)}
        >
          Sair
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{waitingEntries.length}</div>
          <div className="admin-stat-card__label">Na fila</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{servingEntries.length}</div>
          <div className="admin-stat-card__label">Atendendo</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{availableBarbers.length}</div>
          <div className="admin-stat-card__label">Disponíveis</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">
            {waitingEntries.length + servingEntries.length}
          </div>
          <div className="admin-stat-card__label">Total Hoje</div>
        </div>
      </div>

      {/* Toggles */}
      <div className="admin-toggle">
        <span className="admin-toggle__label">
          {config.isOpen ? '🟢 Barbearia aberta' : '🔴 Barbearia fechada'}
        </span>
        <div
          className={`toggle-switch ${config.isOpen ? 'active' : ''}`}
          onClick={toggleShopOpen}
        />
      </div>
      <div className="admin-toggle">
        <span className="admin-toggle__label">
          {config.isQueueOpen ? '🟢 Fila aberta' : '🔴 Fila fechada'}
        </span>
        <div
          className={`toggle-switch ${config.isQueueOpen ? 'active' : ''}`}
          onClick={toggleQueueOpen}
        />
      </div>

      {/* Barbers Management */}
      <h2 className="admin-section-title">
        💈 Barbeiros
      </h2>
      <div className="admin-barbers-grid">
        {barbers.map(barber => {
          const serving = servingEntries.find(e => e.barberId === barber.id);
          return (
            <div key={barber.id} className="admin-barber-card">
              <Image
                src={barber.avatar}
                alt={barber.name}
                width={56}
                height={56}
                className="admin-barber-card__avatar"
              />
              <div className="admin-barber-card__name">{barber.name}</div>
              <div className="admin-barber-card__status">
                <span
                  className="barber-card__status-dot"
                  style={{
                    background: barber.status === 'available' ? 'var(--green)' :
                      barber.status === 'busy' ? 'var(--gold)' : 'var(--text-muted)',
                    boxShadow: barber.status === 'available' ? '0 0 6px var(--green)' :
                      barber.status === 'busy' ? '0 0 6px var(--gold)' : 'none',
                  }}
                />
                {barber.status === 'available' && 'Livre'}
                {barber.status === 'busy' && (serving ? `→ ${serving.clientName}` : 'Ocupado')}
                {barber.status === 'break' && 'Em pausa'}
                {barber.status === 'offline' && 'Offline'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {barber.status === 'available' && waitingEntries.length > 0 && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => handleCallNext(barber.id)}
                  >
                    Chamar próximo
                  </button>
                )}
                {barber.status === 'busy' && serving && (
                  <button
                    className="btn btn-amber btn-sm"
                    onClick={() => finishClient(serving.id)}
                  >
                    Finalizar
                  </button>
                )}
                {barber.status !== 'break' && barber.status !== 'busy' && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setBarberStatus(barber.id, 'break')}
                  >
                    Pausar
                  </button>
                )}
                {barber.status === 'break' && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => setBarberStatus(barber.id, 'available')}
                  >
                    Retornar
                  </button>
                )}
                {barber.status !== 'offline' && barber.status !== 'busy' && (
                  <button
                    className="btn btn-red btn-sm"
                    onClick={() => setBarberStatus(barber.id, 'offline')}
                  >
                    Offline
                  </button>
                )}
                {barber.status === 'offline' && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => setBarberStatus(barber.id, 'available')}
                  >
                    Ativar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Being Served */}
      {servingEntries.length > 0 && (
        <>
          <h2 className="admin-section-title">✂️ Sendo Atendidos</h2>
          <div className="admin-queue-list" style={{ marginBottom: '1.5rem' }}>
            {servingEntries.map(entry => {
              const barber = barbers.find(b => b.id === entry.barberId);
              return (
                <div key={entry.id} className="admin-queue-item admin-queue-item--serving">
                  <div className="admin-queue-item__info">
                    <div className="admin-queue-item__name">{entry.clientName}</div>
                    <div className="admin-queue-item__details">
                      {entry.services.map(s => s.name).join(', ')} •{' '}
                      {barber ? `com ${barber.name}` : ''} •{' '}
                      R$ {entry.services.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="admin-queue-item__actions">
                    <button
                      className="btn btn-amber btn-sm"
                      onClick={() => finishClient(entry.id)}
                    >
                      ✓ Finalizar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Queue */}
      <h2 className="admin-section-title">
        📋 Fila de Espera ({waitingEntries.length})
      </h2>
      {waitingEntries.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', opacity: 1 }}>
          <p style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>
            🕐 Ninguém na fila no momento
          </p>
        </div>
      ) : (
        <div className="admin-queue-list">
          {waitingEntries.map(entry => (
            <div key={entry.id} className="admin-queue-item">
              <div className="admin-queue-item__info">
                <div className="admin-queue-item__name">
                  {entry.position}. {entry.clientName}
                </div>
                <div className="admin-queue-item__details">
                  {entry.services.map(s => s.name).join(', ')} •{' '}
                  📱 {entry.whatsapp} •{' '}
                  R$ {entry.services.reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                </div>
              </div>
              <div className="admin-queue-item__actions">
                {availableBarbers.length > 0 && (
                  <button
                    className="btn btn-green btn-sm"
                    onClick={() => callClient(entry.id, availableBarbers[0].id)}
                  >
                    Chamar
                  </button>
                )}
                <button
                  className="btn btn-red btn-sm"
                  onClick={() => removeFromQueue(entry.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
