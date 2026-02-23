import { useNavigate, Link } from "react-router-dom";
import { Button, Card, Form, Input, Typography, App } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { LoginPayload } from "../../types";
import { ROUTES } from "../../constants";
import { emailRule, passwordMinRule, requiredRule } from "../../utils/formRules";

const Login: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleSubmit = async (values: LoginPayload) => {
    try {
      await login(values);
      message.success("OTP sent to your email");
      navigate(ROUTES.VERIFY_OTP, { state: { email: values.email, otpSent: true } });
    } catch (error: any) {
      message.error(`Login failed: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(145deg, #0f2a43 0%, #1e6f5c 50%, #eef2f6 100%)",
        padding: 16,
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(15,42,67,0.25)",
        }}
      >
        <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          Welcome Back
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: "center", color: "#64748b", marginBottom: 24 }}>
          Login to continue to MedBill Pro
        </Typography.Paragraph>

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[requiredRule("Email"), emailRule]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[requiredRule("Password"), passwordMinRule]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Login
          </Button>
        </Form>

        <Typography.Paragraph style={{ textAlign: "center", marginTop: 16, marginBottom: 0 }}>
          Forgot your password?{" "}
          <Link to={ROUTES.FORGOT_PASSWORD}>Reset it here</Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default Login;
