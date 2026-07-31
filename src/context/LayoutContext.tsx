'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface ThemeColors {
  primaryGold: string;
  goldLight: string;
  goldDark: string;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  accentGlow: string;
}

export interface BrandingConfig {
  shopName: string;
  shopDescription: string;
  logoUrl: string;
  bannerText1: string;
  bannerText2: string;
  bannerText3: string;
  ctaButtonText: string;
  ctaButtonPulse: boolean;
}

export type SectionId = 'profile' | 'banner' | 'action' | 'barbers' | 'queue' | 'services' | 'help' | 'info';

export interface LayoutConfig {
  themePreset: 'emerald' | 'gold' | 'navy' | 'vintage' | 'cyber';
  colors: ThemeColors;
  borderRadius: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontHeading: string;
  fontBody: string;
  branding: BrandingConfig;
  sectionsOrder: SectionId[];
  hiddenSections: SectionId[];
  floatingButtons: {
    showWhatsapp: boolean;
    showInstagram: boolean;
  };
}

export const THEME_PRESETS: Record<string, { name: string; icon: string; colors: ThemeColors }> = {
  emerald: {
    name: 'Del Rey Emerald & Gold',
    icon: '👑',
    colors: {
      primaryGold: '#D4AF37',
      goldLight: '#F3E0AA',
      goldDark: '#A38020',
      bgPrimary: '#040E0A',
      bgSecondary: '#071710',
      bgCard: 'rgba(10, 24, 17, 0.85)',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      accentGlow: 'rgba(212, 175, 55, 0.25)',
    },
  },
  gold: {
    name: 'Classic Charcoal & Gold',
    icon: '💈',
    colors: {
      primaryGold: '#E5C158',
      goldLight: '#FFF0C4',
      goldDark: '#B38F24',
      bgPrimary: '#0F0F12',
      bgSecondary: '#18181C',
      bgCard: 'rgba(28, 28, 35, 0.9)',
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      accentGlow: 'rgba(229, 193, 88, 0.3)',
    },
  },
  navy: {
    name: 'Midnight Navy & Royal Gold',
    icon: '🌌',
    colors: {
      primaryGold: '#FFD700',
      goldLight: '#FFE875',
      goldDark: '#C5A000',
      bgPrimary: '#0A1128',
      bgSecondary: '#1C2541',
      bgCard: 'rgba(27, 38, 59, 0.9)',
      textPrimary: '#F0F4F8',
      textSecondary: '#8D99AE',
      accentGlow: 'rgba(255, 215, 0, 0.28)',
    },
  },
  vintage: {
    name: 'Vintage Leather & Bronze',
    icon: '🪵',
    colors: {
      primaryGold: '#D97706',
      goldLight: '#FCD34D',
      goldDark: '#92400E',
      bgPrimary: '#18120F',
      bgSecondary: '#241C18',
      bgCard: 'rgba(44, 34, 29, 0.9)',
      textPrimary: '#FEF3C7',
      textSecondary: '#D97706',
      accentGlow: 'rgba(217, 119, 6, 0.3)',
    },
  },
  cyber: {
    name: 'Cyber Neon Barber',
    icon: '⚡',
    colors: {
      primaryGold: '#00F0FF',
      goldLight: '#80F8FF',
      goldDark: '#00A3B0',
      bgPrimary: '#0A0518',
      bgSecondary: '#140A2E',
      bgCard: 'rgba(28, 15, 58, 0.9)',
      textPrimary: '#FFFFFF',
      textSecondary: '#B7A3E3',
      accentGlow: 'rgba(0, 240, 255, 0.35)',
    },
  },
};

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  themePreset: 'emerald',
  colors: THEME_PRESETS.emerald.colors,
  borderRadius: 'xl',
  fontHeading: 'Cinzel',
  fontBody: 'Inter',
  branding: {
    shopName: 'BARBEARIA DEL REY',
    shopDescription: 'Mais que um corte, uma experiência real.',
    logoUrl: '/images/logo.png',
    bannerText1: 'Horários base sujeitos a pequenas alterações de tolerância',
    bannerText2: 'Fila abre às 08:30 | Atendimento a partir das 09:00',
    bannerText3: 'Para CANCELAR ou consultar sua posição: clique em ENTRAR NA MINHA CONTA',
    ctaButtonText: 'ENTRAR NA FILA DE CORTE',
    ctaButtonPulse: true,
  },
  sectionsOrder: ['profile', 'banner', 'action', 'barbers', 'queue', 'services', 'help', 'info'],
  hiddenSections: [],
  floatingButtons: {
    showWhatsapp: true,
    showInstagram: true,
  },
};

