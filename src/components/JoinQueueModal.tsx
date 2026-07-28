'use client';

import { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import { Service } from '@/types';

interface JoinQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinQueueModal({ isOpen, onClose }: JoinQueueModalProps) {
  const { services, addToQueue, config } = useQueue();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
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

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      setError('Selecione pelo menos um serviço.');
      return;
    }
    setError('');
    addToQueue(name.trim(), whatsapp, selectedServices);
    setSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setWhatsapp('');
    setSelectedServices([]);
    setError('');
    setSuccess(false);
    onClose();
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  if (success) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content modal-content--center" onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Você entrou na fila!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Acompanhe sua posição nesta página.
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
              {step === 1 ? 'Entrar na fila' : 'Selecione os serviços'}
            </h3>
            <p className="modal__subtitle">
              {step === 1
                ? 'Nome e WhatsApp; em seguida você escolhe o serviço.'
                : `${config.name}`}
            </p>
          </div>
          <button className="modal__close" onClick={handleClose}>✕</button>
        </div>

        {error && (
          <div style={{
            color: 'var(--red)',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            padding: '0.5rem 0.75rem',
            background: 'var(--red-soft)',
            borderRadius: '0.5rem',
          }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <div className="form-group">
              <label className="form-label">
                Nome completo <span>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="João Pedro"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                WhatsApp <span>*</span>
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
              Continuar
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">
                Selecione os serviços <span>*</span>
              </label>
              <div className="services-grid">
                {services.map(service => (
                  <div
                    key={service.id}
                    className={`service-option ${selectedServices.find(s => s.id === service.id) ? 'selected' : ''}`}
                    onClick={() => toggleService(service)}
                  >
                    <div className="service-option__left">
                      <div className="service-option__checkbox">
                        {selectedServices.find(s => s.id === service.id) && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        )}
                      </div>
                      <span className="service-option__name">{service.name}</span>
                    </div>
                    <span className="service-option__right">
                      R$ {service.price.toFixed(2)} - {service.duration}min
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedServices.length > 0 && (
              <div style={{
                padding: '0.75rem 1rem',
                background: 'var(--gold-glow)',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}>
                <span>Total: R$ {totalPrice.toFixed(2)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>~{totalDuration}min</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => { setStep(1); setError(''); }}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Voltar
              </button>
              <button
                className="btn btn-gold"
                onClick={handleSubmit}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                Confirmar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
