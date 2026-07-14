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
      className={`slot pixel-corners flex items-center justify-center shrink-0 ${
        highlight ? "slot-highlight" : ""
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
