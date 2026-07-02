"use client";

import { forwardRef } from "react";
import clsx from "clsx";

const Button = forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-transparent hover:bg-accent text-foreground",
    ghost: "bg-transparent hover:bg-accent text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    premium: "bg-primary text-white shadow-[var(--shadow-primary-glow)] hover:scale-105 hover:bg-primary/90",
  };
  
  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 px-4 text-sm",
    lg: "h-14 px-8 text-lg",
    icon: "h-10 w-10",
  };
  
  return (
    <button
      ref={ref}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button };
