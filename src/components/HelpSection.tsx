'use client';

import { useState } from 'react';

export default function HelpSection() {
  const [isOpen, setIsOpen] = useState(true);

  const steps = [
    'Clique em "Entrar na fila" e preencha seu nome e WhatsApp.',
    'Selecione o serviço desejado (corte, barba, etc.).',
    'Acompanhe sua posição na fila em tempo real.',
    'Quando for sua vez, dirija-se à barbearia para ser atendido.',
    'Para cancelar, clique em "Entrar na minha conta" e cancele sua posição.',
  ];

  return (
    <div className="section-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          color: '#F8FAFC',
          fontSize: '1.05rem',
          fontWeight: 800,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#EF4444' }}>❓</span> Como usar esta página
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="2.5"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--gold)',
                  color: 'var(--gold)',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: '#CBD5E1', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4 }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
