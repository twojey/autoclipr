import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'relative w-full transition-all duration-300 font-medium bg-gradient-to-br from-light-background-tertiary via-light-background-elevated to-light-background-tertiary dark:from-dark-background-tertiary dark:via-dark-background-elevated dark:to-dark-background-tertiary',
  {
    variants: {
      variant: {
        default: [
          'border-2 border-light-background-tertiary dark:border-dark-background-tertiary',
          'shadow-[inset_4px_4px_8px_#b8b9be,_inset_-4px_-4px_8px_#ffffff]',
          'dark:shadow-[inset_4px_4px_8px_#0f172a,_inset_-4px_-4px_8px_#1e293b]',
          'focus:border-primary-500 dark:focus:border-primary-400',
          'focus:shadow-[0_0_0_2px_rgba(var(--primary-rgb),0.2)]',
          'placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary'
        ],
        filled: [
          'bg-light-background-tertiary dark:bg-dark-background-tertiary',
          'border-2 border-transparent',
          'shadow-[inset_4px_4px_8px_#b8b9be,_inset_-4px_-4px_8px_#ffffff]',
          'dark:shadow-[inset_4px_4px_8px_#0f172a,_inset_-4px_-4px_8px_#1e293b]',
          'focus:border-primary-500 dark:focus:border-primary-400',
          'focus:shadow-[0_0_0_2px_rgba(var(--primary-rgb),0.2)]',
          'placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary'
        ],
        outline: [
          'bg-transparent',
          'border-2 border-light-text-tertiary dark:border-dark-text-tertiary',
          'focus:border-primary-500 dark:focus:border-primary-400',
          'focus:shadow-[0_0_0_2px_rgba(var(--primary-rgb),0.2)]',
          'placeholder:text-light-text-tertiary dark:placeholder:text-dark-text-tertiary'
        ],
      },
      inputSize: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-11 px-4 text-base rounded-xl',
        lg: 'h-13 px-6 text-lg rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
);

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
