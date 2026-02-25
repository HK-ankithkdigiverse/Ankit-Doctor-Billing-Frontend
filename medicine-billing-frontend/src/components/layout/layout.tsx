import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Button, Drawer, Grid, Layout as AntLayout } from "antd";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { useThemeMode } from "../../contexts/themeMode";

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      {!isMobile && (
        <Sider
          width={250}
          theme="dark"
          trigger={null}
          style={{
            background: "linear-gradient(180deg, #102A43 0%, #0B2238 100%)",
            borderRight: "1px solid #0f3558",
          }}
        >
          <Sidebar />
        </Sider>
      )}
      <AntLayout>
        <Header
          style={{
            background: isDark ? "#0F172A" : "#fff",
            borderBottom: isDark ? "1px solid #1E293B" : "1px solid #eef2f5",
            paddingInline: isMobile ? 12 : 24,
            height: 64,
            lineHeight: "64px",
            boxShadow: isDark ? "0 2px 10px rgba(2, 6, 23, 0.4)" : "0 2px 10px rgba(15, 23, 42, 0.05)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {isMobile && (
            <Button
              type="text"
              icon={mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Navbar compact={isMobile} />
          </div>
        </Header>
        <Content style={{ padding: "clamp(12px, 2vw, 24px)", background: "transparent" }}>
          <Outlet />
        </Content>
      </AntLayout>
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          width={250}
          closable={false}
          styles={{
            header: { display: "none" },
            body: {
              padding: 0,
              background: isDark
                ? "linear-gradient(180deg, #0B1220 0%, #0F172A 100%)"
                : "linear-gradient(180deg, #102A43 0%, #0B2238 100%)",
            },
          }}
        >
          <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
        </Drawer>
      )}
    </AntLayout>
  );
};

export default Layout;
