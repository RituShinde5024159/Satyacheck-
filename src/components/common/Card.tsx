import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-md transition-all duration-150';

  const variantStyles = {
    default: 'bg-white border border-[#DCE2DF] shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
    subtle: 'bg-[#FAFAF7] border border-[#E3E8E5]',
    bordered: 'bg-white border border-[#D0D7D4]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-6 md:p-8',
  };

  const hoverStyles = hoverEffect ? 'hover:border-[#155E59]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
