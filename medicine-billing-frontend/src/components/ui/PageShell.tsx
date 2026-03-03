import type { PropsWithChildren } from "react";

type PageShellProps = PropsWithChildren<{
  radial?: boolean;
  className?: string;
}>;

export default function PageShell({ radial = false, className, children }: PageShellProps) {
  const lightBg = radial ? "bg-radial-brand" : "bg-app-gradient";
  const classes = `rounded-panel p-4 md:p-5 ${lightBg} ${className || ""}`.trim();
  return (
    <div className={classes}>
      {children}
    </div>
  );
}
