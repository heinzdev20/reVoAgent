import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Palette, 
  Zap, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Layers,
  Monitor,
  Sun,
  Moon,
  RotateCcw,
  Save,
  X
} from 'lucide-react';
import { GlassCard, GlassButton, GlassModal } from './ui/glass';
import { useGlassTheme, ThemeMode, GlassIntensity, AnimationLevel } from '../contexts/GlassThemeContext';

interface GlassThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlassThemeSettings: React.FC<GlassThemeSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { config, updateConfig, resetToDefaults, presets, applyPreset } = useGlassTheme();
  const [activeTab, setActiveTab] = useState<'appearance' | 'performance' | 'presets'>('appearance');

  const handleModeChange = (mode: ThemeMode) => {
    updateConfig({ mode });
  };

  const handleIntensityChange = (intensity: GlassIntensity) => {
    updateConfig({ intensity });
  };

  const handleAnimationChange = (animations: AnimationLevel) => {
    updateConfig({ animations });
  };

  const handleFeatureToggle = (feature: keyof typeof config, value: boolean) => {
    updateConfig({ [feature]: value });
  };

  const handleSliderChange = (property: keyof typeof config, value: number) => {
    updateConfig({ [property]: value });
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <Zap className="w-4 h-4" /> },
    { id: 'presets', label: 'Presets', icon: <Layers className="w-4 h-4" /> },
  ];

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Theme Mode */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Theme Mode</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { mode: 'light' as ThemeMode, icon: <Sun className="w-4 h-4" />, label: 'Light' },
            { mode: 'dark' as ThemeMode, icon: <Moon className="w-4 h-4" />, label: 'Dark' },
            { mode: 'auto' as ThemeMode, icon: <Monitor className="w-4 h-4" />, label: 'Auto' },
          ].map(({ mode, icon, label }) => (
            <GlassButton
              key={mode}
              variant={config.mode === mode ? 'medium' : 'light'}
              onClick={() => handleModeChange(mode)}
              className="flex items-center justify-center space-x-2 py-3"
            >
              {icon}
              <span>{label}</span>
            </GlassButton>
          ))}
        </div>
      </div>

      {/* Glass Intensity */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Glass Intensity</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { intensity: 'subtle' as GlassIntensity, label: 'Subtle' },
            { intensity: 'medium' as GlassIntensity, label: 'Medium' },
            { intensity: 'intense' as GlassIntensity, label: 'Intense' },
          ].map(({ intensity, label }) => (
            <GlassButton
              key={intensity}
              variant={config.intensity === intensity ? 'medium' : 'light'}
              onClick={() => handleIntensityChange(intensity)}
              className="py-3"
            >
              {label}
            </GlassButton>
          ))}
        </div>
      </div>

      {/* Custom Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-3">Fine Tuning</h3>
        
        {/* Blur Strength */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Blur Strength: {config.blurStrength}px
          </label>
          <input
            type="range"
            min="4"
            max="32"
            value={config.blurStrength}
            onChange={(e) => handleSliderChange('blurStrength', Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Background Opacity: {Math.round(config.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={config.opacity}
            onChange={(e) => handleSliderChange('opacity', Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Border Opacity */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Border Opacity: {Math.round(config.borderOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={config.borderOpacity}
            onChange={(e) => handleSliderChange('borderOpacity', Number(e.target.value))}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Visual Effects</h3>
        <div className="space-y-3">
          {[
            { key: 'enableParticles', label: 'Particle Effects', icon: <Sparkles className="w-4 h-4" /> },
            { key: 'enableGradients', label: 'Background Gradients', icon: <Palette className="w-4 h-4" /> },
            { key: 'enableShadows', label: 'Drop Shadows', icon: <Layers className="w-4 h-4" /> },
          ].map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white/90">
                {icon}
                <span>{label}</span>
              </div>
              <GlassButton
                variant="light"
                size="sm"
                onClick={() => handleFeatureToggle(key as keyof typeof config, !config[key as keyof typeof config])}
                className="px-3"
              >
                {config[key as keyof typeof config] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </GlassButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Animation Level */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Animation Level</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { level: 'none' as AnimationLevel, label: 'None' },
            { level: 'reduced' as AnimationLevel, label: 'Reduced' },
            { level: 'full' as AnimationLevel, label: 'Full' },
          ].map(({ level, label }) => (
            <GlassButton
              key={level}
              variant={config.animations === level ? 'medium' : 'light'}
              onClick={() => handleAnimationChange(level)}
              className="py-3"
            >
              {label}
            </GlassButton>
          ))}
        </div>
        <p className="text-sm text-white/70 mt-2">
          Reducing animations can improve performance on slower devices.
        </p>
      </div>

      {/* Performance Tips */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Performance Tips</h3>
        <div className="space-y-3 text-sm text-white/80">
          <div className="glass-card p-4">
            <h4 className="font-medium text-white mb-2">For Better Performance:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use "Subtle" glass intensity</li>
              <li>Disable particle effects</li>
              <li>Set animations to "None" or "Reduced"</li>
              <li>Lower blur strength (8-12px)</li>
            </ul>
          </div>
          <div className="glass-card p-4">
            <h4 className="font-medium text-white mb-2">For Best Visual Quality:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use "Intense" glass intensity</li>
              <li>Enable all visual effects</li>
              <li>Set animations to "Full"</li>
              <li>Higher blur strength (16-24px)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPresetsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Theme Presets</h3>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(presets).map(([name, preset]) => (
            <GlassCard
              key={name}
              variant="light"
              interactive
              onClick={() => applyPreset(name)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white capitalize">{name}</h4>
                  <p className="text-sm text-white/70">
                    {name === 'minimal' && 'Clean and simple, optimized for performance'}
                    {name === 'standard' && 'Balanced appearance and performance'}
                    {name === 'vibrant' && 'Rich visual effects and animations'}
                    {name === 'performance' && 'Maximum performance, minimal effects'}
                    {name === 'accessibility' && 'Reduced motion and high contrast'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-60" />
                  <div className="w-6 h-6 rounded bg-white/20 backdrop-blur-sm" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-white" />
            <h2 className="text-xl font-semibold text-white">Glass Theme Settings</h2>
          </div>
          <GlassButton variant="light" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </GlassButton>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 glass-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
            {activeTab === 'presets' && renderPresetsTab()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <GlassButton
            variant="light"
            onClick={resetToDefaults}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </GlassButton>
          <div className="flex space-x-2">
            <GlassButton variant="light" onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton variant="medium" onClick={onClose}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </GlassButton>
          </div>
        </div>
      </div>
    </GlassModal>
  );
};