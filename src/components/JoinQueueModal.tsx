'use client';

import { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import { Service, Dependent } from '@/types';

interface JoinQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinQueueModal({ isOpen, onClose }: JoinQueueModalProps) {
  const { services, barbers, addToQueue, config, getBarberWaitTime } = useQueue();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
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

  if (!isOpen) return null;

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
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

  const handleStep2 = () => {
    setError('');
    setStep(3);
  };

  const handleStep3 = () => {
    if (selectedServices.length === 0) {
      setError('Selecione pelo menos um serviço para você.');
      return;
    }
    setError('');
    setStep(4);
  };

  const handleSubmit = () => {
    setError('');
    addToQueue(
      name.trim(),
      whatsapp,
      selectedServices,
      selectedBarberId === 'any' ? undefined : selectedBarberId,
      dependents
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

  if (success) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content modal-content--center" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gold)' }}>
              Sua vaga na fila foi garantida!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Acompanhe sua posição no painel principal ou pela aba "Minha Conta".
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
            <h3 className="modal__title">
              {step === 1 && '1. Seus dados'}
              {step === 2 && '2. Escolha o Profissional'}
              {step === 3 && '3. Selecione os Serviços'}
              {step === 4 && '4. Confirmação & Dependentes'}
            </h3>
            <p className="modal__subtitle">{config.name} • Atendimento por Ordem de Chegada</p>
          </div>
          <button className="modal__close" onClick={handleClose}>✕</button>
        </div>

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

        {/* Step 1: Dados do Cliente */}
        {step === 1 && (
          <>
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

        {/* Step 2: Escolha do Profissional */}
        {step === 2 && (
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Selecione com qual barbeiro deseja cortar ou escolha "Sem preferência".
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
              <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1, justifyContent: 'center' }}>
                Voltar
              </button>
              <button className="btn btn-gold" onClick={handleStep2} style={{ flex: 2, justifyContent: 'center' }}>
                Avançar →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Seleção de Serviços */}
        {step === 3 && (
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
                        R$ {service.price.toFixed(2)} • {service.duration}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)} style={{ flex: 1, justifyContent: 'center' }}>
                Voltar
              </button>
              <button className="btn btn-gold" onClick={handleStep3} style={{ flex: 2, justifyContent: 'center' }}>
                Avançar →
              </button>
            </div>
          </>
        )}

        {/* Step 4: Confirmação & Adicionar Dependentes */}
        {step === 4 && (
          <>
            <div style={{ marginBottom: '1.25rem', background: 'var(--card-bg-soft)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--gold)', marginBottom: '0.5rem' }}>
                📋 Resumo do Agendamento
              </h4>
              <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                <p><strong>Cliente:</strong> {name} ({whatsapp})</p>
                <p><strong>Profissional:</strong> {barbers.find(b => b.id === selectedBarberId)?.name || 'Sem preferência (Mais rápido)'}</p>
                <p><strong>Serviços:</strong> {selectedServices.map(s => s.name).join(', ')}</p>
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
                <span style={{ color: 'var(--gold)' }}>R$ {totalPrice.toFixed(2)} (~{totalDuration} min)</span>
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
              <button className="btn btn-outline" onClick={() => setStep(3)} style={{ flex: 1, justifyContent: 'center' }}>
                Voltar
              </button>
              <button className="btn btn-gold" onClick={handleSubmit} style={{ flex: 2, justifyContent: 'center' }}>
                🚀 Entrar na Fila
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
