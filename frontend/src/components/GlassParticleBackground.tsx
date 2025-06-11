import React, { useEffect, useRef, useState } from 'react';
import { useGlassTheme } from '../contexts/GlassThemeContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface GlassParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  enableInteraction?: boolean;
}

export const GlassParticleBackground: React.FC<GlassParticleBackgroundProps> = ({
  className = '',
  particleCount = 50,
  enableInteraction = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const { config } = useGlassTheme();

  // Particle colors based on theme
  const particleColors = [
    'rgba(59, 130, 246, 0.6)',   // Blue
    'rgba(147, 51, 234, 0.6)',   // Purple
    'rgba(236, 72, 153, 0.6)',   // Pink
    'rgba(34, 197, 94, 0.6)',    // Green
    'rgba(251, 191, 36, 0.6)',   // Yellow
  ];

  // Initialize particles
  const initParticles = () => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
    particlesRef.current = particles;
  };

  // Create a single particle
  const createParticle = (): Particle => {
    const life = Math.random() * 300 + 200;
    return {
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      life,
      maxLife: life,
    };
  };

  // Update particle positions and properties
  const updateParticles = () => {
    particlesRef.current.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update life
      particle.life--;

      // Fade out as life decreases
      particle.opacity = (particle.life / particle.maxLife) * 0.5;

      // Mouse interaction
      if (enableInteraction) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += (dx / distance) * force * 0.01;
          particle.vy += (dy / distance) * force * 0.01;
        }
      }

      // Boundary wrapping
      if (particle.x < 0) particle.x = dimensions.width;
      if (particle.x > dimensions.width) particle.x = 0;
      if (particle.y < 0) particle.y = dimensions.height;
      if (particle.y > dimensions.height) particle.y = 0;

      // Respawn particle if life is over
      if (particle.life <= 0) {
        particlesRef.current[index] = createParticle();
      }
    });
  };

  // Draw particles on canvas
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    particlesRef.current.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });

    // Draw connections between nearby particles
    if (config.enableGradients) {
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 80) {
            ctx.save();
            ctx.globalAlpha = (80 - distance) / 80 * 0.2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });
    }
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    updateParticles();
    drawParticles(ctx);

    animationRef.current = requestAnimationFrame(animate);
  };

  // Handle mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // Handle window resize
  const handleResize = () => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  // Setup canvas and start animation
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    initParticles();

    if (config.enableParticles && config.animations !== 'none') {
      animate();
    }

    if (enableInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dimensions, config.enableParticles, config.animations, enableInteraction]);

  // Don't render if particles are disabled
  if (!config.enableParticles) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        opacity: config.animations === 'none' ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out',
      }}
    />
  );
};

// Floating geometric shapes component
export const GlassFloatingShapes: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { config } = useGlassTheme();

  if (!config.enableParticles || config.animations === 'none') {
    return null;
  }

  const shapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute opacity-10"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            animationDelay: `${shape.delay}s`,
            animationDuration: `${shape.duration}s`,
          }}
        >
          {shape.id % 3 === 0 && (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-float blur-sm" />
          )}
          {shape.id % 3 === 1 && (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rotate-45 animate-float blur-sm" />
          )}
          {shape.id % 3 === 2 && (
            <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-lg animate-float blur-sm" 
                 style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          )}
        </div>
      ))}
    </div>
  );
};