import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Tag, Typography } from "antd";
import {
  EditOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  MoonOutlined,
  NumberOutlined,
  PhoneOutlined,
  ShopOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { useThemeMode } from "../../contexts/themeMode";
import { getUploadFileUrl } from "../../utils/company";

type InfoItem = {
  key: string;
  label: string;
  value: ReactNode;
  icon: ReactNode;
};

const formatRoleLabel = (role?: string) => {
  const normalized = String(role || "").toUpperCase();
  if (normalized === "ADMIN") return "Admin";
  if (normalized === "USER") return "User";
  return role || "User";
};

export default function Profile() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useProfile();
  const { logout, loading: authLoading } = useAuth();
  const confirmDialog = useConfirmDialog();
  const { mode, toggleMode } = useThemeMode();

  if (isLoading) return <p>Loading...</p>;
  if (!user) return null;

  const normalizedRole = String(user.role || "").toUpperCase();
  const isAdmin = normalizedRole === "ADMIN";

  const uploadedImage = getUploadFileUrl((user as any)?.profileImage || (user as any)?.avatar || (user as any)?.image);
  const fallbackName = encodeURIComponent(user.name || "User");
  const profileImage =
    uploadedImage || `https://ui-avatars.com/api/?name=${fallbackName}&background=DBEAFE&color=1E3A8A&size=220`;

  const signatureUrl = getUploadFileUrl(user.signature);
  const roleLabel = formatRoleLabel(user.role);
  const subtitle = isAdmin ? "System Administrator" : user.medicalName || "Medicine Billing User";

  const adminFields: InfoItem[] = [
    { key: "name", label: "Name", value: user.name || "-", icon: <UserOutlined /> },
    { key: "email", label: "Email", value: user.email || "-", icon: <MailOutlined /> },
    { key: "phone", label: "Phone", value: user.phone || "-", icon: <PhoneOutlined /> },
  ];

  const userPersonalFields: InfoItem[] = [
    { key: "name", label: "Name", value: user.name || "-", icon: <UserOutlined /> },
    { key: "email", label: "Email", value: user.email || "-", icon: <MailOutlined /> },
    { key: "phone", label: "Phone", value: user.phone || "-", icon: <PhoneOutlined /> },
  ];

  const userProfessionalFields: InfoItem[] = [
    { key: "Medical", label: "Medical Name", value: user.medicalName || "-", icon: <ShopOutlined /> },
    { key: "address", label: "Address", value: user.address || "-", icon: <EnvironmentOutlined /> },
    { key: "city", label: "City", value: user.city || "-", icon: <EnvironmentOutlined /> },
    { key: "state", label: "State", value: user.state || "-", icon: <EnvironmentOutlined /> },
    { key: "pincode", label: "Pincode", value: user.pincode || "-", icon: <NumberOutlined /> },
    { key: "gst", label: "GST Number", value: user.gstNumber || "-", icon: <IdcardOutlined /> },
    { key: "pan", label: "PAN Number", value: user.panCardNumber || "-", icon: <IdcardOutlined /> },
    {
      key: "signature",
      label: "Signature",
      value: signatureUrl ? (
        <img
          src={signatureUrl}
          alt="Signature"
          style={{ maxWidth: 180, maxHeight: 56, border: "1px solid #dbe3f0", borderRadius: 8, background: "#fff", padding: 4 }}
        />
      ) : (
        "-"
      ),
      icon: <IdcardOutlined />,
    },
  ];

  const rightPanelFields = isAdmin ? adminFields : userProfessionalFields;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <Card
        style={{
          borderRadius: 24,
          border: "1px solid #dbe4ef",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.1)",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: -80,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(16, 185, 129, 0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -100,
              left: -80,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.14)",
            }}
          />

          <div style={{ position: "relative", display: "flex", flexWrap: "wrap" }}>
            <section
              style={{
                flex: "1 1 320px",
                minWidth: 300,
                padding: "28px 24px",
                background: "linear-gradient(145deg, #f3faf7 0%, #f4f8ff 55%, #fffdf7 100%)",
                borderRight: "1px solid #dbe4ef",
              }}
            >
              <Typography.Text style={{ color: "#6b7280", fontSize: 14, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
                User Profile
              </Typography.Text>

              <div style={{ marginTop: 14, display: "flex", gap: 14, alignItems: "center" }}>
                <Avatar
                  size={104}
                  src={profileImage}
                  icon={<UserOutlined />}
                  style={{
                    background: "#e2e8f0",
                    border: "4px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 12px 24px rgba(2, 132, 199, 0.2)",
                    flexShrink: 0,
                  }}
                />

                <div style={{ minWidth: 0 }}>
                  <Typography.Title level={3} style={{ margin: 0, lineHeight: 1.1 }}>
                    {user.name || "-"}
                  </Typography.Title>
                  <Typography.Text style={{ color: "#4b5563", fontWeight: 600, display: "block" }}>{subtitle}</Typography.Text>
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Tag
                  style={{
                    margin: 0,
                    borderRadius: 999,
                    paddingInline: 12,
                    paddingBlock: 4,
                    fontWeight: 600,
                    border: "1px solid #bfdbfe",
                    color: "#1d4ed8",
                    background: "#eff6ff",
                  }}
                >
                  {roleLabel}
                </Tag>
              </div>

              {!isAdmin && (
                <div style={{ marginTop: 18 }}>
                  <Typography.Title level={5} style={{ margin: "0 0 10px" }}>
                    Personal Information
                  </Typography.Title>

                  <div style={{ display: "grid", gap: 10 }}>
                    {userPersonalFields.map((item) => (
                      <div
                        key={item.key}
                        style={{
                          border: "1px solid #dbe4ef",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.9)",
                          padding: "9px 11px",
                        }}
                      >
                        <Typography.Text style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {item.label}
                        </Typography.Text>
                        <div style={{ marginTop: 3 }}>
                          <Typography.Text style={{ color: "#0f172a", fontWeight: 600, wordBreak: "break-word" }}>
                            {item.value}
                          </Typography.Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section style={{ flex: "1 1 420px", minWidth: 320, padding: "28px 24px" }}>
              <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 14 }}>
                {isAdmin ? "Personal Information" : "Professional Information"}
              </Typography.Title>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {rightPanelFields.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      background: "#fff",
                      padding: "10px 12px",
                      minHeight: 82,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          background: "#f1f5f9",
                          color: "#475569",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                        }}
                      >
                        {item.icon}
                      </span>
                      <Typography.Text style={{ color: "#475569", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.6 }}>
                        {item.label}
                      </Typography.Text>
                    </div>
                    {typeof item.value === "string" ? (
                      <Typography.Text
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#0f172a",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value}
                      </Typography.Text>
                    ) : (
                      item.value
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Button
          icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleMode}
          style={{
            borderRadius: 10,
            borderColor: mode === "dark" ? "#38BDF8" : "#2563eb",
            color: mode === "dark" ? "#38BDF8" : "#2563eb",
            fontWeight: 600,
          }}
        >
          {mode === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>

        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(ROUTES.EDITPROFILE)} style={{ borderRadius: 10 }}>
          Edit Profile
        </Button>

        <Button icon={<LockOutlined />} onClick={() => navigate(ROUTES.CHANGE_PASSWORD)} style={{ borderRadius: 10 }}>
          Change Password
        </Button>

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          loading={authLoading}
          style={{ borderRadius: 10 }}
          onClick={() =>
            confirmDialog({
              title: "Confirm Logout",
              message: "Are you sure you want to logout from your account?",
              confirmText: "Confirm",
              onConfirm: () => logout(),
            })
          }
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
