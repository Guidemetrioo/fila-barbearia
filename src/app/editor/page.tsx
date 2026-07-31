'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLayout, THEME_PRESETS, SectionId } from '@/context/LayoutContext';
import Home from '@/app/page';

export default function LayoutEditorPage() {
  const {
    layoutConfig,
    updateLayoutConfig,
    updateColors,
    updateBranding,
    applyPreset,
    toggleSectionVisibility,
    reorderSections,
    resetLayout,
    exportConfigJson,
    importConfigJson,
  } = useLayout();

  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'texts' | 'sections' | 'export'>('presets');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [jsonInput, setJsonInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const sectionLabels: Record<SectionId, { label: string; icon: string }> = {
    profile: { label: 'Perfil e Logo da Barbearia', icon: '🏪' },
    banner: { label: 'Banner de Avisos e Comunicados', icon: '📢' },
    action: { label: 'Botão Principal (Entrar na Fila)', icon: '⚡' },
    barbers: { label: 'Grade da Equipe de Barbeiros', icon: '💈' },
    queue: { label: 'Fila de Espera em Tempo Real', icon: '👥' },
    services: { label: 'Tabela de Serviços e Preços', icon: '✂️' },
    help: { label: 'Guia "Como Funciona"', icon: '❓' },
    info: { label: 'Informações e Endereço da Loja', icon: '📍' },
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...layoutConfig.sectionsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    reorderSections(newOrder);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportConfigJson());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleImportJson = () => {
    const success = importConfigJson(jsonInput);
    if (success) {
      setImportStatus('✅ Configuração importada com sucesso!');
      setJsonInput('');
    } else {
      setImportStatus('❌ JSON inválido. Verifique a estrutura.');
    }
    setTimeout(() => setImportStatus(null), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070B09', color: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navigation */}
      <header style={{
        padding: '0.875rem 1.5rem',
        backgroundColor: '#0A1410',
        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" className="btn btn-outline btn-sm" style={{ textDecoration: 'none', color: 'var(--gold)' }}>
            ← Voltar para Fila
          </Link>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🎨 Editor de Layout e Tema em Tempo Real
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
              Personalize cores, fontes, banners, ordem das seções e veja o resultado instantaneamente.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Device Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: '#101F18',
            borderRadius: '0.5rem',
            padding: '0.25rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`btn btn-sm ${previewDevice === 'mobile' ? 'btn-gold' : ''}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              📱 Mobile
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`btn btn-sm ${previewDevice === 'tablet' ? 'btn-gold' : ''}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`btn btn-sm ${previewDevice === 'desktop' ? 'btn-gold' : ''}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
            >
              💻 Desktop
            </button>
          </div>

          <button onClick={resetLayout} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', borderColor: '#EF4444', color: '#F87171' }}>
            🔄 Resetar Padrão
          </button>
          <Link href="/admin" className="btn btn-gold btn-sm" style={{ textDecoration: 'none', fontSize: '0.75rem' }}>
            ⚙️ Ir p/ Admin
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Control Panel */}
        <div style={{
          width: '420px',
          maxWidth: '100%',
          backgroundColor: '#091510',
          borderRight: '1px solid rgba(212, 175, 55, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10
        }}>
          {/* Controls Tabs Header */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: '#060E0B',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setActiveTab('presets')}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                border: 'none',
                background: activeTab === 'presets' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'presets' ? 'var(--gold)' : '#94A3B8',
                borderBottom: activeTab === 'presets' ? '2px solid var(--gold)' : '2px solid transparent',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              👑 Temas
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                border: 'none',
                background: activeTab === 'colors' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'colors' ? 'var(--gold)' : '#94A3B8',
                borderBottom: activeTab === 'colors' ? '2px solid var(--gold)' : '2px solid transparent',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              🎨 Cores & Fontes
            </button>
            <button
              onClick={() => setActiveTab('texts')}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                border: 'none',
                background: activeTab === 'texts' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'texts' ? 'var(--gold)' : '#94A3B8',
                borderBottom: activeTab === 'texts' ? '2px solid var(--gold)' : '2px solid transparent',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              📝 Textos
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                border: 'none',
                background: activeTab === 'sections' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'sections' ? 'var(--gold)' : '#94A3B8',
                borderBottom: activeTab === 'sections' ? '2px solid var(--gold)' : '2px solid transparent',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              🔀 Seções
            </button>
            <button
              onClick={() => setActiveTab('export')}
              style={{
                flex: 1,
                padding: '0.75rem 0.5rem',
                border: 'none',
                background: activeTab === 'export' ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                color: activeTab === 'export' ? 'var(--gold)' : '#94A3B8',
                borderBottom: activeTab === 'export' ? '2px solid var(--gold)' : '2px solid transparent',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              💾 Exportar
            </button>
          </div>

          {/* Controls Tab Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {/* TAB 1: PRESETS */}
            {activeTab === 'presets' && (
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--gold)', marginBottom: '0.75rem' }}>
                  Escolha um Tema Pré-definido (1 Clique)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(THEME_PRESETS).map(([key, preset]) => {
                    const isSelected = layoutConfig.themePreset === key;
                    return (
                      <div
                        key={key}
                        onClick={() => applyPreset(key as any)}
                        style={{
                          padding: '0.875rem',
                          borderRadius: '0.75rem',
                          border: isSelected ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                          backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.12)' : '#0F1F17',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{preset.icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSelected ? 'var(--gold)' : '#FFF' }}>
                              {preset.name}
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                              <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: preset.colors.primaryGold, border: '1px solid #000' }} />
                              <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: preset.colors.bgPrimary, border: '1px solid #FFF' }} />
                              <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: preset.colors.bgSecondary, border: '1px solid #FFF' }} />
                            </div>
                          </div>
                        </div>
                        {isSelected && <span style={{ color: 'var(--gold)', fontWeight: 800 }}>✓ Ativo</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: COLORS & FONTS */}
            {activeTab === 'colors' && (
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--gold)', marginBottom: '1rem' }}>
                  Personalizador de Cores & Tipografia
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Heading Font */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                      🔤 Fonte dos Títulos & Nomes (Heading Font)
                    </label>
                    <select
                      className="form-control"
                      value={layoutConfig.fontHeading || 'Cinzel'}
                      onChange={e => updateLayoutConfig({ fontHeading: e.target.value })}
                      style={{ backgroundColor: '#0B1B13', color: '#FFF', borderColor: 'rgba(212,175,55,0.3)', fontFamily: layoutConfig.fontHeading }}
                    >
                      <option value="Cinzel">Cinzel (Clássica Imperial & Dourada - Padrão)</option>
                      <option value="Outfit">Outfit (Moderna & Luxuosa)</option>
                      <option value="Playfair Display">Playfair Display (Serif Elegante de Luxo)</option>
                      <option value="Oswald">Oswald (Vintage Barber Imponente)</option>
                      <option value="Montserrat">Montserrat (Geométrica Premium)</option>
                      <option value="Inter">Inter (Minimalista Suíça Clean)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Tech Clean)</option>
                      <option value="Poppins">Poppins (Arredondada & Amigável)</option>
                    </select>
                  </div>

                  {/* Body Font */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                      📝 Fonte dos Textos & Descrições (Body Font)
                    </label>
                    <select
                      className="form-control"
                      value={layoutConfig.fontBody || 'Inter'}
                      onChange={e => updateLayoutConfig({ fontBody: e.target.value })}
                      style={{ backgroundColor: '#0B1B13', color: '#FFF', borderColor: 'rgba(212,175,55,0.3)', fontFamily: layoutConfig.fontBody }}
                    >
                      <option value="Inter">Inter (Neutra & Minimalista - Padrão)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Padrão Altamente Legível)</option>
                      <option value="Montserrat">Montserrat (Moderna & Enfática)</option>
                      <option value="Poppins">Poppins (Moderna & Macia)</option>
                      <option value="Roboto">Roboto (Clássica Universal Web)</option>
                    </select>
                  </div>

                  <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />

                  {/* Primary Gold */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#CBD5E1' }}>
                      <span>Cor Principal Dourada (Gold Accent)</span>
                      <span>{layoutConfig.colors.primaryGold}</span>
                    </label>
                    <input
                      type="color"
                      value={layoutConfig.colors.primaryGold}
                      onChange={e => updateColors({ primaryGold: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Gold Light */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#CBD5E1' }}>
                      <span>Dourado Claro (Glow/Hover)</span>
                      <span>{layoutConfig.colors.goldLight}</span>
                    </label>
                    <input
                      type="color"
                      value={layoutConfig.colors.goldLight}
                      onChange={e => updateColors({ goldLight: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Primary BG */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#CBD5E1' }}>
                      <span>Fundo Principal da Página (Dark BG)</span>
                      <span>{layoutConfig.colors.bgPrimary}</span>
                    </label>
                    <input
                      type="color"
                      value={layoutConfig.colors.bgPrimary}
                      onChange={e => updateColors({ bgPrimary: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Card BG */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#CBD5E1' }}>
                      <span>Fundo dos Cartões e Bloco Secundário</span>
                      <span>{layoutConfig.colors.bgSecondary}</span>
                    </label>
                    <input
                      type="color"
                      value={layoutConfig.colors.bgSecondary}
                      onChange={e => updateColors({ bgSecondary: e.target.value, bgCard: e.target.value })}
                      style={{ width: '100%', height: '38px', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Border Radius */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.35rem', display: 'block' }}>
                      Arredondamento das Bordas (Border Radius)
                    </label>
                    <select
                      className="form-control"
                      value={layoutConfig.borderRadius}
                      onChange={e => updateLayoutConfig({ borderRadius: e.target.value as any })}
                      style={{ backgroundColor: '#0B1B13', color: '#FFF', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <option value="sm">Pequeno (0.375rem)</option>
                      <option value="md">Médio (0.5rem)</option>
                      <option value="lg">Grande (0.75rem)</option>
                      <option value="xl">Extra Grande (1rem)</option>
                      <option value="2xl">Super Arredondado (1.5rem)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEXTS & BRANDING */}
            {activeTab === 'texts' && (
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--gold)', marginBottom: '1rem' }}>
                  Textos, Nome & Banners da Barbearia
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Shop Name */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'block' }}>
                      Nome do Estabelecimento
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={layoutConfig.branding.shopName}
                      onChange={e => updateBranding({ shopName: e.target.value })}
                    />
                  </div>

                  {/* Shop Tagline */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'block' }}>
                      Slogan / Descrição Curta
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={layoutConfig.branding.shopDescription}
                      onChange={e => updateBranding({ shopDescription: e.target.value })}
                    />
                  </div>

                  {/* Logo URL */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'block' }}>
                      URL da Logomarca (Imagem)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={layoutConfig.branding.logoUrl}
                      onChange={e => updateBranding({ logoUrl: e.target.value })}
                    />
                  </div>

                  <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                  {/* CTA Text */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'block' }}>
                      Texto do Botão Principal (CTA)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={layoutConfig.branding.ctaButtonText}
                      onChange={e => updateBranding({ ctaButtonText: e.target.value })}
                    />
                  </div>

                  {/* CTA Pulse Effect */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#CBD5E1' }}>
                    <input
                      type="checkbox"
                      checked={layoutConfig.branding.ctaButtonPulse}
                      onChange={e => updateBranding({ ctaButtonPulse: e.target.checked })}
                    />
                    Efeito de Pulso Animação no Botão CTA
                  </label>

                  <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                  {/* Banner Line 1 */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'block' }}>
                      Banner de Aviso - Linha 1
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={layoutConfig.branding.bannerText1}
                      onChange={e => updateBranding({ bannerText1: e.target.value })}
                    />
                  </div>

                  {/* Banner Line 2 */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'block' }}>
                      Banner de Aviso - Linha 2 (Horários)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={layoutConfig.branding.bannerText2}
                      onChange={e => updateBranding({ bannerText2: e.target.value })}
                    />
                  </div>

                  {/* Banner Line 3 */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.25rem', display: 'block' }}>
                      Banner de Aviso - Linha 3 (Instruções de Conta)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={layoutConfig.branding.bannerText3}
                      onChange={e => updateBranding({ bannerText3: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SECTIONS & ORDER */}
            {activeTab === 'sections' && (
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                  Reordenar e Ocultar Seções da Página
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1rem' }}>
                  Use as setas para alterar a posição vertical ou clique no olho para ocultar um bloco.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {layoutConfig.sectionsOrder.map((sectionId, idx) => {
                    const info = sectionLabels[sectionId] || { label: sectionId, icon: '📦' };
                    const isHidden = layoutConfig.hiddenSections.includes(sectionId);

                    return (
                      <div
                        key={sectionId}
                        style={{
                          padding: '0.6rem 0.875rem',
                          borderRadius: '0.5rem',
                          backgroundColor: isHidden ? 'rgba(255,255,255,0.03)' : '#0F1F17',
                          border: isHidden ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(212,175,55,0.2)',
                          opacity: isHidden ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <span>{info.icon}</span>
                          <span style={{ fontWeight: 600, color: isHidden ? '#94A3B8' : '#FFF' }}>{info.label}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {/* Visibility Toggle */}
                          <button
                            onClick={() => toggleSectionVisibility(sectionId)}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                            title={isHidden ? 'Exibir Seção' : 'Ocultar Seção'}
                          >
                            {isHidden ? '🙈 Oculto' : '👁️ Visível'}
                          </button>

                          {/* Reorder Up */}
                          <button
                            onClick={() => moveSection(idx, 'up')}
                            disabled={idx === 0}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.2rem 0.4rem', opacity: idx === 0 ? 0.3 : 1 }}
                          >
                            ▲
                          </button>

                          {/* Reorder Down */}
                          <button
                            onClick={() => moveSection(idx, 'down')}
                            disabled={idx === layoutConfig.sectionsOrder.length - 1}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '0.2rem 0.4rem', opacity: idx === layoutConfig.sectionsOrder.length - 1 ? 0.3 : 1 }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <hr style={{ margin: '1.25rem 0', borderColor: 'rgba(255,255,255,0.08)' }} />

                <h4 style={{ fontSize: '0.85rem', color: 'var(--gold)', marginBottom: '0.75rem' }}>
                  Botões Flutuantes de Redes Sociais
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#CBD5E1' }}>
                    <input
                      type="checkbox"
                      checked={layoutConfig.floatingButtons.showWhatsapp}
                      onChange={e => updateLayoutConfig({
                        floatingButtons: { ...layoutConfig.floatingButtons, showWhatsapp: e.target.checked }
                      })}
                    />
                    Exibir Botão Flutuante do WhatsApp
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#CBD5E1' }}>
                    <input
                      type="checkbox"
                      checked={layoutConfig.floatingButtons.showInstagram}
                      onChange={e => updateLayoutConfig({
                        floatingButtons: { ...layoutConfig.floatingButtons, showInstagram: e.target.checked }
                      })}
                    />
                    Exibir Botão Flutuante do Instagram
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: EXPORT / IMPORT */}
            {activeTab === 'export' && (
              <div>
                <h3 style={{ fontSize: '0.95rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                  Exportar & Importar Configurações
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1rem' }}>
                  Copie o código JSON do seu tema personalizado para usar em outros ambientes ou faça backup.
                </p>

                <button onClick={handleCopyJson} className="btn btn-gold btn-large" style={{ width: '100%', marginBottom: '1rem' }}>
                  {copySuccess ? '✓ Copiado para a Área de Transferência!' : '📋 Copiar Configuração JSON'}
                </button>

                <hr style={{ borderColor: 'rgba(255,255,255,0.08)', marginBottom: '1rem' }} />

                <h4 style={{ fontSize: '0.85rem', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                  Importar JSON de Tema
                </h4>

                <textarea
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder="Cole aqui o código JSON de layout para aplicar..."
                  rows={6}
                  className="form-control"
                  style={{ fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.75rem' }}
                />

                <button onClick={handleImportJson} className="btn btn-outline" style={{ width: '100%' }}>
                  📥 Carregar JSON
                </button>

                {importStatus && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    {importStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live Interactive Sandbox Preview Pane */}
        <div style={{
          flex: 1,
          backgroundColor: '#040907',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '1.5rem',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Device Mockup Frame */}
          <div
            style={{
              width: previewDevice === 'mobile' ? '400px' : previewDevice === 'tablet' ? '768px' : '100%',
              maxWidth: '100%',
              minHeight: '750px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: previewDevice === 'mobile' ? '2.5rem' : previewDevice === 'tablet' ? '1.5rem' : '0.75rem',
              border: previewDevice === 'mobile' ? '12px solid #1E293B' : '4px solid #1E293B',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.15)',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Mobile Speaker Notch */}
            {previewDevice === 'mobile' && (
              <div style={{
                height: '24px',
                backgroundColor: '#1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '4px'
              }}>
                <div style={{ width: '60px', height: '4px', backgroundColor: '#0F172A', borderRadius: '4px' }} />
              </div>
            )}

            {/* Live Interactive Page Component */}
            <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
              <Home />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
