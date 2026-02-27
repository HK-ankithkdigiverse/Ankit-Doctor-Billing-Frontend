import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Button, Card, Typography } from "antd";
import {
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCompany } from "../../hooks/useCompanies";
import { getCompanyDisplayName, getCompanyLogoUrl } from "../../utils/company";
import { useThemeMode } from "../../contexts/themeMode";

type DetailField = {
  key: string;
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

const getInitials = (value: string) => {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return "NA";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const { data: company, isLoading } = useCompany(id);
  const logoUrl = useMemo(
    () => getCompanyLogoUrl((company as any)?.logo || (company as any)?.logoUrl || (company as any)?.image),
    [company]
  );
  const [isLogoVisible, setIsLogoVisible] = useState(true);

  useEffect(() => {
    setIsLogoVisible(true);
  }, [logoUrl]);

  if (isLoading) return <p>Loading...</p>;
  if (!company) return <p>Company not found</p>;

  const companyDisplayName = getCompanyDisplayName(company) || "-";
  const avatarText = getInitials(companyDisplayName);
  const avatarSrc = logoUrl && isLogoVisible ? logoUrl : undefined;

  const palette = isDark
    ? {
        panelBg: "rgba(2, 6, 23, 0.78)",
        panelBorder: "rgba(148, 163, 184, 0.35)",
        panelShadow: "0 14px 32px rgba(2, 6, 23, 0.42)",
        title: "#f8fafc",
        subtitle: "#94a3b8",
        iconBg: "rgba(30, 41, 59, 0.9)",
        iconColor: "#cbd5e1",
        avatarBg: "#1e3a8a",
        avatarText: "#dbeafe",
        fieldBg: "rgba(15, 23, 42, 0.58)",
        fieldBorder: "rgba(148, 163, 184, 0.34)",
        label: "#94a3b8",
        value: "#f8fafc",
        editBg: "rgba(30, 41, 59, 0.7)",
        editBorder: "rgba(148, 163, 184, 0.45)",
        editText: "#e2e8f0",
      }
    : {
        panelBg: "#ffffff",
        panelBorder: "#dbe4ef",
        panelShadow: "0 12px 28px rgba(15, 23, 42, 0.09)",
        title: "#0f172a",
        subtitle: "#64748b",
        iconBg: "#eef2f7",
        iconColor: "#475569",
        avatarBg: "#dbeafe",
        avatarText: "#1e3a8a",
        fieldBg: "#f8fafc",
        fieldBorder: "#dbe4ef",
        label: "#5b7089",
        value: "#0f172a",
        editBg: "#ffffff",
        editBorder: "#cbd5e1",
        editText: "#334155",
      };

  const fields: DetailField[] = [
    { key: "name", label: "Company Name", value: companyDisplayName, icon: <ShopOutlined /> },
    { key: "gst", label: "GST Number", value: company.gstNumber || "-", icon: <SafetyCertificateOutlined /> },
    { key: "email", label: "Email", value: company.email || "-", icon: <MailOutlined /> },
    { key: "phone", label: "Phone", value: company.phone || "-", icon: <PhoneOutlined /> },
    { key: "address", label: "Address", value: company.address || "-", icon: <EnvironmentOutlined /> },
    { key: "state", label: "State", value: company.state || "-", icon: <EnvironmentOutlined /> },
  ];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <Card
        style={{
          borderRadius: 16,
          background: palette.panelBg,
          border: `1px solid ${palette.panelBorder}`,
          boxShadow: palette.panelShadow,
        }}
        styles={{ body: { padding: 16 } }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <Avatar
              size={52}
              src={avatarSrc}
              icon={<ShopOutlined />}
              onError={() => {
                setIsLogoVisible(false);
                return false;
              }}
              style={{
                background: palette.avatarBg,
                color: palette.avatarText,
                fontWeight: 700,
              }}
            >
              {!avatarSrc ? avatarText : undefined}
            </Avatar>
            <div style={{ minWidth: 0 }}>
              <Typography.Title level={5} style={{ margin: 0, color: palette.title }}>
                Company Details
              </Typography.Title>
              <Typography.Text style={{ color: palette.subtitle, fontSize: 13, fontWeight: 500 }}>
                {companyDisplayName}
              </Typography.Text>
            </div>
          </div>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`${ROUTES.COMPANIES}/${company._id}/edit`)}
            style={{
              borderRadius: 8,
              borderColor: palette.editBorder,
              color: palette.editText,
              background: palette.editBg,
              fontWeight: 600,
              height: 32,
            }}
          >
            Edit
          </Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {fields.map((item) => (
            <div
              key={item.key}
              style={{
                border: `1px solid ${palette.fieldBorder}`,
                borderRadius: 10,
                background: palette.fieldBg,
                padding: "9px 10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    background: palette.iconBg,
                    color: palette.iconColor,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </span>
                <Typography.Text style={{ color: palette.label, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {item.label}
                </Typography.Text>
              </div>
              {typeof item.value === "string" ? (
                <Typography.Text style={{ color: palette.value, fontSize: 14, fontWeight: 600, wordBreak: "break-word" }}>
                  {item.value || "-"}
                </Typography.Text>
              ) : (
                item.value
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
