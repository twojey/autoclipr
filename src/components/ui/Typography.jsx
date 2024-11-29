import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/styles';

const headingVariants = cva(
  'font-display leading-tight tracking-tight',
  {
    variants: {
      level: {
        h1: 'text-display-1',
        h2: 'text-display-2',
        h3: 'text-heading-1',
        h4: 'text-heading-2',
        h5: 'text-heading-3',
      },
      gradient: {
        true: 'bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent animate-pulse-glow',
        false: '',
      },
    },
    defaultVariants: {
      level: 'h1',
      gradient: false,
    },
  }
);

const textVariants = cva(
  'text-light-text-primary dark:text-dark-text-primary',
  {
    variants: {
      variant: {
        default: '',
        secondary: 'text-light-text-secondary dark:text-dark-text-secondary',
        tertiary: 'text-light-text-tertiary dark:text-dark-text-tertiary',
      },
      size: {
        sm: 'text-body-small',
        base: 'text-body',
        lg: 'text-body-large',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
  }
);

const Heading = React.forwardRef(({
  level = 'h1',
  gradient = false,
  className,
  children,
  ...props
}, ref) => {
  const Component = level;
  return (
    <Component
      className={cn(headingVariants({ level, gradient, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </Component>
  );
});

const Text = React.forwardRef(({
  variant,
  size,
  className,
  children,
  ...props
}, ref) => {
  return (
    <p
      className={cn(textVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
});

Heading.displayName = 'Heading';
Text.displayName = 'Text';

export { Heading, Text, headingVariants, textVariants };
