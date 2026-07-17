"use client";

import { useId } from "react";

export interface FormFieldProps {
  type: "text" | "email" | "tel" | "select" | "textarea" | "date" | "number";
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
  rows?: number;
  min?: number;
}

export function FormField({
  type,
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  helpText,
  placeholder,
  options = [],
  rows = 3,
  min,
}: FormFieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [error && errorId, helpText && helpId]
    .filter(Boolean)
    .join(" ") || undefined;

  const baseInputClasses = `w-full rounded-md border px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-blue ${
    error ? "border-error" : "border-neutral-100"
  }`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-800">
        {label}
        {required && <span className="text-error"> *</span>}
      </label>

      {type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={baseInputClasses}
        >
          <option value="" disabled>
            {placeholder ?? "Selecciona una opción"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          placeholder={placeholder}
          rows={rows}
          className={baseInputClasses}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          placeholder={placeholder}
          min={min}
          className={baseInputClasses}
        />
      )}

      {helpText && !error && (
        <p id={helpId} className="text-xs text-neutral-600">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
}
