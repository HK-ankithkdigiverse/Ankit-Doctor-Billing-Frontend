import { Typography } from "antd";
import type { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

const SectionTitle = ({ children, className = "" }: SectionTitleProps) => {
  return (
    <Typography.Title level={4} className={`!m-0 text-slate-900 ${className}`.trim()}>
      {children}
    </Typography.Title>
  );
};

export default SectionTitle;

