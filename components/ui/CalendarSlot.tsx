"use client";

export interface CalendarSlotProps {
  date: Date;
  time: string;
  status: "available" | "selected" | "booked" | "disabled";
  onSelect?: () => void;
  title?: string;
}

const statusClasses: Record<CalendarSlotProps["status"], string> = {
  available:
    "border border-neutral-100 bg-white text-neutral-800 hover:border-primary-blue hover:text-primary-blue",
  selected: "border border-primary-blue bg-primary-blue text-white",
  booked: "border border-neutral-100 bg-neutral-100 text-neutral-600 cursor-not-allowed",
  disabled: "border border-neutral-100 bg-neutral-50 text-neutral-600/50 cursor-not-allowed",
};

const statusLabel: Partial<Record<CalendarSlotProps["status"], string>> = {
  booked: "Reservado",
};

export function CalendarSlot({ time, status, onSelect, title }: CalendarSlotProps) {
  const isInteractive = status === "available" || status === "selected";

  return (
    <button
      type="button"
      role="button"
      aria-pressed={status === "selected"}
      aria-disabled={!isInteractive}
      disabled={!isInteractive}
      onClick={isInteractive ? onSelect : undefined}
      title={title}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${statusClasses[status]}`}
    >
      {time}
      {statusLabel[status] && (
        <span className="block text-xs">{statusLabel[status]}</span>
      )}
    </button>
  );
}
