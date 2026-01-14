import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: "purple" | "blue" | "gold";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  glow,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) => {
  const baseClasses = "font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-gradient-to-r text-white transition-all",
    secondary: "bg-dark-card text-white border border-dark-border-light hover:bg-dark-surface",
    ghost: "text-gray-300 hover:text-white hover:bg-dark-surface",
  };

  const primaryStyle = {
    background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const glowClass = glow ? `glow-${glow}` : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClass} ${className}`}
      style={variant === 'primary' && !disabled ? primaryStyle : (variant === 'primary' ? { background: 'var(--color-primary)' } : undefined)}
    >
      {children}
    </button>
  );
};

export default Button;

