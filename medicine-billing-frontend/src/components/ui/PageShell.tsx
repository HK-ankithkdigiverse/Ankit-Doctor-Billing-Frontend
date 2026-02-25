import type { PropsWithChildren } from "react";
import { useThemeMode } from "../../contexts/themeMode";

type PageShellProps = PropsWithChildren<{
  radial?: boolean;
  className?: string;
}>;

const PageShell = ({ radial = false, className, children }: PageShellProps) => {
  const { mode } = useThemeMode();
  const darkBg = radial
    ? "bg-[radial-gradient(circle_at_12%_18%,#0f172a_0%,#111827_34%,#1e1b4b_68%,#0f172a_100%)]"
    : "bg-[linear-gradient(135deg,#0b1120_0%,#111827_45%,#0f172a_100%)]";
  const lightBg = radial ? "bg-radial-brand" : "bg-app-gradient";
  const classes = `rounded-panel p-4 md:p-5 ${mode === "dark" ? darkBg : lightBg} ${className || ""}`.trim();
  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default PageShell;
