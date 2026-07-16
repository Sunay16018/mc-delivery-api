import { ReactNode } from "react";

export function Slot({
  children,
  size = 56,
  highlight = false,
  className = "",
}: {
  children?: ReactNode;
  size?: number;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`card rounded-xl flex items-center justify-center shrink-0 ${
        highlight ? "card-highlight" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
