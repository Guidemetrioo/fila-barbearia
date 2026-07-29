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
    loadDemoData,
    clearQueue,
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

  // Today's history
  const todayHistory = useMemo(() => history.filter(h => isToday(h.completedAt)), [history]);

  // CRM Metrics Today
  const totalCutsToday = todayHistory.length;
  const totalRevenueToday = todayHistory.reduce((sum, h) => sum + h.totalPrice, 0);
  const pendingRevenue = waitingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, sv) => s + sv.price, 0) + (e.dependents || []).reduce((s, d) => s + d.services.reduce((ds, sv) => ds + sv.price, 0), 0), 0
  ) + servingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, sv) => s + sv.price, 0) + (e.dependents || []).reduce((s, d) => s + d.services.reduce((ds, sv) => ds + sv.price, 0), 0), 0
  );

  // Revenue per barber for today
  const todayRevenuePerBarber = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; cuts: number }> = {};
    for (const b of barbers) {
      map[b.id] = { name: b.name, revenue: 0, cuts: 0 };
    }
    for (const h of todayHistory) {
      if (map[h.barberId]) {
        map[h.barberId].revenue += h.totalPrice;
        map[h.barberId].cuts += 1;
      }
    }
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [barbers, todayHistory]);

  // Service popularity today
  const todayServicesPop = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const h of todayHistory) {
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
  }, [todayHistory]);

  // Time formatters
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
      <div className="admin-login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
        <form className="admin-login__card" onSubmit={handleLogin} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-2xl)', padding: '2rem', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: 'var(--shadow-modal)' }}>
          <Image src="/images/logo.png" alt="Del Rey" width={80} height={80} style={{ borderRadius: '50%', border: '2px solid var(--gold)', margin: '0 auto 1rem auto' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '0.25rem' }}>Painel CRM</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Barbearia Del Rey — Controle Total</p>
          {loginError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{loginError}</p>}
          <div className="form-group">
            <input type="password" className="form-input" placeholder="Senha de acesso" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
          </div>
          <button type="submit" className="btn btn-gold btn-large">🔐 Entrar</button>
        </form>
      </div>
    );
  }

  const periodLabel = { today: 'Hoje', week: 'Esta Semana', month: 'Este Mês', all: 'Todo Período' };
  const maxTodayRevenue = Math.max(...todayRevenuePerBarber.map(b => b.revenue), 1);

  return (
    <div className="admin-container">
      {/* ROW 1: HEADER CARD */}
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Image src="/images/logo.png" alt="Del Rey" width={46} height={46} style={{ borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              CRM — Barbearia Del Rey
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.isOpen ? '#10B981' : '#EF4444', display: 'inline-block' }} />
              {config.isOpen ? 'Aberta' : 'Fechada'} • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setIsLoggedIn(false)} style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700 }}>
          🚪 Sair
        </button>
      </div>

      {/* ROW 2: CONTROL SWITCHES CARD */}
      <div className="section-card" style={{ padding: '1.1rem 1.25rem', marginBottom: '0.85rem' }}>
        {/* iOS Style Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: config.isOpen ? '#10B981' : '#EF4444' }} />
              Barbearia
            </span>
            <div className={`toggle-switch ${config.isOpen ? 'active' : ''}`} onClick={toggleShopOpen} />
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: config.isQueueOpen ? '#10B981' : '#EF4444' }} />
              Fila
            </span>
            <div className={`toggle-switch ${config.isQueueOpen ? 'active' : ''}`} onClick={toggleQueueOpen} />
          </div>
        </div>

        {/* Demo Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className="btn btn-gold btn-sm" onClick={loadDemoData} style={{ justifyContent: 'center', padding: '0.65rem', fontWeight: 700 }}>
            ⚡ Carregar Dados de Demonstração
          </button>
          <button className="btn btn-outline btn-sm" onClick={clearQueue} style={{ justifyContent: 'center', padding: '0.65rem', fontWeight: 700 }}>
            🧹 Limpar Fila
          </button>
        </div>
      </div>

      {/* ROW 3: NAVIGATION TABS BAR */}
      <div className="nav-tabs" style={{ marginBottom: '1.25rem' }}>
        {[
          { key: 'dashboard' as const, label: '📊 Dashboard', badge: '' },
          { key: 'queue' as const, label: '📋 Fila', badge: `${waitingEntries.length + servingEntries.length}` },
          { key: 'barbers' as const, label: '✂️ Barbeiros', badge: '' },
          { key: 'services' as const, label: '🏷️ Serviços', badge: '' },
          { key: 'history' as const, label: '📦 Histórico', badge: `${todayHistory.length}` },
        ].map(tab => (
          <button key={tab.key} className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label} {tab.badge && <span className="tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ROW 4: DASHBOARD TAB CONTENT */}
      {activeTab === 'dashboard' && (
        <>
          {/* KPI Metrics Cards Grid (Ticket Médio Removed) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="section-card" style={{ padding: '1rem 0.85rem', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>{totalCutsToday}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                CORTES HOJE
              </div>
            </div>

            <div className="section-card" style={{ padding: '1rem 0.85rem', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                R$ {totalRevenueToday.toFixed(0)}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                FATURAMENTO HOJE
              </div>
            </div>

            <div className="section-card" style={{ padding: '1rem 0.85rem', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                R$ {pendingRevenue.toFixed(0)}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                RECEITA PENDENTE
              </div>
            </div>

            <div className="section-card" style={{ padding: '1rem 0.85rem', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>{waitingEntries.length}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                NA FILA
              </div>
            </div>

            <div className="section-card" style={{ padding: '1rem 0.85rem', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>{servingEntries.length}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                ATENDENDO
              </div>
            </div>
          </div>

          {/* SECTION 1: Faturamento por Barbeiro — Hoje */}
          <div className="section-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💰 Faturamento por Barbeiro — Hoje
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {todayRevenuePerBarber.map((b, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F8FAFC', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {b.name}
                      </span>
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                        {b.cuts} cortes
                      </span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '1.15rem' }}>
                      R$ {b.revenue.toFixed(2)}
                    </span>
                  </div>
                  {/* Gold Progress Bar */}
                  <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(b.revenue / maxTodayRevenue) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Serviços Mais Pedidos — Hoje */}
          <div className="section-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔥 Serviços Mais Pedidos — Hoje
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todayServicesPop.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '1rem 0' }}>
                  Nenhum atendimento realizado hoje ainda
                </p>
              ) : (
                todayServicesPop.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F8FAFC', textTransform: 'uppercase' }}>
                      {i + 1}. {s.name}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--gold)', fontSize: '0.95rem' }}>
                      {s.count}x — R$ {s.revenue.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ======== QUEUE TAB ======== */}
      {activeTab === 'queue' && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem' }}>
            📋 Fila de Espera ({waitingEntries.length})
          </h2>
          {waitingEntries.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Ninguém aguardando na fila</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
              {waitingEntries.map(entry => {
                const entryTotal = entry.services.reduce((sum, s) => sum + s.price, 0) +
                  (entry.dependents || []).reduce((sum, d) => sum + d.services.reduce((s, sv) => s + sv.price, 0), 0);
                return (
                  <div key={entry.id} className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', margin: 0 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>
                        <span style={{ color: 'var(--gold)', marginRight: '0.4rem' }}>#{entry.position}</span>
                        {entry.clientName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {entry.services.map(s => s.name).join(', ')} • R$ {entryTotal.toFixed(2)} • 🕐 {getWaitingSince(entry.joinedAt)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {availableBarbers.map(b => (
                        <button key={b.id} className="btn btn-gold btn-sm" onClick={() => callClient(entry.id, b.id)}>
                          Chamar ({b.name})
                        </button>
                      ))}
                      <button className="btn btn-outline btn-sm" onClick={() => removeFromQueue(entry.id)} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                        Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {servingEntries.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem' }}>
                ✂️ Sendo Atendidos ({servingEntries.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {servingEntries.map(entry => {
                  const barber = barbers.find(b => b.id === entry.barberId);
                  return (
                    <div key={entry.id} className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', margin: 0, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#FFF' }}>{entry.clientName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {entry.services.map(s => s.name).join(', ')} • Barbeiro: {barber?.name || '—'}
                        </div>
                      </div>
                      <button className="btn btn-gold btn-sm" onClick={() => finishClient(entry.id)}>
                        Finalizar
                      </button>
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem' }}>
            💈 Equipe de Barbeiros
          </h2>
          <div className="barbers-grid">
            {barbers.map(barber => (
              <div key={barber.id} className="section-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.25rem', margin: 0 }}>
                <Image src={barber.avatar} alt={barber.name} width={64} height={64} style={{ borderRadius: '50%', border: '2px solid var(--gold)', marginBottom: '0.5rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', marginBottom: '0.25rem' }}>{barber.name}</h3>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '12px', background: barber.status === 'available' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: barber.status === 'available' ? '#34D399' : '#FBBF24', marginBottom: '0.75rem' }}>
                  {barber.status === 'available' ? 'Livre' : barber.status === 'busy' ? 'Atendendo' : 'Em pausa'}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                  {barber.status !== 'break' && (
                    <button className="btn btn-outline btn-sm" onClick={() => setBarberStatus(barber.id, 'break')} style={{ flex: 1, justifyContent: 'center' }}>
                      Pausar
                    </button>
                  )}
                  {barber.status === 'break' && (
                    <button className="btn btn-gold btn-sm" onClick={() => setBarberStatus(barber.id, 'available')} style={{ flex: 1, justifyContent: 'center' }}>
                      Retornar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ======== SERVICES TAB ======== */}
      {activeTab === 'services' && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem' }}>
            🏷️ Tabela de Serviços e Preços
          </h2>
          <div className="section-card" style={{ padding: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.5rem 0', color: 'var(--gold)', fontSize: '0.85rem' }}>Serviço</th>
                  <th style={{ padding: '0.5rem 0', color: 'var(--gold)', fontSize: '0.85rem', textAlign: 'right' }}>Preço</th>
                </tr>
              </thead>
              <tbody>
                {services.map(svc => (
                  <tr key={svc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.75rem 0', fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>{svc.name}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 800, color: 'var(--gold)' }}>R$ {svc.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ======== HISTORY TAB ======== */}
      {activeTab === 'history' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', margin: 0 }}>
              📦 Histórico de Atendimentos ({todayHistory.length})
            </h2>
            {history.length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={clearHistory} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                Limpar
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayHistory.length === 0 ? (
              <div className="section-card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Nenhum atendimento no histórico de hoje</p>
              </div>
            ) : (
              todayHistory.map(h => (
                <div key={h.id} className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.1rem', margin: 0 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>{h.clientName}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      {h.services.map(s => s.name).join(', ')} • {h.barberName}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--gold)' }}>R$ {h.totalPrice.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
