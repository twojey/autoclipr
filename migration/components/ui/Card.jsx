import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/styles';

const cardVariants = cva(
  'relative bg-gradient-to-br from-light-background-elevated via-light-background-primary to-light-background-elevated dark:from-dark-background-elevated dark:via-dark-background-primary dark:to-dark-background-elevated rounded-2xl transition-all duration-500',
  {
    variants: {
      variant: {
        default: [
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent before:rounded-2xl',
          'after:absolute after:inset-0 after:bg-gradient-to-tl after:from-black/5 after:via-transparent after:to-transparent after:rounded-2xl',
          'shadow-[12px_12px_24px_#b8b9be,_-12px_-12px_24px_#ffffff]',
          'dark:shadow-[12px_12px_24px_#0f172a,_-12px_-12px_24px_#1e293b]',
          'hover:shadow-[16px_16px_32px_#b8b9be,_-16px_-16px_32px_#ffffff] hover:scale-[1.02]',
          'dark:hover:shadow-[16px_16px_32px_#0f172a,_-16px_-16px_32px_#1e293b]',
          'transform perspective-1000 hover:rotate-x-1'
        ],
        interactive: [
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent before:rounded-2xl',
          'after:absolute after:inset-0 after:bg-gradient-to-tl after:from-black/5 after:via-transparent after:to-transparent after:rounded-2xl',
          'shadow-[12px_12px_24px_#b8b9be,_-12px_-12px_24px_#ffffff]',
          'dark:shadow-[12px_12px_24px_#0f172a,_-12px_-12px_24px_#1e293b]',
          'hover:shadow-[16px_16px_32px_#b8b9be,_-16px_-16px_32px_#ffffff] hover:scale-[1.02]',
          'dark:hover:shadow-[16px_16px_32px_#0f172a,_-16px_-16px_32px_#1e293b]',
          'transform perspective-1000 hover:rotate-x-1 hover:-translate-y-2 cursor-pointer',
          'active:scale-[0.98] active:shadow-[8px_8px_16px_#b8b9be,_-8px_-8px_16px_#ffffff]',
          'dark:active:shadow-[8px_8px_16px_#0f172a,_-8px_-8px_16px_#1e293b]'
        ],
        flat: [
          'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:rounded-2xl',
          'after:absolute after:inset-0 after:bg-gradient-to-tl after:from-black/5 after:via-transparent after:to-transparent after:rounded-2xl',
          'border-2 border-light-background-tertiary dark:border-dark-background-tertiary',
          'hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-glow',
          'transform perspective-1000 hover:rotate-x-1 hover:scale-[1.01]'
        ],
      },
      padding: {
        none: '',
        sm: 'p-4 gap-4',
        md: 'p-6 gap-6',
        lg: 'p-8 gap-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

const Card = React.forwardRef(({ className, variant, padding, children, ...props }, ref) => {
  return (
    <div
      className={cn(cardVariants({ variant, padding, className }))}
      ref={ref}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export { Card, cardVariants };
