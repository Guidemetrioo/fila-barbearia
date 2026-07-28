'use client';

import { useState } from 'react';
import { useQueue } from '@/context/QueueContext';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { getClientEntry, cancelEntry } = useQueue();
  const [whatsapp, setWhatsapp] = useState('');
  const [searched, setSearched] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

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
    setSearched(false);
  };

  const handleSearch = () => {
    if (whatsapp.replace(/\D/g, '').length >= 10) {
      setSearched(true);
    }
  };

  const entry = searched ? getClientEntry(whatsapp) : undefined;

  const handleCancel = () => {
    if (entry) {
      cancelEntry(entry.id);
      setShowConfirmCancel(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setWhatsapp('');
    setSearched(false);
    setShowConfirmCancel(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-content--center" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h3 className="modal__title">Minha conta</h3>
            <p className="modal__subtitle">Digite seu WhatsApp para encontrar sua posição</p>
          </div>
          <button className="modal__close" onClick={handleClose}>✕</button>
        </div>

        {!searched ? (
          <>
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
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="btn btn-gold btn-large" onClick={handleSearch}>
              Buscar
            </button>
          </>
        ) : entry ? (
          <div className="account-info">
            <div className="account-info__icon">👤</div>
            <div className="account-info__name">{entry.clientName}</div>
            <div className="account-info__position">
              {entry.status === 'being-served'
                ? '✂️ Você está sendo atendido!'
                : `${entry.position}º na fila`}
            </div>
            <div className="account-info__services">
              {entry.services.map(s => s.name).join(', ')}
            </div>
            {entry.status === 'waiting' && (
              <>
                <div className="account-info__wait">~{entry.estimatedWait} min</div>
                <div className="account-info__wait-label">tempo estimado de espera</div>
              </>
            )}

            {entry.status === 'waiting' && !showConfirmCancel && (
              <button
                className="btn btn-red btn-sm"
                style={{ marginTop: '1.5rem' }}
                onClick={() => setShowConfirmCancel(true)}
              >
                Cancelar minha posição
              </button>
            )}

            {showConfirmCancel && (
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ color: 'var(--red)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  Tem certeza que deseja sair da fila?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowConfirmCancel(false)}>
                    Não
                  </button>
                  <button className="btn btn-red btn-sm" onClick={handleCancel}>
                    Sim, cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Nenhuma entrada encontrada para este WhatsApp.
            </p>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: '1rem' }}
              onClick={() => setSearched(false)}
            >
              Tentar outro número
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
