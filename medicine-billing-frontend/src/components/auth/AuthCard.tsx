import type { ReactNode } from "react";
import { Card, ConfigProvider, Typography } from "antd";
import { authPageBackground, authPageCardBase, authPageTheme } from "../../theme/authPageTheme";

interface AuthCardProps {
  title: string;
  subtitle: string;
  maxWidth?: number;
  children: ReactNode;
}

export default function AuthCard({ title, subtitle, maxWidth = 420, children }: AuthCardProps) {
  return (
    <ConfigProvider theme={authPageTheme}>
      <div style={authPageBackground}>
        <Card style={{ ...authPageCardBase, maxWidth }}>
          <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
            {title}
          </Typography.Title>
          <Typography.Paragraph style={{ textAlign: "center", color: "#64748b", marginBottom: 20 }}>
            {subtitle}
          </Typography.Paragraph>
          {children}
        </Card>
      </div>
    </ConfigProvider>
  );
}
