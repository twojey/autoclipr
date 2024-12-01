import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/styles';

const loadingVariants = cva(
  'relative inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        primary: [
          'text-primary-500',
          'dark:text-primary-400'
        ],
        secondary: [
          'text-accent-500',
          'dark:text-accent-400'
        ],
      },
      size: {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

const Loading = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <div
      className={cn(loadingVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      <div className="absolute w-full h-full">
        <div className="w-full h-full rounded-full border-2 border-current opacity-20" />
      </div>
      <div className="absolute w-full h-full animate-spin">
        <div className="w-full h-full rounded-full border-2 border-current border-t-transparent shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
      </div>
    </div>
  );
});

Loading.displayName = 'Loading';

export { Loading, loadingVariants };
