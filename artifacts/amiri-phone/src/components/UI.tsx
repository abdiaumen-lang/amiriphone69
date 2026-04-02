import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
      outline: 'border-2 border-primary text-primary hover:bg-primary/5',
      ghost: 'hover:bg-secondary text-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-12 px-6 py-2',
      lg: 'h-14 px-8 text-lg font-medium',
      icon: 'h-12 w-12 flex items-center justify-center p-0',
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
        <select
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none cursor-pointer",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        >
          <option value="" disabled hidden>Sélectionner...</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// Badge
export function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default'|'success'|'warning'|'danger'|'outline', className?: string }) {
  const variants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-yellow-500/10 text-yellow-700',
    danger: 'bg-destructive/10 text-destructive',
    outline: 'border border-border text-muted-foreground',
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}

// Card
export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-card rounded-2xl border border-border shadow-sm overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-6 pb-3 border-b border-border/50", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h3 className={cn("text-lg font-bold text-foreground", className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

// Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// Skeletons
export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-2xl border border-border animate-pulse">
      <div className="w-full aspect-[4/5] bg-secondary rounded-xl"></div>
      <div className="space-y-2">
        <div className="h-4 bg-secondary rounded w-3/4"></div>
        <div className="h-4 bg-secondary rounded w-1/2"></div>
      </div>
      <div className="h-10 bg-secondary rounded-xl w-full mt-2"></div>
    </div>
  );
}

// Page Transition Wrapper
export function PageTransition({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
