import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const headingVariants = cva(
  'font-display leading-tight tracking-tight',
  {
    variants: {
      level: {
        h1: 'text-4xl font-bold',
        h2: 'text-3xl font-bold',
        h3: 'text-2xl font-bold',
        h4: 'text-xl font-bold',
        h5: 'text-lg font-bold',
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
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'base',
    },
  }
);

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
type HeadingTag = Extract<keyof JSX.IntrinsicElements, HeadingLevel>;

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>, 
  Omit<VariantProps<typeof headingVariants>, 'level'> {
  level?: HeadingLevel;
  as?: HeadingLevel;
}

interface TextProps 
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(({
  level = 'h1',
  gradient = false,
  className,
  as,
  children,
  ...props
}, ref) => {
  const Tag = (as || level) as HeadingTag;
  
  return (
    <Tag
      ref={ref}
      className={cn(headingVariants({ level, gradient }), className)}
      {...props}
    >
      {children}
    </Tag>
  );
});

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(({
  variant,
  size,
  className,
  children,
  ...props
}, ref) => {
  return (
    <p
      className={cn(textVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </p>
  );
});

Heading.displayName = 'Heading';
Text.displayName = 'Text';
