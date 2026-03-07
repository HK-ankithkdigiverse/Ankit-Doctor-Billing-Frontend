import { Card, Statistic } from "antd";
import type { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  isCurrency?: boolean;
  isMobile?: boolean;
  index?: number;
};

export default function StatCard({
  title,
  value,
  icon,
  isCurrency = false,
  isMobile = false,
  index = 0,
}: StatCardProps) {
  return (
    <Card
      size="small"
      styles={{ body: { padding: isMobile ? 12 : 14 } }}
      style={{
        width: "100%",
        maxWidth: isMobile ? "100%" : 280,
        background:
          index % 2 === 0
            ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
            : "linear-gradient(135deg, #f8fffc 0%, #edf7f4 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: "rgba(136, 181, 216, 0.16)",
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Statistic
            title={<span style={{ fontSize: isMobile ? 15 : 16 }}>{title}</span>}
            value={value}
            prefix={isCurrency ? "Rs " : undefined}
            precision={isCurrency ? 2 : 0}
            valueStyle={{
              color: "#102A43",
              lineHeight: 1.1,
              fontWeight: 430,
              fontSize: isMobile ? 20 : 24,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
