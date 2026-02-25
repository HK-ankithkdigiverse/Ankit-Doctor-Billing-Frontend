import { useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Descriptions, Space, Tag, Typography } from "antd";
import { EditOutlined, LockOutlined, LogoutOutlined, MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../hooks/useAuth";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { useThemeMode } from "../../contexts/themeMode";

const Profile = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useProfile();
  const { logout, loading: authLoading } = useAuth();
  const confirmDialog = useConfirmDialog();
  const { mode, toggleMode } = useThemeMode();

  if (isLoading) return <p>Loading...</p>;
  if (!user) return null;

  return (
    <Card style={{ maxWidth: 760, margin: "0 auto" }}>
      <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
        <Space>
          <Avatar size={72} icon={<UserOutlined />} style={{ backgroundColor: "#1E6F5C" }} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {user.name}
            </Typography.Title>
            <Typography.Text type="secondary">{user.email}</Typography.Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="green">{user.role}</Tag>
            </div>
          </div>
        </Space>
      </Space>

      <Descriptions style={{ marginTop: 20 }} column={1} bordered size="small">
        <Descriptions.Item label="Medical Name">{user.medicalName || "-"}</Descriptions.Item>
        <Descriptions.Item label="Phone">{user.phone || "-"}</Descriptions.Item>
        <Descriptions.Item label="Address">{user.address || "-"}</Descriptions.Item>
        <Descriptions.Item label="State">{user.state || "-"}</Descriptions.Item>
        <Descriptions.Item label="City">{user.city || "-"}</Descriptions.Item>
        <Descriptions.Item label="Pincode">{user.pincode || "-"}</Descriptions.Item>
        <Descriptions.Item label="GST Number">{user.gstNumber || "-"}</Descriptions.Item>
        <Descriptions.Item label="PAN Card Number">{user.panCardNumber || "-"}</Descriptions.Item>
      </Descriptions>

      <Space style={{ marginTop: 16 }}>
        <Button
          icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleMode}
          style={{
            borderColor: mode === "dark" ? "#38BDF8" : "#4F46E5",
            color: mode === "dark" ? "#38BDF8" : "#4F46E5",
          }}
        >
          {mode === "dark" ? "Light Mode" : "Dark Mode"}
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(ROUTES.EDITPROFILE)}>
          Edit Profile
        </Button>
        <Button
          icon={<LockOutlined />}
          onClick={() => navigate(ROUTES.CHANGE_PASSWORD)}
          style={{ borderColor: "#D97706", color: "#D97706" }}
        >
          Change Password
        </Button>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          loading={authLoading}
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
      </Space>
    </Card>
  );
};

export default Profile;
