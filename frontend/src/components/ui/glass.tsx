import React, { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useGlassmorphism, GlassVariant, GlassSize, GlassShape } from '../../hooks/useGlassmorphism';
import { clsx } from 'clsx';

// Base Glass Container
interface GlassContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  size?: GlassSize;
  shape?: GlassShape;
  interactive?: boolean;
  floating?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
  ({ 
    variant = 'medium',
    size = 'md',
    shape = 'glass',
    interactive = false,
    floating = false,
    shimmer = false,
    glow = false,
    className,
    children,
    ...props
  }, ref) => {
    const { container, content, overlay } = useGlassmorphism({
      variant,
      size,
      shape,
      interactive,
      floating,
      shimmer,
      glow,
      className,
    });

    return (
      <div ref={ref} className={container} {...props}>
        <div className={overlay} />
        <div className={content}>
          {children}
        </div>
      </div>
    );
  }
);

GlassContainer.displayName = 'GlassContainer';

// Animated Glass Container
interface AnimatedGlassContainerProps extends HTMLMotionProps<'div'> {
  variant?: GlassVariant;
  size?: GlassSize;
  shape?: GlassShape;
  interactive?: boolean;
  floating?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const AnimatedGlassContainer = forwardRef<HTMLDivElement, AnimatedGlassContainerProps>(
  ({ 
    variant = 'medium',
    size = 'md',
    shape = 'glass',
    interactive = false,
    floating = false,
    shimmer = false,
    glow = false,
    className,
    children,
    initial = { opacity: 0, y: 20 },
    animate = { opacity: 1, y: 0 },
    transition = { duration: 0.3 },
    ...props
  }, ref) => {
    const { container, content, overlay } = useGlassmorphism({
      variant,
      size,
      shape,
      interactive,
      floating,
      shimmer,
      glow,
      className,
    });

    return (
      <motion.div
        ref={ref}
        className={container}
        initial={initial}
        animate={animate}
        transition={transition}
        {...props}
      >
        <div className={overlay} />
        <div className={content}>
          {children}
        </div>
      </motion.div>
    );
  }
);

AnimatedGlassContainer.displayName = 'AnimatedGlassContainer';

// Glass Card
interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  interactive?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    variant = 'medium',
    interactive = true,
    header,
    footer,
    className,
    children,
    ...props
  }, ref) => {
    const { container, content } = useGlassmorphism({
      variant,
      size: 'md',
      shape: 'glass',
      interactive,
      className,
    });

    return (
      <div ref={ref} className={container} {...props}>
        {header && (
          <div className="border-b border-white/10 pb-4 mb-4">
            {header}
          </div>
        )}
        <div className={content}>
          {children}
        </div>
        {footer && (
          <div className="border-t border-white/10 pt-4 mt-4">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Glass Button
interface GlassButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: GlassVariant;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    variant = 'light',
    size = 'md',
    disabled = false,
    loading = false,
    className,
    children,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const { container } = useGlassmorphism({
      variant,
      size: 'sm',
      shape: 'rounded',
      interactive: !disabled && !loading,
      className: clsx(
        'inline-flex items-center justify-center font-medium text-white',
        sizeClasses[size],
        {
          'opacity-50 cursor-not-allowed': disabled || loading,
          'cursor-pointer': !disabled && !loading,
        },
        className
      ),
    });

    return (
      <button
        ref={ref}
        className={container}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
        )}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

// Glass Input
interface GlassInputProps extends HTMLAttributes<HTMLInputElement> {
  variant?: GlassVariant;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ 
    variant = 'light',
    type = 'text',
    className,
    ...props
  }, ref) => {
    const { container } = useGlassmorphism({
      variant,
      size: 'sm',
      shape: 'rounded',
      className: clsx(
        'w-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15',
        className
      ),
    });

    return (
      <input
        ref={ref}
        type={type}
        className={container}
        {...props}
      />
    );
  }
);

GlassInput.displayName = 'GlassInput';

// Glass Modal
interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GlassModal: React.FC<GlassModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className={clsx('modal-content', sizeClasses[size])}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
};

// Glass Navigation
interface GlassNavProps extends HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const GlassNav = forwardRef<HTMLElement, GlassNavProps>(
  ({ className, children, ...props }, ref) => {
    const { container } = useGlassmorphism({
      variant: 'medium',
      size: 'sm',
      shape: 'rounded',
      className: clsx('nav-glass', className),
    });

    return (
      <nav ref={ref} className={container} {...props}>
        {children}
      </nav>
    );
  }
);

GlassNav.displayName = 'GlassNav';

// Glass Sidebar
interface GlassSidebarProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassSidebar = forwardRef<HTMLDivElement, GlassSidebarProps>(
  ({ className, children, ...props }, ref) => {
    const { container } = useGlassmorphism({
      variant: 'heavy',
      size: 'md',
      shape: 'glass',
      className: clsx('glass-sidebar h-full', className),
    });

    return (
      <div ref={ref} className={container} {...props}>
        {children}
      </div>
    );
  }
);

GlassSidebar.displayName = 'GlassSidebar';

// Glass Badge
interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: GlassVariant;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  children: React.ReactNode;
}

export const GlassBadge = forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ 
    variant = 'light',
    color = 'blue',
    className,
    children,
    ...props
  }, ref) => {
    const colorClasses = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
      green: 'bg-green-500/20 border-green-500/30 text-green-200',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
      red: 'bg-red-500/20 border-red-500/30 text-red-200',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-200',
    };

    const { container } = useGlassmorphism({
      variant,
      size: 'sm',
      shape: 'rounded',
      className: clsx(
        'inline-flex items-center px-2 py-1 text-xs font-medium',
        colorClasses[color],
        className
      ),
    });

    return (
      <span ref={ref} className={container} {...props}>
        {children}
      </span>
    );
  }
);

GlassBadge.displayName = 'GlassBadge';