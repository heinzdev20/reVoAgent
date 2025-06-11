import { useMemo } from 'react';
import { clsx } from 'clsx';

export type GlassVariant = 'light' | 'medium' | 'heavy' | 'dark';
export type GlassSize = 'sm' | 'md' | 'lg' | 'xl';
export type GlassShape = 'rounded' | 'glass' | 'glass-lg' | 'glass-xl';

interface GlassOptions {
  variant?: GlassVariant;
  size?: GlassSize;
  shape?: GlassShape;
  interactive?: boolean;
  floating?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  className?: string;
}

interface GlassStyles {
  container: string;
  content: string;
  overlay: string;
}

export const useGlassmorphism = (options: GlassOptions = {}): GlassStyles => {
  const {
    variant = 'medium',
    size = 'md',
    shape = 'glass',
    interactive = false,
    floating = false,
    shimmer = false,
    glow = false,
    className = '',
  } = options;

  const styles = useMemo(() => {
    // Base glass classes
    const baseClasses = {
      light: 'glass-light',
      medium: 'glass-medium',
      heavy: 'glass-heavy',
      dark: 'glass-dark',
    };

    // Size classes
    const sizeClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    // Shape classes
    const shapeClasses = {
      rounded: 'rounded-lg',
      glass: 'rounded-glass',
      'glass-lg': 'rounded-glass-lg',
      'glass-xl': 'rounded-glass-xl',
    };

    // Interactive effects
    const interactiveClasses = interactive
      ? 'cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-glass-lg hover:-translate-y-1 active:scale-95'
      : 'transition-all duration-300';

    // Special effects
    const effectClasses = clsx({
      'animate-float': floating,
      'glass-shimmer': shimmer,
      'animate-glow': glow,
    });

    const container = clsx(
      baseClasses[variant],
      sizeClasses[size],
      shapeClasses[shape],
      interactiveClasses,
      effectClasses,
      className
    );

    const content = 'relative z-10';
    const overlay = 'absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-inherit';

    return {
      container,
      content,
      overlay,
    };
  }, [variant, size, shape, interactive, floating, shimmer, glow, className]);

  return styles;
};

// Predefined glass configurations
export const glassPresets = {
  card: {
    variant: 'medium' as GlassVariant,
    size: 'md' as GlassSize,
    shape: 'glass' as GlassShape,
    interactive: true,
  },
  panel: {
    variant: 'heavy' as GlassVariant,
    size: 'lg' as GlassSize,
    shape: 'glass-lg' as GlassShape,
  },
  sidebar: {
    variant: 'heavy' as GlassVariant,
    size: 'md' as GlassSize,
    shape: 'glass' as GlassShape,
  },
  header: {
    variant: 'medium' as GlassVariant,
    size: 'sm' as GlassSize,
    shape: 'rounded' as GlassShape,
  },
  modal: {
    variant: 'heavy' as GlassVariant,
    size: 'xl' as GlassSize,
    shape: 'glass-xl' as GlassShape,
  },
  button: {
    variant: 'light' as GlassVariant,
    size: 'sm' as GlassSize,
    shape: 'rounded' as GlassShape,
    interactive: true,
  },
  floating: {
    variant: 'medium' as GlassVariant,
    size: 'md' as GlassSize,
    shape: 'glass' as GlassShape,
    floating: true,
    shimmer: true,
  },
  glow: {
    variant: 'medium' as GlassVariant,
    size: 'md' as GlassSize,
    shape: 'glass' as GlassShape,
    glow: true,
  },
};

// Utility function to get preset styles
export const useGlassPreset = (preset: keyof typeof glassPresets, overrides: Partial<GlassOptions> = {}) => {
  return useGlassmorphism({ ...glassPresets[preset], ...overrides });
};

// Color-specific glass variants
export const useColoredGlass = (color: 'blue' | 'purple' | 'green' | 'red' | 'yellow', options: GlassOptions = {}) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
  };

  return useGlassmorphism({
    ...options,
    className: clsx(colorClasses[color], options.className),
  });
};

// Responsive glass hook
export const useResponsiveGlass = (
  mobile: GlassOptions,
  tablet: GlassOptions = mobile,
  desktop: GlassOptions = tablet
) => {
  const mobileStyles = useGlassmorphism(mobile);
  const tabletStyles = useGlassmorphism(tablet);
  const desktopStyles = useGlassmorphism(desktop);

  return {
    mobile: mobileStyles,
    tablet: tabletStyles,
    desktop: desktopStyles,
    responsive: clsx(
      mobileStyles.container,
      `md:${tabletStyles.container}`,
      `lg:${desktopStyles.container}`
    ),
  };
};