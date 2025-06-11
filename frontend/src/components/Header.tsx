import React from 'react';
import { Activity, Settings, User, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { GlassContainer, GlassBadge } from './ui/glass';
import { useGlassTheme } from '../contexts/GlassThemeContext';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { config } = useGlassTheme();

  return (
    <header className={clsx('nav-glass', className)}>
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="text-2xl animate-float">🚀</span>
                {config.enableParticles && (
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-blue-300 animate-pulse" />
                )}
              </div>
              <h1 className="text-xl font-bold text-white">reVoAgent</h1>
              <GlassBadge color="blue" className="text-xs">
                v1.0 Production
              </GlassBadge>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <select className="glass-input text-sm py-1 px-2 min-w-0">
                  <option>DeepSeek R1 ▼</option>
                  <option>CodeLlama 70B</option>
                  <option>Mistral 7B</option>
                  <option>Custom Model</option>
                </select>
              </div>
              <div className="flex items-center space-x-1 text-white/90">
                <span>OpenHands</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex items-center space-x-2 text-white/90">
                <div className="status-indicator status-online"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white/90">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm">System Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-white/70 hover:text-white cursor-pointer transition-colors" />
              <GlassContainer 
                variant="light" 
                size="sm" 
                interactive 
                className="flex items-center space-x-2 cursor-pointer px-2 py-1"
              >
                <User className="w-4 h-4 text-white" />
                <span className="text-sm text-white">Admin</span>
              </GlassContainer>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}