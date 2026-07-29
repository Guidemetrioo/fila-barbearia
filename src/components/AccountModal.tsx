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
    if (numbers.length <= 2) return numbers ? `(${numbers}` : '';
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
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

  const totalPrice = entry
    ? (entry.services || []).reduce((sum, s) => sum + (s?.price || 0), 0) +
      (entry.dependents || []).reduce(
        (sum, dep) => sum + (dep?.services || []).reduce((dSum, s) => dSum + (s?.price || 0), 0),
        0
      )
    : 0;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content modal-content--center" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h3 className="modal__title">Consultar minha posição</h3>
            <p className="modal__subtitle">Digite seu WhatsApp para encontrar seu agendamento</p>
          </div>
          <button className="modal__close" onClick={handleClose}>✕</button>
        </div>

        {!searched ? (
          <>
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
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button className="btn btn-gold btn-large" onClick={handleSearch}>
              🔍 Consultar Fila
            </button>
          </>
        ) : entry ? (
          <div className="account-info">
            <div className="account-info__icon">💈</div>
            <div className="account-info__name">{entry.clientName}</div>

            <div className="account-info__position" style={{ marginTop: '0.5rem', fontSize: '1.2rem' }}>
              {entry.status === 'being-served' ? (
                <span style={{ color: 'var(--gold)' }}>✂️ Você está sendo atendido!</span>
              ) : entry.mode === 'scheduled' ? (
                <span style={{ color: 'var(--gold)' }}>📅 Horário Agendado</span>
              ) : (
                <span>Sua Posição: <strong>#{entry.position}º na fila</strong></span>
              )}
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {entry.mode === 'scheduled' && (
                <p style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                  📅 Data & Horário: {entry.scheduledDate ? entry.scheduledDate.split('-').reverse().join('/') : 'Hoje'} às {entry.scheduledTime}
                </p>
              )}
              <p><strong>Profissional:</strong> {entry.barberName || 'Sem preferência (Qualquer barbeiro)'}</p>
              <p><strong>Seus Serviços:</strong> {(entry.services || []).map(s => s?.name).filter(Boolean).join(', ')}</p>
              {entry.dependents && entry.dependents.length > 0 && (
                <p>
                  <strong>Acompanhantes:</strong>{' '}
                  {entry.dependents.map(d => `${d.name} (${(d.services || []).map(s => s?.name).filter(Boolean).join(', ')})`).join('; ')}
                </p>
              )}
              <p style={{ color: 'var(--gold)', fontWeight: 700, marginTop: '0.4rem' }}>
                Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {entry.status === 'waiting' && entry.mode === 'queue' && (
              <div style={{ marginTop: '1rem', background: 'var(--card-bg-soft)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                <div className="account-info__wait" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)' }}>
                  ~{entry.estimatedWait} min
                </div>
                <div className="account-info__wait-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Tempo estimado até o atendimento
                </div>
              </div>
            )}

            {entry.status === 'waiting' && entry.mode === 'scheduled' && (
              <div style={{ marginTop: '1rem', background: 'rgba(251,177,35,0.08)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-gold)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                  ⏰ Compareça à barbearia próximo ao horário reservado ({entry.scheduledTime}).
                </div>
              </div>
            )}

            {entry.status === 'waiting' && !showConfirmCancel && (
              <button
                className="btn btn-red btn-sm"
                style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
                onClick={() => setShowConfirmCancel(true)}
              >
                🚨 Sair da fila / Cancelar vaga
              </button>
            )}

            {showConfirmCancel && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                }}
              >
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 600 }}>
                  Tem certeza que deseja cancelar sua vaga?
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowConfirmCancel(false)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Não, manter vaga
                  </button>
                  <button
                    className="btn btn-red btn-sm"
                    onClick={handleCancel}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
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
              Nenhum agendamento ativo encontrado para este número.
            </p>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: '1rem' }}
              onClick={() => setSearched(false)}
            >
              Tentar outro WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
