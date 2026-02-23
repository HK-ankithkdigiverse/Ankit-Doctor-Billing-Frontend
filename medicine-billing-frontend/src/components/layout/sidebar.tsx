import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  BankOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  FileTextOutlined,
  IdcardOutlined,
  PlusSquareFilled,
} from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useMe } from "../../hooks/useMe";

type SidebarProps = {
  onNavigate?: () => void;
};

const Sidebar = ({ onNavigate }: SidebarProps) => {
  const { data, isLoading } = useMe();
  const location = useLocation();
  const navigate = useNavigate();

  const role = data?.role ?? "USER";

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      [
        {
          key: ROUTES.DASHBOARD,
          icon: <DashboardOutlined />,
          label: "Dashboard",
          roles: ["ADMIN", "USER"],
        },
        {
          key: ROUTES.PRODUCTS,
          icon: <MedicineBoxOutlined />,
          label: "Medicines",
          roles: ["ADMIN", "USER"],
        },
        {
          key: ROUTES.COMPANIES,
          icon: <BankOutlined />,
          label: "Companies",
          roles: ["ADMIN", "USER"],
        },
        {
          key: ROUTES.CATEGORIES,
          icon: <AppstoreOutlined />,
          label: "Categories",
          roles: ["ADMIN", "USER"],
        },
        {
          key: ROUTES.BILLING,
          icon: <FileTextOutlined />,
          label: "Billing",
          roles: ["ADMIN", "USER"],
        },
        {
          key: ROUTES.USERS,
          icon: <TeamOutlined />,
          label: "Users",
          roles: ["ADMIN"],
        },
        {
          key: ROUTES.PROFILE,
          icon: <IdcardOutlined />,
          label: "Profile",
          roles: ["ADMIN", "USER"],
        },
      ].filter((item) => item.roles.includes(role)) as MenuProps["items"],
    [role]
  );

  const selectedKey =
    (menuItems || [])
      .map((item: any) => item.key)
      .find((key: string) => location.pathname.startsWith(key)) || ROUTES.DASHBOARD;

  if (isLoading || !data) return null;

  return (
    <div className="medbill-sidebar" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #1b3f60" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "linear-gradient(180deg, #1e7a67 0%, #176254 100%)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 18px rgba(9, 33, 54, 0.28)",
              flexShrink: 0,
            }}
          >
            <PlusSquareFilled style={{ color: "#ffffff", fontSize: 20 }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <Typography.Title level={5} style={{ margin: 0, color: "#ffffff", lineHeight: 1.2 }}>
              MedBill Pro
            </Typography.Title>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <Typography.Text style={{ color: "#9FB3C8", fontSize: 12 }}>Billing & Inventory</Typography.Text>
              <span
                style={{
                  color: "#A7F3D0",
                  background: "rgba(22, 163, 74, 0.18)",
                  border: "1px solid rgba(134, 239, 172, 0.35)",
                  borderRadius: 999,
                  padding: "1px 8px",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Typography.Text style={{ color: "#7FA0BE", fontSize: 11, letterSpacing: 1, padding: "10px 16px 4px" }}>
        MENU
      </Typography.Text>
      <Menu
        className="medbill-sidebar-menu"
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }: { key: string }) => {
          navigate(key);
          onNavigate?.();
        }}
        style={{ borderRight: 0, paddingTop: 6, background: "transparent", paddingInline: 8 }}
      />
    </div>
  );
};

export default Sidebar;
