import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700",
        secondary: "bg-light-background-elevated hover:bg-light-background-hover dark:bg-dark-background-elevated dark:hover:bg-dark-background-hover text-light-text-primary dark:text-dark-text-primary",
        outline: "border border-light-border dark:border-dark-border bg-transparent hover:bg-light-background-hover dark:hover:bg-dark-background-hover text-light-text-primary dark:text-dark-text-primary",
        ghost: "hover:bg-light-background-hover dark:hover:bg-dark-background-hover text-light-text-primary dark:text-dark-text-primary",
        destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
      },
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-6 py-3",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, 
  variant, 
  size, 
  children,
  ...props 
}, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
