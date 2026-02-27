import { App, Button, Dropdown, Space, Tag, Typography, type MenuProps } from "antd";
import { LogoutOutlined, MedicineBoxOutlined, UserOutlined } from "@ant-design/icons";
import { useMe } from "../../hooks/useMe";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { useThemeMode } from "../../contexts/themeMode";

type NavbarProps = {
  compact?: boolean;
};

export default function Navbar({ compact = false }: NavbarProps) {
  const { message } = App.useApp();
  const { data: me } = useMe();
  const { data: profile } = useProfile();
  const { logout } = useAuth();
  const confirmDialog = useConfirmDialog();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const handleLogout = () => {
    confirmDialog({
      title: "Confirm Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      danger: true,
      onConfirm: async () => {
        try {
          await logout();
          message.success("Logged out successfully");
        } catch {
          message.error("Logout failed. Please try again.");
        }
      },
    });
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span style={{ fontWeight: 600 }}>Logout</span>,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
      <Space size={compact ? 8 : 10} style={{ minWidth: 0 }}>
        <div
          style={{
            width: compact ? 32 : 36,
            height: compact ? 32 : 36,
            borderRadius: 10,
            background: "linear-gradient(135deg, #1E6F5C 0%, #155847 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow: "0 6px 14px rgba(30, 111, 92, 0.28)",
            flexShrink: 0,
          }}
        >
          <MedicineBoxOutlined style={{ fontSize: compact ? 16 : 18 }} />
        </div>
        <Typography.Title
          level={5}
          style={{
            margin: 0,
            color: isDark ? "#E2E8F0" : "#102A43",
            maxWidth: compact ? 120 : "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {compact ? "MedBill" : "Medicine Billing Management"}
        </Typography.Title>
      </Space>

      <Space size={compact ? 8 : 12}>
        <div style={{ lineHeight: 1.1, minWidth: 0 }}>
          <Typography.Text
            strong
            style={{ display: "block", textAlign: "right", color: isDark ? "#E2E8F0" : "#0F172A" }}
          >
            {me?.name || profile?.name || "User"}
          </Typography.Text>
          <div>
            <Tag color="green" style={{ marginTop: 4, borderRadius: 999 }}>
              {me?.role || "USER"}
            </Tag>
          </div>
        </div>

        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
          overlayStyle={{ minWidth: 160 }}
        >
          <Button
            type="text"
            shape="circle"
            icon={<UserOutlined />}
            aria-label="Open user menu"
            style={{
              width: compact ? 36 : 40,
              height: compact ? 36 : 40,
              border: isDark ? "1px solid #334155" : "1px solid #d9e2ec",
              color: isDark ? "#38BDF8" : "#1E6F5C",
              background: isDark ? "#0F172A" : "#fff",
            }}
          />
        </Dropdown>
      </Space>
    </div>
  );
}
