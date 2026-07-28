'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useQueue } from '@/context/QueueContext';

const ADMIN_PASSWORD = 'delrey2024';

export default function AdminPage() {
  const {
    config,
    barbers,
    queue,
    services,
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
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'barbers' | 'history'>('overview');
  const [now, setNow] = useState(Date.now());

  // Live clock update
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const waitingEntries = queue
    .filter(e => e.status === 'waiting')
    .sort((a, b) => a.position - b.position);
  const servingEntries = queue.filter(e => e.status === 'being-served');
  const completedToday = queue.filter(e => e.status === 'completed').length;
  const availableBarbers = barbers.filter(b => b.status === 'available');
  const busyBarbers = barbers.filter(b => b.status === 'busy');
  const totalRevenue = servingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, svc) => s + svc.price, 0), 0
  ) + waitingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, svc) => s + svc.price, 0), 0
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta');
    }
  };

  const handleCallClient = (entryId: string, barberId: string) => {
    callClient(entryId, barberId);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getWaitingSince = (joinedAt: number) => {
    const minutes = Math.floor((now - joinedAt) / 60000);
    if (minutes < 1) return 'Agora mesmo';
    return `${minutes} min atrás`;
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
          <h1 className="admin-login__title">Painel Administrativo</h1>
          <p className="admin-login__subtitle">Barbearia Del Rey — Controle Total</p>
          {loginError && <p className="admin-login__error">{loginError}</p>}
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Digite a senha de acesso"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-gold btn-large">
            🔐 Entrar no Painel
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
            <h1 className="admin-header__title">Painel Administrativo</h1>
            <p className="admin-header__subtitle">
              {config.name} — {config.isOpen ? '🟢 Aberta' : '🔴 Fechada'}
            </p>
          </div>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setIsLoggedIn(false)}
        >
          🚪 Sair
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{waitingEntries.length}</div>
          <div className="admin-stat-card__label">Na Fila</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{servingEntries.length}</div>
          <div className="admin-stat-card__label">Atendendo</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">{availableBarbers.length}/{barbers.length}</div>
          <div className="admin-stat-card__label">Barbeiros Livres</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__value">R$ {totalRevenue.toFixed(0)}</div>
          <div className="admin-stat-card__label">Receita Prevista</div>
        </div>
      </div>

      {/* Control Toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="admin-toggle">
          <span className="admin-toggle__label">
            {config.isOpen ? '🟢 Barbearia Aberta' : '🔴 Barbearia Fechada'}
          </span>
          <div
            className={`toggle-switch ${config.isOpen ? 'active' : ''}`}
            onClick={toggleShopOpen}
          />
        </div>
        <div className="admin-toggle">
          <span className="admin-toggle__label">
            {config.isQueueOpen ? '🟢 Fila Aberta' : '🔴 Fila Fechada'}
          </span>
          <div
            className={`toggle-switch ${config.isQueueOpen ? 'active' : ''}`}
            onClick={toggleQueueOpen}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Visão Geral
        </button>
        <button
          className={`nav-tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 Fila ({waitingEntries.length})
        </button>
        <button
          className={`nav-tab ${activeTab === 'barbers' ? 'active' : ''}`}
          onClick={() => setActiveTab('barbers')}
        >
          ✂️ Barbeiros
        </button>
        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📦 Serviços
        </button>
      </div>

      {/* ==== OVERVIEW TAB ==== */}
      {activeTab === 'overview' && (
        <>
          {/* Being Served Now */}
          <h2 className="admin-section-title">✂️ Atendendo Agora ({servingEntries.length})</h2>
          {servingEntries.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', opacity: 1, marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', padding: '1.5rem 0' }}>
                Nenhum cliente sendo atendido no momento
              </p>
            </div>
          ) : (
            <div className="admin-queue-list" style={{ marginBottom: '1.5rem' }}>
              {servingEntries.map(entry => {
                const barber = barbers.find(b => b.id === entry.barberId);
                return (
                  <div key={entry.id} className="admin-queue-item admin-queue-item--serving">
                    <div className="admin-queue-item__info">
                      <div className="admin-queue-item__name">
                        {entry.clientName}
                        {entry.dependents && entry.dependents.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}> (+{entry.dependents.length} acomp.)</span>
                        )}
                      </div>
                      <div className="admin-queue-item__details">
                        {entry.services.map(s => s.name).join(', ')} •{' '}
                        {barber ? `com ${barber.name}` : ''} •{' '}
                        R$ {entry.services.reduce((sum, s) => sum + s.price, 0).toFixed(2)} •{' '}
                        📱 {entry.whatsapp}
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
          )}

          {/* Quick Queue Preview */}
          <h2 className="admin-section-title">📋 Próximos na Fila ({waitingEntries.length})</h2>
          {waitingEntries.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', opacity: 1 }}>
              <p style={{ color: 'var(--text-secondary)', padding: '1.5rem 0' }}>
                🕐 Ninguém na fila no momento
              </p>
            </div>
          ) : (
            <div className="admin-queue-list">
              {waitingEntries.slice(0, 5).map(entry => (
                <div key={entry.id} className="admin-queue-item">
                  <div className="admin-queue-item__info">
                    <div className="admin-queue-item__name">
                      {entry.position}º — {entry.clientName}
                    </div>
                    <div className="admin-queue-item__details">
                      {entry.services.map(s => s.name).join(', ')} •{' '}
                      {entry.barberName ? `Pref: ${entry.barberName}` : 'Sem preferência'} •{' '}
                      📱 {entry.whatsapp} •{' '}
                      ⏱️ {getWaitingSince(entry.joinedAt)}
                    </div>
                  </div>
                  <div className="admin-queue-item__actions">
                    {availableBarbers.length > 0 && (
                      <button
                        className="btn btn-green btn-sm"
                        onClick={() => handleCallClient(entry.id, availableBarbers[0].id)}
                      >
                        📢 Chamar
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {waitingEntries.length > 5 && (
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  ... e mais {waitingEntries.length - 5} na fila. Veja na aba "Fila".
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ==== QUEUE TAB ==== */}
      {activeTab === 'queue' && (
        <>
          <h2 className="admin-section-title">📋 Fila de Espera Completa ({waitingEntries.length})</h2>
          {waitingEntries.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', opacity: 1 }}>
              <p style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>
                🕐 Ninguém na fila no momento
              </p>
            </div>
          ) : (
            <div className="admin-queue-list">
              {waitingEntries.map(entry => {
                const entryTotal = entry.services.reduce((sum, s) => sum + s.price, 0) +
                  (entry.dependents || []).reduce((sum, d) => sum + d.services.reduce((s, sv) => s + sv.price, 0), 0);
                return (
                  <div key={entry.id} className="admin-queue-item">
                    <div className="admin-queue-item__info">
                      <div className="admin-queue-item__name">
                        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>#{entry.position}</span> — {entry.clientName}
                        {entry.dependents && entry.dependents.length > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--amber)' }}> (+{entry.dependents.length} acomp.)</span>
                        )}
                      </div>
                      <div className="admin-queue-item__details">
                        🛠️ {entry.services.map(s => s.name).join(', ')}
                        {entry.dependents && entry.dependents.length > 0 && (
                          <> | 👥 {entry.dependents.map(d => `${d.name}: ${d.services.map(s => s.name).join(', ')}`).join('; ')}</>
                        )}
                      </div>
                      <div className="admin-queue-item__details" style={{ marginTop: '0.25rem' }}>
                        ✂️ {entry.barberName || 'Sem preferência'} •{' '}
                        📱 <a href={`https://wa.me/55${entry.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-text)' }}>{entry.whatsapp}</a> •{' '}
                        💰 R$ {entryTotal.toFixed(2)} •{' '}
                        🕐 Entrou às {formatTime(entry.joinedAt)} ({getWaitingSince(entry.joinedAt)})
                      </div>
                    </div>
                    <div className="admin-queue-item__actions" style={{ flexDirection: 'column', gap: '0.35rem' }}>
                      {availableBarbers.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {availableBarbers.map(b => (
                            <button
                              key={b.id}
                              className="btn btn-green btn-sm"
                              onClick={() => handleCallClient(entry.id, b.id)}
                              title={`Chamar com ${b.name}`}
                            >
                              📢 {b.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        className="btn btn-red btn-sm"
                        onClick={() => removeFromQueue(entry.id)}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ==== BARBERS TAB ==== */}
      {activeTab === 'barbers' && (
        <>
          <h2 className="admin-section-title">💈 Gerenciar Barbeiros</h2>
          <div className="admin-barbers-grid">
            {barbers.map(barber => {
              const serving = servingEntries.find(e => e.barberId === barber.id);
              const barberWaiting = waitingEntries.filter(e => e.barberId === barber.id);
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
                    {barber.status === 'busy' && (serving ? `Atendendo: ${serving.clientName}` : 'Ocupado')}
                    {barber.status === 'break' && 'Em pausa'}
                    {barber.status === 'offline' && 'Indisponível'}
                  </div>

                  {/* Client being served */}
                  {serving && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', padding: '0.4rem', background: 'rgba(251,177,35,0.08)', borderRadius: '6px' }}>
                      🛠️ {serving.services.map(s => s.name).join(', ')}<br />
                      💰 R$ {serving.services.reduce((s, sv) => s + sv.price, 0).toFixed(2)}
                    </div>
                  )}

                  {/* Waiting for this barber */}
                  {barberWaiting.length > 0 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      {barberWaiting.length} aguardando esse barbeiro
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {barber.status === 'available' && waitingEntries.length > 0 && (
                      <button
                        className="btn btn-green btn-sm"
                        onClick={() => handleCallClient(waitingEntries[0].id, barber.id)}
                      >
                        📢 Chamar próximo
                      </button>
                    )}
                    {barber.status === 'busy' && serving && (
                      <button
                        className="btn btn-amber btn-sm"
                        onClick={() => finishClient(serving.id)}
                      >
                        ✓ Finalizar
                      </button>
                    )}
                    {barber.status !== 'break' && barber.status !== 'busy' && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setBarberStatus(barber.id, 'break')}
                      >
                        ⏸️ Pausar
                      </button>
                    )}
                    {barber.status === 'break' && (
                      <button
                        className="btn btn-green btn-sm"
                        onClick={() => setBarberStatus(barber.id, 'available')}
                      >
                        ▶️ Retornar
                      </button>
                    )}
                    {barber.status !== 'offline' && barber.status !== 'busy' && (
                      <button
                        className="btn btn-red btn-sm"
                        onClick={() => setBarberStatus(barber.id, 'offline')}
                      >
                        🚫 Desativar
                      </button>
                    )}
                    {barber.status === 'offline' && (
                      <button
                        className="btn btn-green btn-sm"
                        onClick={() => setBarberStatus(barber.id, 'available')}
                      >
                        ✅ Ativar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ==== SERVICES TAB ==== */}
      {activeTab === 'history' && (
        <>
          <h2 className="admin-section-title">🏷️ Tabela de Serviços e Preços</h2>
          <div className="section-card" style={{ opacity: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--gold)' }}>Serviço</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--gold)' }}>Duração</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: 'var(--gold)' }}>Preço</th>
                </tr>
              </thead>
              <tbody>
                {services.map(svc => (
                  <tr key={svc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.65rem 0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      {svc.name}
                      {svc.description && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{svc.description}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.65rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {svc.duration} min
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.65rem 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold)' }}>
                      R$ {svc.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Card */}
          <h2 className="admin-section-title" style={{ marginTop: '1.5rem' }}>📍 Informações do Estabelecimento</h2>
          <div className="section-card" style={{ opacity: 1 }}>
            <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div><strong style={{ color: 'var(--gold)' }}>Nome:</strong> {config.name}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Endereço:</strong> {config.address}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Telefone:</strong> {config.phone}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Horários:</strong> {config.workingDays}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Fila abre às:</strong> {config.queueOpenTime}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Barbearia abre às:</strong> {config.shopOpenTime}</div>
              <div>
                <strong style={{ color: 'var(--gold)' }}>Instagram:</strong>{' '}
                <a href={config.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-light)' }}>
                  @delrey_barbearia
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
