'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useQueue } from '@/context/QueueContext';


const ADMIN_PASSWORD = 'delrey2024';

export default function AdminPage() {
  const {
    config,
    barbers,
    queue,
    services,
    history,
    toggleShopOpen,
    toggleQueueOpen,
    callClient,
    finishClient,
    removeFromQueue,
    setBarberStatus,
    clearHistory,
  } = useQueue();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'queue' | 'barbers' | 'services' | 'history'>('dashboard');
  const [historyPeriod, setHistoryPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Queue derived data
  const waitingEntries = queue.filter(e => e.status === 'waiting').sort((a, b) => a.position - b.position);
  const servingEntries = queue.filter(e => e.status === 'being-served');
  const availableBarbers = barbers.filter(b => b.status === 'available');

  // Time helpers
  const isToday = (ts: number) => {
    const d = new Date(ts);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };
  const isThisWeek = (ts: number) => {
    const d = new Date(ts);
    const t = new Date();
    const startOfWeek = new Date(t);
    startOfWeek.setDate(t.getDate() - t.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  };
  const isThisMonth = (ts: number) => {
    const d = new Date(ts);
    const t = new Date();
    return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };

  // Filtered history
  const filteredHistory = useMemo(() => {
    switch (historyPeriod) {
      case 'today': return history.filter(h => isToday(h.completedAt));
      case 'week': return history.filter(h => isThisWeek(h.completedAt));
      case 'month': return history.filter(h => isThisMonth(h.completedAt));
      case 'all': return history;
    }
  }, [history, historyPeriod]);

  // CRM Metrics
  const todayHistory = useMemo(() => history.filter(h => isToday(h.completedAt)), [history]);

  const totalCutsToday = todayHistory.length;
  const totalRevenueToday = todayHistory.reduce((sum, h) => sum + h.totalPrice, 0);
  const pendingRevenue = waitingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, sv) => s + sv.price, 0) + (e.dependents || []).reduce((s, d) => s + d.services.reduce((ds, sv) => ds + sv.price, 0), 0), 0
  ) + servingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, sv) => s + sv.price, 0) + (e.dependents || []).reduce((s, d) => s + d.services.reduce((ds, sv) => ds + sv.price, 0), 0), 0
  );
  const ticketMedioToday = totalCutsToday > 0 ? totalRevenueToday / totalCutsToday : 0;

  // Revenue per barber
  const revenuePerBarber = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; cuts: number; avgTicket: number }> = {};
    for (const b of barbers) {
      map[b.id] = { name: b.name, revenue: 0, cuts: 0, avgTicket: 0 };
    }
    for (const h of filteredHistory) {
      if (map[h.barberId]) {
        map[h.barberId].revenue += h.totalPrice;
        map[h.barberId].cuts += 1;
      }
    }
    for (const key of Object.keys(map)) {
      map[key].avgTicket = map[key].cuts > 0 ? map[key].revenue / map[key].cuts : 0;
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [barbers, filteredHistory]);

  // Service popularity
  const servicePop = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const h of filteredHistory) {
      for (const s of h.services) {
        if (!map[s.id]) map[s.id] = { name: s.name, count: 0, revenue: 0 };
        map[s.id].count += 1;
        map[s.id].revenue += s.price;
      }
      for (const dep of (h.dependents || [])) {
        for (const s of dep.services) {
          if (!map[s.id]) map[s.id] = { name: s.name, count: 0, revenue: 0 };
          map[s.id].count += 1;
          map[s.id].revenue += s.price;
        }
      }
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredHistory]);

  // Avg service time
  const avgServiceTime = useMemo(() => {
    if (filteredHistory.length === 0) return 0;
    const totalMins = filteredHistory.reduce((sum, h) => {
      return sum + (h.completedAt - h.joinedAt) / 60000;
    }, 0);
    return Math.round(totalMins / filteredHistory.length);
  }, [filteredHistory]);

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const getWaitingSince = (joinedAt: number) => {
    const minutes = Math.floor((now - joinedAt) / 60000);
    return minutes < 1 ? 'Agora' : `${minutes}min`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setIsLoggedIn(true); setLoginError(''); }
    else setLoginError('Senha incorreta');
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <form className="admin-login__card" onSubmit={handleLogin}>
          <Image src="/images/logo.png" alt="Del Rey" width={80} height={80} className="admin-login__logo" />
          <h1 className="admin-login__title">Painel CRM</h1>
          <p className="admin-login__subtitle">Barbearia Del Rey — Controle Total</p>
          {loginError && <p className="admin-login__error">{loginError}</p>}
          <div className="form-group">
            <input type="password" className="form-input" placeholder="Senha de acesso" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </div>
          <button type="submit" className="btn btn-gold btn-large">🔐 Entrar</button>
        </form>
      </div>
    );
  }

  const periodLabel = { today: 'Hoje', week: 'Esta Semana', month: 'Este Mês', all: 'Todo Período' };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header__left">
          <Image src="/images/logo.png" alt="Del Rey" width={48} height={48} className="admin-header__logo" />
          <div>
            <h1 className="admin-header__title">CRM — Barbearia Del Rey</h1>
            <p className="admin-header__subtitle">
              {config.isOpen ? '🟢 Aberta' : '🔴 Fechada'} • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setIsLoggedIn(false)}>🚪 Sair</button>
      </div>

      {/* Quick Toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="admin-toggle" style={{ marginBottom: 0 }}>
          <span className="admin-toggle__label">{config.isOpen ? '🟢 Barbearia' : '🔴 Barbearia'}</span>
          <div className={`toggle-switch ${config.isOpen ? 'active' : ''}`} onClick={toggleShopOpen} />
        </div>
        <div className="admin-toggle" style={{ marginBottom: 0 }}>
          <span className="admin-toggle__label">{config.isQueueOpen ? '🟢 Fila' : '🔴 Fila'}</span>
          <div className={`toggle-switch ${config.isQueueOpen ? 'active' : ''}`} onClick={toggleQueueOpen} />
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '1.25rem' }}>
        {[
          { key: 'dashboard' as const, label: '📊 Dashboard', badge: '' },
          { key: 'queue' as const, label: '📋 Fila', badge: `${waitingEntries.length + servingEntries.length}` },
          { key: 'barbers' as const, label: '✂️ Barbeiros', badge: '' },
          { key: 'services' as const, label: '🏷️ Serviços', badge: '' },
          { key: 'history' as const, label: '📦 Histórico', badge: `${todayHistory.length}` },
        ].map(tab => (
          <button key={tab.key} className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label} {tab.badge && <span style={{ background: 'var(--gold)', color: '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '0.65rem', fontWeight: 800, marginLeft: '4px' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ======== DASHBOARD TAB ======== */}
      {activeTab === 'dashboard' && (
        <>
          {/* Main KPIs */}
          <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{totalCutsToday}</div>
              <div className="admin-stat-card__label">Cortes Hoje</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value" style={{ fontSize: '1.5rem' }}>R$ {totalRevenueToday.toFixed(0)}</div>
              <div className="admin-stat-card__label">Faturamento Hoje</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value" style={{ fontSize: '1.5rem' }}>R$ {pendingRevenue.toFixed(0)}</div>
              <div className="admin-stat-card__label">Receita Pendente</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value" style={{ fontSize: '1.5rem' }}>R$ {ticketMedioToday.toFixed(0)}</div>
              <div className="admin-stat-card__label">Ticket Médio</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{waitingEntries.length}</div>
              <div className="admin-stat-card__label">Na Fila</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{servingEntries.length}</div>
              <div className="admin-stat-card__label">Atendendo</div>
            </div>
          </div>

          {/* Revenue per barber TODAY */}
          <h2 className="admin-section-title">💰 Faturamento por Barbeiro — Hoje</h2>
          <div className="admin-queue-list" style={{ marginBottom: '1.5rem' }}>
            {(() => {
              const todayPerBarber: Record<string, { name: string; revenue: number; cuts: number }> = {};
              for (const b of barbers) todayPerBarber[b.id] = { name: b.name, revenue: 0, cuts: 0 };
              for (const h of todayHistory) {
                if (todayPerBarber[h.barberId]) {
                  todayPerBarber[h.barberId].revenue += h.totalPrice;
                  todayPerBarber[h.barberId].cuts += 1;
                }
              }
              const sorted = Object.values(todayPerBarber).sort((a, b) => b.revenue - a.revenue);
              const maxRevenue = Math.max(...sorted.map(b => b.revenue), 1);
              return sorted.map((b, i) => (
                <div key={i} className="admin-queue-item" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{b.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{b.cuts} cortes</span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '1.1rem' }}>R$ {b.revenue.toFixed(2)}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(b.revenue / maxRevenue) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--amber))', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Being served now */}
          {servingEntries.length > 0 && (
            <>
              <h2 className="admin-section-title">✂️ Atendendo Agora</h2>
              <div className="admin-queue-list" style={{ marginBottom: '1.5rem' }}>
                {servingEntries.map(entry => {
                  const barber = barbers.find(b => b.id === entry.barberId);
                  return (
                    <div key={entry.id} className="admin-queue-item admin-queue-item--serving">
                      <div className="admin-queue-item__info">
                        <div className="admin-queue-item__name">{entry.clientName}</div>
                        <div className="admin-queue-item__details">
                          {entry.services.map(s => s.name).join(', ')} • {barber ? barber.name : '—'} • R$ {entry.services.reduce((s, sv) => s + sv.price, 0).toFixed(2)}
                        </div>
                      </div>
                      <button className="btn btn-amber btn-sm" onClick={() => finishClient(entry.id)}>✓ Finalizar</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Top services today */}
          <h2 className="admin-section-title">🔥 Serviços Mais Pedidos — Hoje</h2>
          <div className="section-card" style={{ opacity: 1, marginBottom: '1.5rem' }}>
            {(() => {
              const svcMap: Record<string, { name: string; count: number; revenue: number }> = {};
              for (const h of todayHistory) {
                for (const s of h.services) {
                  if (!svcMap[s.id]) svcMap[s.id] = { name: s.name, count: 0, revenue: 0 };
                  svcMap[s.id].count += 1;
                  svcMap[s.id].revenue += s.price;
                }
              }
              const sorted = Object.values(svcMap).sort((a, b) => b.count - a.count);
              if (sorted.length === 0) return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>Nenhum atendimento hoje ainda</p>;
              return sorted.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontWeight: 600 }}>{i + 1}. {s.name}</span>
                  <span style={{ color: 'var(--gold)' }}>{s.count}x — R$ {s.revenue.toFixed(2)}</span>
                </div>
              ));
            })()}
          </div>
        </>
      )}

      {/* ======== QUEUE TAB ======== */}
      {activeTab === 'queue' && (
        <>
          <h2 className="admin-section-title">📋 Fila de Espera ({waitingEntries.length})</h2>
          {waitingEntries.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', opacity: 1, marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>🕐 Ninguém na fila</p>
            </div>
          ) : (
            <div className="admin-queue-list" style={{ marginBottom: '1.5rem' }}>
              {waitingEntries.map(entry => {
                const entryTotal = entry.services.reduce((sum, s) => sum + s.price, 0) +
                  (entry.dependents || []).reduce((sum, d) => sum + d.services.reduce((s, sv) => s + sv.price, 0), 0);
                return (
                  <div key={entry.id} className="admin-queue-item">
                    <div className="admin-queue-item__info">
                      <div className="admin-queue-item__name">
                        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>#{entry.position}</span> {entry.clientName}
                        {entry.dependents && entry.dependents.length > 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--amber)' }}> (+{entry.dependents.length})</span>
                        )}
                      </div>
                      <div className="admin-queue-item__details">
                        🛠️ {entry.services.map(s => s.name).join(', ')} •
                        ✂️ {entry.barberName || 'Sem pref.'} •
                        💰 R$ {entryTotal.toFixed(2)} •
                        🕐 {getWaitingSince(entry.joinedAt)} •
                        📱 <a href={`https://wa.me/55${entry.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-text)' }}>{entry.whatsapp}</a>
                      </div>
                    </div>
                    <div className="admin-queue-item__actions" style={{ flexDirection: 'column', gap: '0.3rem' }}>
                      {availableBarbers.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {availableBarbers.map(b => (
                            <button key={b.id} className="btn btn-green btn-sm" onClick={() => callClient(entry.id, b.id)}>
                              📢 {b.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <button className="btn btn-red btn-sm" onClick={() => removeFromQueue(entry.id)}>🗑️ Remover</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {servingEntries.length > 0 && (
            <>
              <h2 className="admin-section-title">✂️ Sendo Atendidos ({servingEntries.length})</h2>
              <div className="admin-queue-list">
                {servingEntries.map(entry => {
                  const barber = barbers.find(b => b.id === entry.barberId);
                  return (
                    <div key={entry.id} className="admin-queue-item admin-queue-item--serving">
                      <div className="admin-queue-item__info">
                        <div className="admin-queue-item__name">{entry.clientName}</div>
                        <div className="admin-queue-item__details">
                          {entry.services.map(s => s.name).join(', ')} • {barber?.name} • R$ {entry.services.reduce((s, sv) => s + sv.price, 0).toFixed(2)}
                        </div>
                      </div>
                      <button className="btn btn-amber btn-sm" onClick={() => finishClient(entry.id)}>✓ Finalizar</button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ======== BARBERS TAB ======== */}
      {activeTab === 'barbers' && (
        <>
          <h2 className="admin-section-title">💈 Gerenciar Barbeiros</h2>
          <div className="admin-barbers-grid">
            {barbers.map(barber => {
              const serving = servingEntries.find(e => e.barberId === barber.id);
              const barberWaiting = waitingEntries.filter(e => e.barberId === barber.id);
              const barberToday = todayHistory.filter(h => h.barberId === barber.id);
              const barberRevenue = barberToday.reduce((s, h) => s + h.totalPrice, 0);
              return (
                <div key={barber.id} className="admin-barber-card">
                  <Image src={barber.avatar} alt={barber.name} width={56} height={56} className="admin-barber-card__avatar" />
                  <div className="admin-barber-card__name">{barber.name}</div>
                  <div className="admin-barber-card__status">
                    <span className="barber-card__status-dot" style={{
                      background: barber.status === 'available' ? 'var(--green)' : barber.status === 'busy' ? 'var(--gold)' : 'var(--text-muted)',
                      boxShadow: barber.status === 'available' ? '0 0 6px var(--green)' : barber.status === 'busy' ? '0 0 6px var(--gold)' : 'none',
                    }} />
                    {barber.status === 'available' && 'Livre'}
                    {barber.status === 'busy' && (serving ? `→ ${serving.clientName}` : 'Ocupado')}
                    {barber.status === 'break' && 'Em pausa'}
                    {barber.status === 'offline' && 'Indisponível'}
                  </div>

                  {/* Daily stats */}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', padding: '0.4rem', background: 'rgba(251,177,35,0.06)', borderRadius: '6px' }}>
                    📊 Hoje: {barberToday.length} cortes • R$ {barberRevenue.toFixed(0)}
                    {barberWaiting.length > 0 && <><br />⏳ {barberWaiting.length} aguardando</>}
                  </div>

                  {serving && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', padding: '0.4rem', background: 'rgba(251,177,35,0.08)', borderRadius: '6px' }}>
                      🛠️ {serving.services.map(s => s.name).join(', ')}<br />
                      💰 R$ {serving.services.reduce((s, sv) => s + sv.price, 0).toFixed(2)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {barber.status === 'available' && waitingEntries.length > 0 && (
                      <button className="btn btn-green btn-sm" onClick={() => callClient(waitingEntries[0].id, barber.id)}>📢 Chamar</button>
                    )}
                    {barber.status === 'busy' && serving && (
                      <button className="btn btn-amber btn-sm" onClick={() => finishClient(serving.id)}>✓ Finalizar</button>
                    )}
                    {barber.status !== 'break' && barber.status !== 'busy' && (
                      <button className="btn btn-outline btn-sm" onClick={() => setBarberStatus(barber.id, 'break')}>⏸️ Pausar</button>
                    )}
                    {barber.status === 'break' && (
                      <button className="btn btn-green btn-sm" onClick={() => setBarberStatus(barber.id, 'available')}>▶️ Retornar</button>
                    )}
                    {barber.status !== 'offline' && barber.status !== 'busy' && (
                      <button className="btn btn-red btn-sm" onClick={() => setBarberStatus(barber.id, 'offline')}>🚫 Desativar</button>
                    )}
                    {barber.status === 'offline' && (
                      <button className="btn btn-green btn-sm" onClick={() => setBarberStatus(barber.id, 'available')}>✅ Ativar</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ======== SERVICES TAB ======== */}
      {activeTab === 'services' && (
        <>
          <h2 className="admin-section-title">🏷️ Tabela de Preços</h2>
          <div className="section-card" style={{ opacity: 1, marginBottom: '1.5rem' }}>
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
                      {svc.description && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{svc.description}</div>}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.65rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{svc.duration} min</td>
                    <td style={{ textAlign: 'right', padding: '0.65rem 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gold)' }}>R$ {svc.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="admin-section-title">📍 Informações do Estabelecimento</h2>
          <div className="section-card" style={{ opacity: 1 }}>
            <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.875rem' }}>
              <div><strong style={{ color: 'var(--gold)' }}>Nome:</strong> {config.name}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Endereço:</strong> {config.address}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Telefone:</strong> {config.phone}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Horários:</strong> {config.workingDays}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Fila abre:</strong> {config.queueOpenTime} | <strong style={{ color: 'var(--gold)' }}>Barbearia abre:</strong> {config.shopOpenTime}</div>
              <div><strong style={{ color: 'var(--gold)' }}>Instagram:</strong> <a href={config.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-light)' }}>@delrey_barbearia</a></div>
            </div>
          </div>
        </>
      )}

      {/* ======== HISTORY TAB ======== */}
      {activeTab === 'history' && (
        <>
          {/* Period filter */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {(['today', 'week', 'month', 'all'] as const).map(p => (
              <button
                key={p}
                className={`btn btn-sm ${historyPeriod === p ? 'btn-gold' : 'btn-outline'}`}
                onClick={() => setHistoryPeriod(p)}
              >
                {periodLabel[p]}
              </button>
            ))}
          </div>

          {/* Period KPIs */}
          <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', marginBottom: '1.25rem' }}>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{filteredHistory.length}</div>
              <div className="admin-stat-card__label">Total Cortes</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value" style={{ fontSize: '1.4rem' }}>R$ {filteredHistory.reduce((s, h) => s + h.totalPrice, 0).toFixed(0)}</div>
              <div className="admin-stat-card__label">Faturamento</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value" style={{ fontSize: '1.4rem' }}>R$ {(filteredHistory.length > 0 ? filteredHistory.reduce((s, h) => s + h.totalPrice, 0) / filteredHistory.length : 0).toFixed(0)}</div>
              <div className="admin-stat-card__label">Ticket Médio</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-card__value">{avgServiceTime}min</div>
              <div className="admin-stat-card__label">Tempo Médio</div>
            </div>
          </div>

          {/* Revenue per barber for period */}
          <h2 className="admin-section-title">💰 Faturamento por Barbeiro — {periodLabel[historyPeriod]}</h2>
          <div className="admin-queue-list" style={{ marginBottom: '1.5rem' }}>
            {revenuePerBarber.map((b, i) => {
              const maxRev = Math.max(...revenuePerBarber.map(x => x.revenue), 1);
              return (
                <div key={i} className="admin-queue-item" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>{b.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{b.cuts} cortes • Ticket: R$ {b.avgTicket.toFixed(0)}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '1.1rem' }}>R$ {b.revenue.toFixed(2)}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(b.revenue / maxRev) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold), var(--amber))', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Service ranking */}
          {servicePop.length > 0 && (
            <>
              <h2 className="admin-section-title">🔥 Ranking de Serviços — {periodLabel[historyPeriod]}</h2>
              <div className="section-card" style={{ opacity: 1, marginBottom: '1.5rem' }}>
                {servicePop.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontWeight: 600 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {s.name}</span>
                    <span style={{ color: 'var(--gold)' }}>{s.count}x — R$ {s.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* History list */}
          <h2 className="admin-section-title">📜 Atendimentos — {periodLabel[historyPeriod]} ({filteredHistory.length})</h2>
          {filteredHistory.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', opacity: 1 }}>
              <p style={{ color: 'var(--text-muted)', padding: '1.5rem 0' }}>Nenhum atendimento neste período</p>
            </div>
          ) : (
            <div className="admin-queue-list">
              {filteredHistory.slice(0, 50).map(h => (
                <div key={h.id} className="admin-queue-item" style={{ opacity: 0.85 }}>
                  <div className="admin-queue-item__info">
                    <div className="admin-queue-item__name">{h.clientName}</div>
                    <div className="admin-queue-item__details">
                      {h.services.map(s => s.name).join(', ')} •
                      ✂️ {h.barberName} •
                      {formatDate(h.completedAt)} às {formatTime(h.completedAt)} •
                      📱 {h.whatsapp}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--gold)', whiteSpace: 'nowrap' }}>R$ {h.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              {filteredHistory.length > 50 && (
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Mostrando 50 de {filteredHistory.length} atendimentos
                </p>
              )}
            </div>
          )}

          {/* Clear history */}
          {history.length > 0 && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                className="btn btn-red btn-sm"
                onClick={() => { if (confirm('Tem certeza que deseja limpar TODO o histórico? Esta ação não pode ser desfeita.')) clearHistory(); }}
              >
                🗑️ Limpar Histórico Completo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
