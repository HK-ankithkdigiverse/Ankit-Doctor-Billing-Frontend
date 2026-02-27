import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button, Form, Input, Typography, App } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { LoginPayload } from "../../types";
import { ROUTES } from "../../constants";
import { emailRule, passwordMinRule, requiredRule } from "../../utils/formRules";
import { readPostLoginRedirect } from "../../utils/authRedirect";
import AuthCard from "../../components/auth/AuthCard";

export default function Login() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reason = params.get("reason");
    if (reason === "session-expired") {
      message.warning("Your session expired. Please login again.");
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [location.search, message, navigate]);

  const handleSubmit = async (values: LoginPayload) => {
    try {
      const fromPath =
        `${location.state?.from?.pathname || ""}${location.state?.from?.search || ""}${location.state?.from?.hash || ""}` ||
        readPostLoginRedirect() ||
        ROUTES.DASHBOARD;
      await login(values);
      message.success("OTP sent to your email");
      navigate(ROUTES.VERIFY_OTP, { state: { email: values.email, otpSent: true, redirectTo: fromPath } });
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const apiStatus = Number(error?.response?.data?.status || 0);
      const isInactiveAccount =
        statusCode === 403 ||
        apiStatus === 403 ||
        error?.response?.data?.isActive === false;

      if (isInactiveAccount) {
        message.error("Your account is not active.");
        return;
      }

      message.error("Unable to login. Please check your email and password.");
    }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Login to continue to MedBill Pro">
      <Form layout="vertical" onFinish={handleSubmit}>
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
    </AuthCard>
  );
}

