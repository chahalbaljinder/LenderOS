import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'fade' | 'slide' | 'zoom';
  delay?: number;
  duration?: number;
}

export function PageTransition({ 
  children, 
  className, 
  mode = 'fade',
  delay = 0,
  duration = 300,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  const baseStyles = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
  };
  
  const modeStyles = {
    fade: {},
    slide: {
      transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
    },
    zoom: {
      transform: isVisible ? 'scale(1)' : 'scale(0.96)',
    },
  };
  
  return (
    <div 
      className={cn('animate-in', className)}
      style={{
        ...baseStyles,
        ...modeStyles[mode],
      }}
    >
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  direction?: 'vertical' | 'horizontal';
}

export function StaggeredList({ 
  children, 
  className, 
  staggerDelay = 50,
  direction = 'vertical',
}: StaggeredListProps) {
  return (
    <div className={cn('flex', direction === 'vertical' ? 'flex-col' : 'flex-row', className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        
        const childProps = child.props as Record<string, unknown>;
        const childStyle = childProps.style as React.CSSProperties | undefined;
        return React.cloneElement(child as React.ReactElement<any>, {
          style: {
            ...childStyle,
            opacity: 0,
            animation: `fadeIn ${300}ms ease-out ${index * staggerDelay}ms forwards`,
            transform: direction === 'vertical' ? 'translateY(16px)' : 'translateX(-16px)',
          } as React.CSSProperties,
        });
      })}
    </div>
  );
}

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 1 | 2 | 3;
}

export function HoverCard({ children, className, elevation = 1 }: HoverCardProps) {
  return (
    <div 
      className={cn(
        'transition-all duration-300',
        'hover:shadow-lg',
        elevation === 1 && 'hover:shadow-primary/5 hover:border-primary/20',
        elevation === 2 && 'hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 -translate-y-1',
        elevation === 3 && 'hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 -translate-y-2 scale-[1.01]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function FocusRing({ children, className }: { children: React.ReactElement; className?: string }) {
  const child = children as React.ReactElement<any>;
  return React.cloneElement(child, {
    className: cn(
      child.props.className,
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      className
    ),
  });
}

export function RippleEffect({ children, className }: { children: React.ReactElement; className?: string }) {
  const [ripples, setRipples] = React.useState<{ x: number; y: number; id: number }[]>([]);
  
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(prev => [...prev, { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top, 
      id 
    }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  };
  
  return (
    <div 
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
    >
      {children}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute rounded-full bg-primary/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
          }}
        />
      ))}
    </div>
  );
}

// CSS keyframes for ripple (add to global CSS)
// @keyframes ripple {
//   0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
//   100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
// }