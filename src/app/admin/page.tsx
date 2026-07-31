'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';
import { Service, Barber } from '@/types';

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
    updateService,
  } = useQueue();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'queue' | 'services' | 'history'>('dashboard');
  const [historyPeriod, setHistoryPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [now, setNow] = useState(Date.now());

  // Service Editor Modal State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editDuration, setEditDuration] = useState<string>('');

  // Pause Duration Modal State
  const [pausingBarber, setPausingBarber] = useState<Barber | null>(null);
  const [pauseMinutesInput, setPauseMinutesInput] = useState<string>('30');

  const handleOpenPauseModal = (barber: Barber) => {
    setPausingBarber(barber);
    setPauseMinutesInput('30');
  };

  const handleConfirmPause = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pausingBarber) return;
    const mins = parseInt(pauseMinutesInput, 10);
    const validMins = isNaN(mins) || mins <= 0 ? 30 : mins;
    setBarberStatus(pausingBarber.id, 'break', validMins);
    setPausingBarber(null);
  };

  const handleOpenEditService = (svc: Service) => {
    setEditingService(svc);
    setEditPrice(svc.price.toString());
    setEditDuration(svc.duration.toString());
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    const priceNum = parseFloat(editPrice.replace(',', '.'));
    const durationNum = parseInt(editDuration, 10);
    if (isNaN(priceNum) || priceNum <= 0) return;
    if (isNaN(durationNum) || durationNum <= 0) return;

    updateService(editingService.id, priceNum, durationNum);
    setEditingService(null);
  };

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
  const monthHistory = useMemo(() => history.filter(h => isThisMonth(h.completedAt)), [history]);

  // CRM Metrics Today / Month
  const totalCutsToday = todayHistory.length;
  const totalRevenueToday = todayHistory.reduce((sum, h) => sum + h.totalPrice, 0);
  const totalCutsMonth = monthHistory.length;
  const totalRevenueMonth = monthHistory.reduce((sum, h) => sum + h.totalPrice, 0);

  const pendingRevenue = waitingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, sv) => s + sv.price, 0) + (e.dependents || []).reduce((s, d) => s + d.services.reduce((ds, sv) => ds + sv.price, 0), 0), 0
  ) + servingEntries.reduce(
    (sum, e) => sum + e.services.reduce((s, sv) => s + sv.price, 0) + (e.dependents || []).reduce((s, d) => s + d.services.reduce((ds, sv) => ds + sv.price, 0), 0), 0
  );

  const [revenuePeriod, setRevenuePeriod] = useState<'today' | 'month'>('today');

  const displayCuts = revenuePeriod === 'today' ? totalCutsToday : totalCutsMonth;
  const displayCutsLabel = revenuePeriod === 'today' ? 'CORTES HOJE' : 'CORTES MÊS';
  const displayRevenue = revenuePeriod === 'today' ? totalRevenueToday : totalRevenueMonth;
  const displayRevenueLabel = revenuePeriod === 'today' ? 'FATURAMENTO HOJE' : 'FATURAMENTO MÊS';

  // Revenue stats per barber (Today or Monthly)
  const barberStatsMap = useMemo(() => {
    const map: Record<string, { revenue: number; cuts: number }> = {};
    for (const b of barbers) {
      map[b.id] = { revenue: 0, cuts: 0 };
    }
    const targetHistory = revenuePeriod === 'today'
      ? history.filter(h => isToday(h.completedAt))
      : history.filter(h => isThisMonth(h.completedAt));

    for (const h of targetHistory) {
      if (map[h.barberId]) {
        map[h.barberId].revenue += h.totalPrice;
        map[h.barberId].cuts += 1;
      }
    }
    return map;
  }, [barbers, history, revenuePeriod]);

  const maxRevenue = useMemo(() => {
    const revenues = Object.values(barberStatsMap).map(s => s.revenue);
    return Math.max(...revenues, 1);
  }, [barberStatsMap]);

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

  return (
    <div className="admin-container">
      {/* ROW 1: HEADER CARD */}
      <div className="section-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Image src="/images/logo.png" alt="Del Rey" width={46} height={46} style={{ borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Barbearia Del Rey – Administrador
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.isOpen ? '#10B981' : '#EF4444', display: 'inline-block' }} />
              {config.isOpen ? 'Aberta' : 'Fechada'} • {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link className="btn btn-gold btn-sm" href="/editor" style={{ textDecoration: 'none', padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            🎨 Editor de Layout
          </Link>
          <button className="btn btn-outline btn-sm" onClick={() => setIsLoggedIn(false)} style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', fontWeight: 700, gap: '0.4rem' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
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
          <button className="btn btn-gold btn-sm" onClick={loadDemoData} style={{ justifyContent: 'center', padding: '0.65rem', fontWeight: 700, gap: '0.4rem' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Carregar Dados de Demonstração
          </button>
          <button className="btn btn-outline btn-sm" onClick={clearQueue} style={{ justifyContent: 'center', padding: '0.65rem', fontWeight: 700, gap: '0.4rem' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Limpar Fila
          </button>
        </div>
      </div>

      {/* ROW 3: NAVIGATION TABS BAR (With SVG Icons) */}
      <div className="nav-tabs" style={{ marginBottom: '1.25rem' }}>
        {[
          {
            key: 'dashboard' as const,
            label: 'Dashboard',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
            ),
            badge: '',
          },
          {
            key: 'queue' as const,
            label: 'Fila',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
            ),
            badge: `${waitingEntries.length + servingEntries.length}`,
          },
          {
            key: 'services' as const,
            label: 'Serviços',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            ),
            badge: '',
          },
          {
            key: 'history' as const,
            label: 'Histórico',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ),
            badge: `${todayHistory.length}`,
          },
        ].map(tab => (
          <button key={tab.key} className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
            {tab.icon}
            {tab.label} {tab.badge && <span className="tab-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ROW 4: DASHBOARD TAB CONTENT */}
      {activeTab === 'dashboard' && (
        <>
          {/* TOP TOGGLE: HOJE / MENSAL ABOVE KPI CARDS (Matching user reference mockup image!) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <div style={{
              display: 'inline-flex',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}>
              <button
                className={`btn btn-sm ${revenuePeriod === 'today' ? 'btn-gold' : 'btn-outline'}`}
                onClick={() => setRevenuePeriod('today')}
                style={{ padding: '0.35rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '7px' }}
              >
                Hoje
              </button>
              <button
                className={`btn btn-sm ${revenuePeriod === 'month' ? 'btn-gold' : 'btn-outline'}`}
                onClick={() => setRevenuePeriod('month')}
                style={{ padding: '0.35rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '7px' }}
              >
                Mensal
              </button>
            </div>
          </div>

          {/* KPI Metrics Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="section-card" style={{ padding: '1rem 0.85rem', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gold)' }}>{displayCuts}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                {displayCutsLabel}
              </div>
            </div>

            <div className="section-card" style={{ padding: '1rem 0.85rem', textAlign: 'center', margin: 0 }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold)', whiteSpace: 'nowrap' }}>
                R$ {displayRevenue.toFixed(0)}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                {displayRevenueLabel}
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

          {/* SECTION 1: Faturamento por Barbeiro — Hoje / Mensal (Unificado com Equipe de Barbeiros) */}
          <div className="section-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Faturamento por Barbeiro — {revenuePeriod === 'today' ? 'Hoje' : 'Mensal'}
              </h2>
              <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <button
                  className={`btn btn-sm ${revenuePeriod === 'today' ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => setRevenuePeriod('today')}
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.775rem', borderRadius: '6px' }}
                >
                  Hoje
                </button>
                <button
                  className={`btn btn-sm ${revenuePeriod === 'month' ? 'btn-gold' : 'btn-outline'}`}
                  onClick={() => setRevenuePeriod('month')}
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.775rem', borderRadius: '6px' }}
                >
                  Mensal
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {barbers.map(barber => {
                const stats = barberStatsMap[barber.id] || { revenue: 0, cuts: 0 };
                const percent = (stats.revenue / maxRevenue) * 100;
                const remainingBreak = barber.status === 'break' && barber.breakUntil
                  ? Math.max(0, Math.ceil((barber.breakUntil - now) / 60000))
                  : 0;

                return (
                  <div
                    key={barber.id}
                    style={{
                      background: 'rgba(10, 24, 17, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      padding: '1.25rem 1rem 1rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
                      <Image
                        src={barber.avatar}
                        alt={barber.name}
                        width={72}
                        height={72}
                        style={{ borderRadius: '50%', border: '2px solid var(--gold)', objectFit: 'cover' }}
                      />
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F8FAFC', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      {barber.name}
                    </h3>

                    <div style={{
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.75rem',
                      borderRadius: '12px',
                      background: barber.status === 'available' ? 'rgba(16, 185, 129, 0.15)' : barber.status === 'busy' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: barber.status === 'available' ? '#34D399' : barber.status === 'busy' ? '#F87171' : '#FBBF24',
                      border: `1px solid ${barber.status === 'available' ? 'rgba(16, 185, 129, 0.3)' : barber.status === 'busy' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      marginBottom: '0.85rem',
                    }}>
                      {barber.status === 'available'
                        ? 'Livre'
                        : barber.status === 'busy'
                        ? 'Atendendo'
                        : `Em pausa ${remainingBreak > 0 ? `(${remainingBreak} min)` : ''}`}
                    </div>

                    <div style={{ width: '100%', marginBottom: '1.1rem' }}>
                      {barber.status !== 'break' ? (
                        <button
                          className="btn btn-outline"
                          onClick={() => handleOpenPauseModal(barber)}
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            padding: '0.55rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            color: '#F8FAFC',
                          }}
                        >
                          Pausar
                        </button>
                      ) : (
                        <button
                          className="btn btn-gold"
                          onClick={() => setBarberStatus(barber.id, 'available')}
                          style={{
                            width: '100%',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            padding: '0.55rem',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                          }}
                        >
                          Retornar
                        </button>
                      )}
                    </div>

                    {/* Barber Revenue Stats Footer */}
                    <div style={{ width: '100%', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                          {barber.name} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{stats.cuts} cortes</span>
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gold)' }}>
                          R$ {stats.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #D4AF37 0%, #F59E0B 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Serviços Mais Pedidos — Hoje */}
          <div className="section-card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
              </svg>
              Serviços Mais Pedidos — Hoje
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
            Fila de Espera ({waitingEntries.length})
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
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <line x1="20" y1="4" x2="8.12" y2="15.88" />
                  <line x1="14.47" y1="14.48" x2="20" y2="20" />
                  <line x1="8.12" y1="8.12" x2="12" y2="12" />
                </svg>
                Sendo Atendidos ({servingEntries.length})
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



      {/* ======== SERVICES TAB ======== */}
      {activeTab === 'services' && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Tabela de Serviços e Preços
          </h2>
          <div className="section-card" style={{ padding: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.65rem 0', color: 'var(--gold)', fontSize: '0.85rem' }}>Serviço</th>
                  <th style={{ padding: '0.65rem 0', color: 'var(--gold)', fontSize: '0.85rem', textAlign: 'center' }}>Duração</th>
                  <th style={{ padding: '0.65rem 0', color: 'var(--gold)', fontSize: '0.85rem', textAlign: 'right' }}>Preço</th>
                  <th style={{ padding: '0.65rem 0', color: 'var(--gold)', fontSize: '0.85rem', textAlign: 'right' }}>Editar</th>
                </tr>
              </thead>
              <tbody>
                {services.map(svc => (
                  <tr key={svc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 0', fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>
                      <div>{svc.name}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0', textAlign: 'center', fontSize: '0.85rem', color: '#CBD5E1', fontWeight: 600 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {svc.duration} min
                    </td>
                    <td style={{ padding: '0.85rem 0', textAlign: 'right', fontWeight: 800, color: 'var(--gold)', fontSize: '0.95rem' }}>
                      R$ {svc.price.toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '0.85rem 0', textAlign: 'right' }}>
                      <button
                        className="btn btn-gold btn-sm"
                        onClick={() => handleOpenEditService(svc)}
                        style={{ padding: '0.35rem 0.65rem', gap: '0.35rem', fontSize: '0.8rem' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                      </button>
                    </td>
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
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Histórico de Atendimentos ({todayHistory.length})
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

      {/* ======== INTUITIVE SERVICE EDITOR MODAL ======== */}
      {editingService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#071710',
            border: '1px solid var(--gold)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Editar Serviço — {editingService.name}
              </h3>
              <button
                onClick={() => setEditingService(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveService} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem' }}>
                  Preço do Serviço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem' }}>
                  Duração Estimada (minutos)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={editDuration}
                  onChange={e => setEditDuration(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== PAUSE DURATION MODAL ======== */}
      {pausingBarber && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#071710',
            border: '1px solid var(--gold)',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Tempo de Pausa — {pausingBarber.name}
              </h3>
              <button
                onClick={() => setPausingBarber(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.25rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPause}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.6rem' }}>
                  Defina o tempo que ficará fora (em minutos):
                </label>

                {/* Quick selector pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {['15', '30', '45', '60'].map(mins => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setPauseMinutesInput(mins)}
                      style={{
                        padding: '0.45rem',
                        borderRadius: '8px',
                        border: pauseMinutesInput === mins ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                        background: pauseMinutesInput === mins ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                        color: pauseMinutesInput === mins ? 'var(--gold)' : '#F8FAFC',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={pauseMinutesInput}
                    onChange={e => setPauseMinutesInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                    required
                  />
                  <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', fontWeight: 700, fontSize: '0.85rem' }}>
                    minutos
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPausingBarber(null)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#94A3B8',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Confirmar Pausa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
