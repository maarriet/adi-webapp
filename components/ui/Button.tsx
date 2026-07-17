"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  href?: string;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary-blue text-white hover:bg-primary-blue/90 focus-visible:ring-primary-blue",
  secondary:
    "bg-primary-green text-white hover:bg-primary-green/90 focus-visible:ring-primary-green",
  ghost:
    "bg-transparent text-primary-blue border border-primary-blue hover:bg-primary-blue/10 focus-visible:ring-primary-blue",
  danger:
    "bg-error text-white hover:bg-error/90 focus-visible:ring-error",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-sm px-3 py-1.5 gap-1.5",
  md: "text-base px-4 py-2 gap-2",
  lg: "text-lg px-6 py-3 gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  href,
  type = "button",
  onClick,
  className = "",
  children,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    "inline-flex items-center justify-center rounded-md font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "active:scale-[0.98]",
    variantClasses[variant],
    sizeClasses[size],
    isDisabled ? "opacity-50 pointer-events-none" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {!loading && icon}
      {children}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        role="button"
        aria-disabled={isDisabled}
        className={classes}
        onClick={isDisabled ? (event) => event.preventDefault() : onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      role="button"
      aria-disabled={isDisabled}
      className={classes}
      onClick={isDisabled ? undefined : onClick}
    >
      {content}
    </button>
  );
}