interface LayoutContextType {
  layoutConfig: LayoutConfig;
  updateLayoutConfig: (newConfig: Partial<LayoutConfig>) => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateBranding: (branding: Partial<BrandingConfig>) => void;
  applyPreset: (presetKey: keyof typeof THEME_PRESETS) => void;
  toggleSectionVisibility: (sectionId: SectionId) => void;
  reorderSections: (newOrder: SectionId[]) => void;
  resetLayout: () => void;
  exportConfigJson: () => string;
  importConfigJson: (jsonString: string) => boolean;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'barbearia_del_rey_layout_config_v1';

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setLayoutConfig({
          ...DEFAULT_LAYOUT_CONFIG,
          ...parsed,
          colors: { ...DEFAULT_LAYOUT_CONFIG.colors, ...parsed.colors },
          branding: { ...DEFAULT_LAYOUT_CONFIG.branding, ...parsed.branding },
          floatingButtons: { ...DEFAULT_LAYOUT_CONFIG.floatingButtons, ...parsed.floatingButtons },
        });
      }
    } catch (e) {
      console.error('Failed to parse saved layout config', e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layoutConfig));
    } catch (e) {
      console.error('Failed to save layout config', e);
    }
  }, [layoutConfig, isInitialized]);

  // Inject CSS custom properties directly to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const c = layoutConfig.colors;

    root.style.setProperty('--gold', c.primaryGold);
    root.style.setProperty('--gold-light', c.goldLight);
    root.style.setProperty('--gold-dark', c.goldDark);
    root.style.setProperty('--gold-gradient', `linear-gradient(135deg, ${c.goldLight} 0%, ${c.primaryGold} 50%, ${c.goldDark} 100%)`);
    root.style.setProperty('--gold-gradient-hover', `linear-gradient(135deg, #FFFFFF 0%, ${c.goldLight} 50%, ${c.primaryGold} 100%)`);
    root.style.setProperty('--gold-glow', c.accentGlow);
    root.style.setProperty('--bg-primary', c.bgPrimary);
    root.style.setProperty('--bg-secondary', c.bgSecondary);
    root.style.setProperty('--bg-card', c.bgCard);
    root.style.setProperty('--bg-card-solid', c.bgSecondary);
    root.style.setProperty('--text-primary', c.textPrimary);
    root.style.setProperty('--text-secondary', c.textSecondary);

    root.style.setProperty('--font-heading', `'${layoutConfig.fontHeading || 'Outfit'}', -apple-system, sans-serif`);
    root.style.setProperty('--font-body', `'${layoutConfig.fontBody || 'Plus Jakarta Sans'}', -apple-system, sans-serif`);

    const radiusMap: Record<string, string> = {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
    };
    root.style.setProperty('--radius-lg', radiusMap[layoutConfig.borderRadius] || '1rem');
  }, [layoutConfig]);

  const updateLayoutConfig = (newConfig: Partial<LayoutConfig>) => {
    setLayoutConfig(prev => ({ ...prev, ...newConfig }));
  };

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setLayoutConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, ...newColors },
    }));
  };

  const updateBranding = (newBranding: Partial<BrandingConfig>) => {
    setLayoutConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, ...newBranding },
    }));
  };

  const applyPreset = (presetKey: keyof typeof THEME_PRESETS) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      setLayoutConfig(prev => ({
        ...prev,
        themePreset: presetKey as any,
        colors: { ...preset.colors },
      }));
    }
  };

  const toggleSectionVisibility = (sectionId: SectionId) => {
    setLayoutConfig(prev => {
      const exists = prev.hiddenSections.includes(sectionId);
      const newHidden = exists
        ? prev.hiddenSections.filter(id => id !== sectionId)
        : [...prev.hiddenSections, sectionId];
      return { ...prev, hiddenSections: newHidden };
    });
  };

  const reorderSections = (newOrder: SectionId[]) => {
    setLayoutConfig(prev => ({ ...prev, sectionsOrder: newOrder }));
  };

  const resetLayout = () => {
    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
  };

  const exportConfigJson = (): string => {
    return JSON.stringify(layoutConfig, null, 2);
  };

  const importConfigJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        setLayoutConfig({
          ...DEFAULT_LAYOUT_CONFIG,
          ...parsed,
        });
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON provided', e);
    }
    return false;
  };

  return (
    <LayoutContext.Provider
      value={{
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
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
