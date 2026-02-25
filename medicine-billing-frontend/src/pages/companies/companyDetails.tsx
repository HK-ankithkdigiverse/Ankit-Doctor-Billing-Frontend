import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Col, Row, Typography } from "antd";
import {
  BankOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCompany } from "../../hooks/useCompanies";
import { getCompanyDisplayName, getCompanyLogoUrl } from "../../utils/company";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import { useThemeMode } from "../../contexts/themeMode";

const CompanyDetails = () => {
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
  const companyDisplayName = getCompanyDisplayName(company) || "-";

  if (isLoading) return <p>Loading...</p>;
  if (!company) return <p>Company not found</p>;

  const palette = isDark
    ? {
        panelBg: "rgba(7, 12, 24, 0.86)",
        cardBorder: "rgba(59, 130, 246, 0.34)",
        cardShadow: "0 20px 55px rgba(2, 6, 23, 0.55)",
        headerBg: "linear-gradient(100deg, #0891b2 0%, #2563eb 100%)",
        headerLine: "rgba(255, 255, 255, 0.22)",
        editBtnBorder: "rgba(255,255,255,0.55)",
        editBtnBg: "rgba(255,255,255,0.12)",
        logoBg: "rgba(15, 23, 42, 0.78)",
        logoBorder: "rgba(34, 211, 238, 0.55)",
        logoFallbackBg: "linear-gradient(135deg, rgba(8,145,178,0.35) 0%, rgba(37,99,235,0.45) 100%)",
        logoFallbackText: "#e2e8f0",
        tileBg: "rgba(15, 23, 42, 0.82)",
        tileAltBg: "rgba(17, 24, 39, 0.84)",
        tileBorder: "rgba(59, 130, 246, 0.34)",
        label: "#cbd5e1",
        value: "#f8fafc",
        primary: "#22d3ee",
        secondary: "#60a5fa",
      }
    : {
        panelBg: "#ffffff",
        cardBorder: "#bfdbfe",
        cardShadow: "0 20px 48px rgba(15, 23, 42, 0.12)",
        headerBg: "linear-gradient(100deg, #0891b2 0%, #2563eb 100%)",
        headerLine: "rgba(255, 255, 255, 0.28)",
        editBtnBorder: "rgba(255,255,255,0.55)",
        editBtnBg: "rgba(255,255,255,0.08)",
        logoBg: "linear-gradient(155deg, #f0f9ff 0%, #eff6ff 100%)",
        logoBorder: "rgba(8, 145, 178, 0.32)",
        logoFallbackBg: "linear-gradient(135deg, rgba(8,145,178,0.2) 0%, rgba(37,99,235,0.26) 100%)",
        logoFallbackText: "#1e293b",
        tileBg: "#ffffff",
        tileAltBg: "#f8fbff",
        tileBorder: "rgba(8, 145, 178, 0.18)",
        label: "#334155",
        value: "#0b1835",
        primary: "#0891b2",
        secondary: "#2563eb",
      };

  const details = [
    {
      label: "Company",
      value: companyDisplayName,
      icon: <BankOutlined />,
      col: 12,
    },
    {
      label: "GST",
      value: company.gstNumber || "-",
      icon: <SafetyCertificateOutlined />,
      col: 12,
    },
    {
      label: "Email",
      value: company.email || "-",
      icon: <MailOutlined />,
      col: 12,
    },
    {
      label: "Phone",
      value: company.phone || "-",
      icon: <PhoneOutlined />,
      col: 12,
    },
    {
      label: "State",
      value: company.state || "-",
      icon: <EnvironmentOutlined />,
      col: 12,
    },
    {
      label: "Address",
      value: company.address || "-",
      icon: <EnvironmentOutlined />,
      col: 24,
    },
  ];

  return (
    <PageShell radial>
      <SectionCard
        bodyStyle={{ padding: 0 }}
        style={{
          borderRadius: 20,
          overflow: "hidden",
          background: palette.panelBg,
          border: `1px solid ${palette.cardBorder}`,
          boxShadow: palette.cardShadow,
        }}
      >
        <div
          style={{
            background: palette.headerBg,
            color: "#fff",
            padding: "22px 24px",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            borderBottom: `1px solid ${palette.headerLine}`,
          }}
        >
          <div>
            <Typography.Title level={4} style={{ margin: 0, color: "#fff" }}>
              Company Details
            </Typography.Title>
            <Typography.Text style={{ color: "rgba(255,255,255,0.96)", fontSize: 18, fontWeight: 700 }}>
              {companyDisplayName}
            </Typography.Text>
          </div>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`${ROUTES.COMPANIES}/${company._id}/edit`)}
            style={{
              borderColor: palette.editBtnBorder,
              color: "#fff",
              background: palette.editBtnBg,
              borderRadius: 12,
              fontWeight: 600,
              paddingInline: 16,
            }}
          >
            Edit
          </Button>
        </div>

        <div style={{ padding: 22 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div
                style={{
                  borderRadius: 16,
                  background: palette.logoBg,
                  border: `1px solid ${palette.logoBorder}`,
                  padding: 20,
                  minHeight: 240,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isDark
                    ? "inset 0 0 0 1px rgba(255,255,255,0.02)"
                    : "0 8px 24px rgba(15, 23, 42, 0.05)",
                }}
              >
                {logoUrl && isLogoVisible ? (
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    style={{ width: 190, maxWidth: "100%", height: 140, objectFit: "contain", borderRadius: 12 }}
                    onError={() => setIsLogoVisible(false)}
                  />
                ) : (
                  <div
                    style={{
                      width: 190,
                      maxWidth: "100%",
                      height: 140,
                      borderRadius: 12,
                      background: palette.logoFallbackBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: palette.logoFallbackText,
                      fontWeight: 700,
                      fontSize: 16,
                      border: `1px dashed ${isDark ? "rgba(255,255,255,0.25)" : "rgba(8,145,178,0.35)"}`,
                    }}
                  >
                    No Logo
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} md={16}>
              <Row gutter={[14, 14]}>
                {details.map((item, idx) => {
                  const accent = idx % 2 === 0 ? palette.primary : palette.secondary;
                  const tileBg = idx % 2 === 0 ? palette.tileBg : palette.tileAltBg;
                  return (
                    <Col xs={24} sm={item.col} key={item.label}>
                      <div
                        style={{
                          borderRadius: 14,
                          border: `1px solid ${palette.tileBorder}`,
                          borderLeft: `4px solid ${accent}`,
                          background: tileBg,
                          padding: "14px 14px",
                          height: "100%",
                          boxShadow: isDark
                            ? "0 8px 20px rgba(2, 6, 23, 0.35)"
                            : "0 8px 20px rgba(15, 23, 42, 0.07)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: palette.label,
                            marginBottom: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span style={{ fontSize: 14, color: accent }}>{item.icon}</span>
                          {item.label}
                        </div>
                        <div
                          style={{
                            color: palette.value,
                            fontSize: 18,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Col>
          </Row>
        </div>
      </SectionCard>
    </PageShell>
  );
};

export default CompanyDetails;
