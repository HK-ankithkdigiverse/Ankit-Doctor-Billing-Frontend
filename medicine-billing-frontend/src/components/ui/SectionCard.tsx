import { Card } from "antd";
import type { CardProps } from "antd";
import { useThemeMode } from "../../contexts/themeMode";

const SectionCard = ({ className = "", ...props }: CardProps) => {
  const { mode } = useThemeMode();
  const themeClass = mode === "dark" ? "border-slate-700 bg-slate-900/80" : "border-surface-border";

  return (
    <Card
      className={`rounded-card border shadow-panel ${themeClass} ${className}`.trim()}
      {...props}
    />
  );
};

export default SectionCard;
