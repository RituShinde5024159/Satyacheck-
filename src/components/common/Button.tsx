import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#155E59] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#155E59] text-white hover:bg-[#0F4541] active:bg-[#0C3835] shadow-xs',
    secondary: 'bg-[#E8ECE9] text-[#202B2A] hover:bg-[#DCE1DE] active:bg-[#CED5D1]',
    outline: 'border border-[#155E59] text-[#155E59] bg-transparent hover:bg-[#155E59]/5 active:bg-[#155E59]/10',
    subtle: 'bg-[#E4F2E9] text-[#155E59] hover:bg-[#D5EBDC] active:bg-[#C5E4CD]',
    ghost: 'text-[#202B2A] bg-transparent hover:bg-[#E8ECE9]/70 active:bg-[#E8ECE9]',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
