'use client';

import { useState } from 'react';

export default function HelpSection() {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    'Clique em "Entrar na fila" e preencha seu nome e WhatsApp.',
    'Selecione o serviço desejado (corte, barba, etc.).',
    'Acompanhe sua posição na fila em tempo real.',
    'Quando for sua vez, dirija-se à barbearia para ser atendido.',
    'Para cancelar, clique em "Entrar na minha conta" e cancele sua posição.',
  ];

  return (
    <div className="section-card">
      <button className="help-section__toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>❓ Como usar esta página</span>
        <svg
          className={`help-section__toggle-icon ${isOpen ? 'open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>
      <div className={`help-section__content ${isOpen ? 'open' : ''}`}>
        {steps.map((step, i) => (
          <div key={i} className="help-section__step">
            <span className="help-section__step-num">{i + 1}</span>
            <span className="help-section__step-text">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
