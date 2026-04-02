import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-foreground/80">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'h-12 px-4 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all',
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-destructive">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm text-foreground/80">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'min-h-[100px] p-4 rounded-xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none',
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-sm text-destructive">{error}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
