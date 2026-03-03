import { Card } from "antd";
import type { CardProps } from "antd";

export default function SectionCard({ className = "", ...props }: CardProps) {
  const themeClass = "border-surface-border";

  return (
    <Card
      className={`rounded-card border shadow-panel ${themeClass} ${className}`.trim()}
      {...props}
    />
  );
}
