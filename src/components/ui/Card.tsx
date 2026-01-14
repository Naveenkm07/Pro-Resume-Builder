import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "blue" | "gold" | "green" | false;
  onClick?: () => void;
};

const Card: React.FC<CardProps> = ({ children, className = "", glow = false, onClick }) => {
  const glowClass = glow ? `glow-${glow} hover:glow-${glow}` : "";
  
  return (
    <div
      className={`rounded-xl p-6 transition-all duration-300 bg-card border border-border ${glowClass} ${
        onClick ? "cursor-pointer hover:scale-[1.02]" : ""
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

