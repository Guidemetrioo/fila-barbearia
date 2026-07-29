'use client';

import { useState, useMemo } from 'react';
import { useQueue } from '@/context/QueueContext';
import { Service, Dependent } from '@/types';

interface JoinQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinQueueModal({ isOpen, onClose }: JoinQueueModalProps) {
  const { services, barbers, addToQueue, config, getBarberWaitTime } = useQueue();
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [depName, setDepName] = useState('');
  const [depServices, setDepServices] = useState<Service[]>([]);
  const [showAddDep, setShowAddDep] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [entryMode, setEntryMode] = useState<'queue' | 'scheduled'>('queue');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Generate next 7 days for day selector (must be before early return for Rules of Hooks)
  const nextDays = useMemo(() => {
    const days: { date: string; label: string; weekday: string }[] = [];
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      days.push({
        date: dateStr,
        label: `${day}/${month}`,
        weekday: weekdays[d.getDay()],
      });
    }
    return days;
  }, []);

  // Available time slots (9:00 to 20:00)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00',
  ];

  if (!isOpen) return null;

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers ? `(${numbers}` : '';
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(formatPhone(e.target.value));
  };

  const toggleService = (service: Service) => {
    setSelectedServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const toggleDepService = (service: Service) => {
    setDepServices(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleAddDependent = () => {
    if (!depName.trim()) {
      setError('Digite o nome do dependente.');
      return;
    }
    if (depServices.length === 0) {
      setError('Selecione ao menos 1 serviço para o dependente.');
      return;
    }
    const newDep: Dependent = {
      id: `dep-${Date.now()}`,
      name: depName.trim(),
      services: depServices,
    };
    setDependents(prev => [...prev, newDep]);
    setDepName('');
    setDepServices([]);
    setShowAddDep(false);
    setError('');
  };

  const removeDependent = (id: string) => {
    setDependents(prev => prev.filter(d => d.id !== id));
  };

  // Step flow:
  // Queue: 1(dados) -> 2(barbeiro) -> 3(serviços) -> 4(confirmação)
  // Scheduled: 1(dados) -> 2(reservar horário) -> 3(barbeiro) -> 4(serviços) -> 5(confirmação)
  const totalSteps = entryMode === 'scheduled' ? 5 : 4;

  const getStepTitle = () => {
    if (entryMode === 'queue') {
      switch (step) {
        case 1: return '1. Seus dados';
        case 2: return '2. Escolha o Profissional';
        case 3: return '3. Selecione os Serviços';
        case 4: return '4. Confirmação & Dependentes';
      }
    } else {
      switch (step) {
        case 1: return '1. Seus dados';
        case 2: return 'RESERVE SEU HORÁRIO';
        case 3: return '3. Escolha o Profissional';
        case 4: return '4. Selecione os Serviços';
        case 5: return '5. Confirmação & Dependentes';
      }
    }
  };

  const handleStep1 = () => {
    if (!name.trim()) {
      setError('Por favor, digite seu nome.');
      return;
    }
    if (whatsapp.replace(/\D/g, '').length < 10) {
      setError('Por favor, digite um WhatsApp válido.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleScheduleStep = () => {
    if (!scheduledTime) {
      setError('Selecione um horário.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleBarberStep = () => {
    setError('');
    setStep(entryMode === 'scheduled' ? 4 : 3);
  };

  const handleServicesStep = () => {
    if (selectedServices.length === 0) {
      setError('Selecione pelo menos um serviço para você.');
      return;
    }
    setError('');
    setStep(entryMode === 'scheduled' ? 5 : 4);
  };

  const handleSubmit = () => {
    setError('');
    if (entryMode === 'scheduled' && !scheduledTime) {
      setError('Selecione o horário do agendamento.');
      return;
    }
    addToQueue(
      name.trim(),
      whatsapp,
      selectedServices,
      selectedBarberId === 'any' ? undefined : selectedBarberId,
      dependents,
      entryMode === 'scheduled' ? scheduledTime : undefined,
      entryMode === 'scheduled' ? scheduledDate : undefined
    );
    setSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 2200);
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setWhatsapp('');
    setSelectedBarberId('any');
    setSelectedServices([]);
    setDependents([]);
    setDepName('');
    setDepServices([]);
    setShowAddDep(false);
    setError('');
    setSuccess(false);
    setEntryMode('queue');
    setScheduledTime('');
    onClose();
  };

  const mainPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const depsPrice = dependents.reduce(
    (sum, d) => sum + d.services.reduce((dSum, s) => dSum + s.price, 0),
    0
  );
  const totalPrice = mainPrice + depsPrice;

  const mainDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const depsDuration = dependents.reduce(
    (sum, d) => sum + d.services.reduce((dSum, s) => dSum + s.duration, 0),
    0
  );
  const totalDuration = mainDuration + depsDuration;

  // Which step is the barber step / services step / confirm step
  const barberStep = entryMode === 'scheduled' ? 3 : 2;
  const servicesStep = entryMode === 'scheduled' ? 4 : 3;
  const confirmStep = entryMode === 'scheduled' ? 5 : 4;

  if (success) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content modal-content--center" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{entryMode === 'scheduled' ? '📅' : '🎉'}</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gold)' }}>
              {entryMode === 'scheduled'
                ? `Horário agendado para ${scheduledTime}!`
                : 'Sua vaga na fila foi garantida!'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {entryMode === 'scheduled'
                ? 'Você está na fila para o horário marcado. Acompanhe pelo painel.'
                : 'Acompanhe sua posição no painel principal ou pela aba "Minha Conta".'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h3 className="modal__title">{getStepTitle()}</h3>
            <p className="modal__subtitle">
              {step === 2 && entryMode === 'scheduled'
                ? `Etapa ${step} de ${totalSteps}`
                : `${config.name} • ${entryMode === 'scheduled' ? 'Agendamento com Horário' : 'Atendimento por Ordem de Chegada'}`}
            </p>
          </div>
          <button className="modal__close" onClick={handleClose}>✕</button>
        </div>

        {/* Step indicator dots for scheduled mode */}
        {entryMode === 'scheduled' && step === 2 && (
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i < step ? '20px' : '8px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i < step ? 'var(--gold)' : 'var(--border-primary)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            style={{
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              padding: '0.6rem 0.85rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ========= STEP 1: Dados + Modo ========= */}
        {step === 1 && (
          <>
            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                className={`btn ${entryMode === 'queue' ? 'btn-gold' : 'btn-outline'}`}
                onClick={() => setEntryMode('queue')}
                style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}
              >
                ⚡ Entrar na Fila
              </button>
              <button
                className={`btn ${entryMode === 'scheduled' ? 'btn-gold' : 'btn-outline'}`}
                onClick={() => setEntryMode('scheduled')}
                style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}
              >
                📅 Marcar Horário
              </button>
            </div>

            {entryMode === 'queue' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(34,197,94,0.06)', borderRadius: '0.5rem', border: '1px solid rgba(34,197,94,0.15)' }}>
                ⚡ Você entrará na fila e será atendido assim que o barbeiro estiver disponível.
              </p>
            )}

            {entryMode === 'scheduled' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(251,177,35,0.06)', borderRadius: '0.5rem', border: '1px solid rgba(251,177,35,0.15)' }}>
                📅 Escolha a data e horário na próxima etapa. Você ficará na fila no horário marcado.
              </p>
            )}

            <div className="form-group">
              <label className="form-label">
                Seu Nome Completo <span>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: João Silva"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                WhatsApp com DDD <span>*</span>
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="(11) 98765-4321"
                value={whatsapp}
                onChange={handlePhoneChange}
                maxLength={16}
              />
            </div>

            <button className="btn btn-gold btn-large" onClick={handleStep1}>
              Avançar →
            </button>
          </>
        )}

        {/* ========= STEP 2 (Scheduled only): RESERVE SEU HORÁRIO ========= */}
        {step === 2 && entryMode === 'scheduled' && (
          <>
            {/* Day selector */}
            <div className="schedule-section">
              <label className="schedule-label">SELECIONE O DIA</label>
              <div className="schedule-days">
                {nextDays.map(day => (
                  <button
                    key={day.date}
                    className={`schedule-day-chip ${scheduledDate === day.date ? 'active' : ''}`}
                    onClick={() => setScheduledDate(day.date)}
                  >
                    {day.weekday} {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual date input */}
            <div className="schedule-section">
              <label className="schedule-label">OU DIGITE OUTRA DATA (DD/MM/AAAA)</label>
              <input
                type="date"
                className="form-input"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time slots grid */}
            <div className="schedule-section">
              <label className="schedule-label">HORÁRIOS DISPONÍVEIS</label>
              <div className="schedule-time-grid">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    className={`schedule-time-slot ${scheduledTime === time ? 'active' : ''}`}
                    onClick={() => setScheduledTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                Voltar
              </button>
              <button className="btn btn-gold" onClick={handleScheduleStep} style={{ flex: 1, justifyContent: 'center', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                Próximo &gt;
              </button>
            </div>
          </>
        )}

        {/* ========= BARBER STEP ========= */}
        {step === barberStep && !(step === 2 && entryMode === 'scheduled') && (
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Selecione com qual barbeiro deseja cortar ou escolha &quot;Sem preferência&quot;.
            </p>
            <div className="barber-selection-grid">
              <div
                className={`barber-option-card ${selectedBarberId === 'any' ? 'selected' : ''}`}
                onClick={() => setSelectedBarberId('any')}
              >
                <div className="barber-option-card__info">
                  <div className="barber-option-card__avatar-placeholder">✂️</div>
                  <div>
                    <div className="barber-option-card__name">Sem preferência</div>
                    <div className="barber-option-card__sub">Qualquer barbeiro disponível em primeiro lugar</div>
                  </div>
                </div>
                <div className="barber-option-card__badge">Mais Rápido</div>
              </div>

              {barbers
                .filter(b => b.status !== 'offline')
                .map(barber => {
                  const wait = getBarberWaitTime(barber.id);
                  return (
                    <div
                      key={barber.id}
                      className={`barber-option-card ${selectedBarberId === barber.id ? 'selected' : ''}`}
                      onClick={() => setSelectedBarberId(barber.id)}
                    >
                      <div className="barber-option-card__info">
                        <img
                          src={barber.avatar}
                          alt={barber.name}
                          className="barber-option-card__avatar"
                        />
                        <div>
                          <div className="barber-option-card__name">{barber.name}</div>
                          <div className="barber-option-card__sub">
                            {barber.status === 'available' ? '🟢 Livre no momento' : '🔴 Ocupado'}
                          </div>
                        </div>
                      </div>
                      <div className="barber-option-card__wait">
                        {wait === 0 ? 'Imediato' : `~${wait} min`}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(entryMode === 'scheduled' ? 2 : 1)} style={{ flex: 1, justifyContent: 'center' }}>
                Voltar
              </button>
              <button className="btn btn-gold" onClick={handleBarberStep} style={{ flex: 2, justifyContent: 'center' }}>
                Avançar →
              </button>
            </div>
          </>
        )}

        {/* ========= SERVICES STEP ========= */}
        {step === servicesStep && (
          <>
            <div className="form-group">
              <label className="form-label">
                Escolha os Serviços para você <span>*</span>
              </label>
              <div className="services-grid">
                {services.map(service => {
                  const isSelected = !!selectedServices.find(s => s.id === service.id);
                  return (
                    <div
                      key={service.id}
                      className={`service-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleService(service)}
                    >
                      <div className="service-option__left">
                        <div className="service-option__checkbox">
                          {isSelected && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                              <polyline points="20,6 9,17 4,12" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <span className="service-option__name">{service.name}</span>
                          {service.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {service.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="service-option__right">
                        R$ {service.price.toFixed(2).replace('.', ',')} • {service.duration}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(barberStep)} style={{ flex: 1, justifyContent: 'center' }}>
                Voltar
              </button>
              <button className="btn btn-gold" onClick={handleServicesStep} style={{ flex: 2, justifyContent: 'center' }}>
                Avançar →
              </button>
            </div>
          </>
        )}

        {/* ========= CONFIRMATION STEP ========= */}
        {step === confirmStep && (
          <>
            <div style={{ marginBottom: '1.25rem', background: 'var(--card-bg-soft)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.5rem' }}>
                📋 Resumo do {entryMode === 'scheduled' ? 'Agendamento' : 'Atendimento'}
              </h4>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                <p><strong>Cliente:</strong> {name} ({whatsapp})</p>
                <p><strong>Profissional:</strong> {barbers.find(b => b.id === selectedBarberId)?.name || 'Sem preferência (Mais rápido)'}</p>
                <p><strong>Serviços:</strong> {selectedServices.map(s => s.name).join(', ')}</p>
                {entryMode === 'scheduled' && (
                  <p style={{ color: 'var(--gold)' }}><strong>📅 Agendado para:</strong> {scheduledDate ? scheduledDate.split('-').reverse().join('/') : ''} às {scheduledTime}</p>
                )}
                {entryMode === 'queue' && (
                  <p style={{ color: 'var(--green-text)' }}><strong>⚡ Modo:</strong> Fila — atendimento imediato por ordem de chegada</p>
                )}
              </div>

              {/* Dependents list */}
              {dependents.length > 0 && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gold)' }}>
                    👥 Acompanhantes ({dependents.length}):
                  </span>
                  {dependents.map(dep => (
                    <div
                      key={dep.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        marginTop: '0.4rem',
                        background: 'rgba(255,255,255,0.03)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '0.375rem',
                      }}
                    >
                      <span>
                        👤 <strong>{dep.name}:</strong> {dep.services.map(s => s.name).join(', ')}
                      </span>
                      <button
                        onClick={() => removeDependent(dep.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Total footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.85rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                <span>Total Estimado:</span>
                <span style={{ color: 'var(--gold)' }}>R$ {totalPrice.toFixed(2).replace('.', ',')} (~{totalDuration} min)</span>
              </div>
            </div>

            {/* Add Dependent Section */}
            {!showAddDep ? (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddDep(true)}
                style={{ width: '100%', marginBottom: '1.25rem', justifyContent: 'center' }}
              >
                + Adicionar Filho / Acompanhante na mesma senha
              </button>
            ) : (
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gold)' }}>
                  Novo Acompanhante / Filho
                </h5>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nome do acompanhante (ex: Pedro)"
                  value={depName}
                  onChange={e => setDepName(e.target.value)}
                  style={{ marginBottom: '0.75rem' }}
                />
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Serviços do acompanhante:
                </label>
                <div className="services-grid" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                  {services.map(svc => {
                    const isSelected = !!depServices.find(s => s.id === svc.id);
                    return (
                      <div
                        key={`dep-${svc.id}`}
                        className={`service-option ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleDepService(svc)}
                        style={{ padding: '0.4rem 0.6rem' }}
                      >
                        <span className="service-option__name" style={{ fontSize: '0.8rem' }}>{svc.name}</span>
                        <span className="service-option__right" style={{ fontSize: '0.75rem' }}>R$ {svc.price}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => { setShowAddDep(false); setError(''); }}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-gold btn-sm"
                    onClick={handleAddDependent}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Salvar Acompanhante
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(servicesStep)} style={{ flex: 1, justifyContent: 'center' }}>
                Voltar
              </button>
              <button className="btn btn-gold" onClick={handleSubmit} style={{ flex: 2, justifyContent: 'center' }}>
                {entryMode === 'scheduled' ? '📅 Confirmar Agendamento' : '🚀 Entrar na Fila'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
