import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type GlassIntensity = 'subtle' | 'medium' | 'intense';
export type AnimationLevel = 'none' | 'reduced' | 'full';

interface GlassThemeConfig {
  mode: ThemeMode;
  intensity: GlassIntensity;
  animations: AnimationLevel;
  blurStrength: number;
  opacity: number;
  borderOpacity: number;
  enableParticles: boolean;
  enableGradients: boolean;
  enableShadows: boolean;
  customBackground?: string;
}

interface GlassThemeContextType {
  config: GlassThemeConfig;
  updateConfig: (updates: Partial<GlassThemeConfig>) => void;
  resetToDefaults: () => void;
  presets: Record<string, GlassThemeConfig>;
  applyPreset: (presetName: string) => void;
}

const defaultConfig: GlassThemeConfig = {
  mode: 'auto',
  intensity: 'medium',
  animations: 'full',
  blurStrength: 16,
  opacity: 0.15,
  borderOpacity: 0.2,
  enableParticles: true,
  enableGradients: true,
  enableShadows: true,
};

const presets: Record<string, GlassThemeConfig> = {
  minimal: {
    ...defaultConfig,
    intensity: 'subtle',
    animations: 'reduced',
    blurStrength: 8,
    opacity: 0.05,
    borderOpacity: 0.1,
    enableParticles: false,
  },
  standard: {
    ...defaultConfig,
  },
  vibrant: {
    ...defaultConfig,
    intensity: 'intense',
    blurStrength: 24,
    opacity: 0.25,
    borderOpacity: 0.3,
    enableParticles: true,
  },
  performance: {
    ...defaultConfig,
    animations: 'none',
    blurStrength: 8,
    enableParticles: false,
    enableShadows: false,
  },
  accessibility: {
    ...defaultConfig,
    intensity: 'subtle',
    animations: 'reduced',
    opacity: 0.1,
    borderOpacity: 0.15,
    enableParticles: false,
  },
};

const GlassThemeContext = createContext<GlassThemeContextType | undefined>(undefined);

interface GlassThemeProviderProps {
  children: ReactNode;
  initialConfig?: Partial<GlassThemeConfig>;
}

export const GlassThemeProvider: React.FC<GlassThemeProviderProps> = ({
  children,
  initialConfig = {},
}) => {
  const [config, setConfig] = useState<GlassThemeConfig>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('glass-theme-config');
    const savedConfig = saved ? JSON.parse(saved) : {};
    return { ...defaultConfig, ...savedConfig, ...initialConfig };
  });

  // Save to localStorage whenever config changes
  useEffect(() => {
    localStorage.setItem('glass-theme-config', JSON.stringify(config));
  }, [config]);

  // Apply CSS custom properties based on config
  useEffect(() => {
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--glass-blur', `${config.blurStrength}px`);
    root.style.setProperty('--glass-opacity', config.opacity.toString());
    root.style.setProperty('--glass-border-opacity', config.borderOpacity.toString());
    
    // Set intensity-based properties
    const intensityMap = {
      subtle: { blur: 8, opacity: 0.05, border: 0.1 },
      medium: { blur: 16, opacity: 0.15, border: 0.2 },
      intense: { blur: 24, opacity: 0.25, border: 0.3 },
    };
    
    const intensity = intensityMap[config.intensity];
    root.style.setProperty('--glass-blur-intensity', `${intensity.blur}px`);
    root.style.setProperty('--glass-opacity-intensity', intensity.opacity.toString());
    root.style.setProperty('--glass-border-intensity', intensity.border.toString());
    
    // Animation preferences
    if (config.animations === 'none') {
      root.style.setProperty('--animation-duration', '0s');
    } else if (config.animations === 'reduced') {
      root.style.setProperty('--animation-duration', '0.15s');
    } else {
      root.style.setProperty('--animation-duration', '0.3s');
    }
    
    // Theme mode
    root.setAttribute('data-theme', config.mode);
    root.setAttribute('data-glass-intensity', config.intensity);
    root.setAttribute('data-animations', config.animations);
    
    // Feature flags
    root.setAttribute('data-particles', config.enableParticles.toString());
    root.setAttribute('data-gradients', config.enableGradients.toString());
    root.setAttribute('data-shadows', config.enableShadows.toString());
    
    // Custom background
    if (config.customBackground) {
      root.style.setProperty('--custom-background', config.customBackground);
    }
  }, [config]);

  // Handle system theme changes for auto mode
  useEffect(() => {
    if (config.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        document.documentElement.setAttribute(
          'data-resolved-theme',
          mediaQuery.matches ? 'dark' : 'light'
        );
      };
      
      handleChange();
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      document.documentElement.setAttribute('data-resolved-theme', config.mode);
    }
  }, [config.mode]);

  const updateConfig = (updates: Partial<GlassThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setConfig(defaultConfig);
  };

  const applyPreset = (presetName: string) => {
    if (presets[presetName]) {
      setConfig(presets[presetName]);
    }
  };

  const value: GlassThemeContextType = {
    config,
    updateConfig,
    resetToDefaults,
    presets,
    applyPreset,
  };

  return (
    <GlassThemeContext.Provider value={value}>
      {children}
    </GlassThemeContext.Provider>
  );
};

export const useGlassTheme = (): GlassThemeContextType => {
  const context = useContext(GlassThemeContext);
  if (!context) {
    throw new Error('useGlassTheme must be used within a GlassThemeProvider');
  }
  return context;
};

// Utility hooks for specific theme aspects
export const useGlassConfig = () => {
  const { config } = useGlassTheme();
  return config;
};

export const useThemeMode = () => {
  const { config, updateConfig } = useGlassTheme();
  return {
    mode: config.mode,
    setMode: (mode: ThemeMode) => updateConfig({ mode }),
  };
};

export const useGlassIntensity = () => {
  const { config, updateConfig } = useGlassTheme();
  return {
    intensity: config.intensity,
    setIntensity: (intensity: GlassIntensity) => updateConfig({ intensity }),
  };
};

export const useAnimationLevel = () => {
  const { config, updateConfig } = useGlassTheme();
  return {
    level: config.animations,
    setLevel: (animations: AnimationLevel) => updateConfig({ animations }),
  };
};