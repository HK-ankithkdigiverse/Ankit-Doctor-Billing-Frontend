import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Button, Form, Input, Typography, App } from "antd";
import { MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { VerifyOtpPayload } from "../../types";
import { ROUTES } from "../../constants";
import { otpRule, requiredRule } from "../../utils/formRules";
import { useThemeMode } from "../../contexts/themeMode";
import {
  clearPostLoginRedirect,
  readPostLoginRedirect,
  storePostLoginRedirect,
} from "../../utils/authRedirect";
import AuthCard from "../../components/auth/AuthCard";

export default function VerifyOtp() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, loading } = useAuth();
  const { setMode } = useThemeMode();

  const emailFromState = location.state?.email || "";
  const otpSent = Boolean(location.state?.otpSent);
  const redirectToFromState = location.state?.redirectTo || "";

  const [form] = Form.useForm<{ otp: string }>();

  const handleSubmit = async (values: { otp: string }) => {
    if (!emailFromState) {
      message.error("Email is missing. Please login again.");
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      const payload: VerifyOtpPayload = { email: emailFromState, otp: values.otp };
      await verifyOtp(payload);
      setMode("light");
      message.success("OTP verified successfully");
      const redirectTo = redirectToFromState || readPostLoginRedirect() || ROUTES.DASHBOARD;
      clearPostLoginRedirect();
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      message.error(`OTP verification failed: ${error.message}`);
    }
  };

  return (
    <AuthCard
      title="Verify OTP"
      subtitle="Enter the verification code sent to your email"
      maxWidth={430}
    >
      {otpSent && (
        <Alert
          type="success"
          showIcon
          icon={<MailOutlined />}
          message={`OTP sent to ${emailFromState}`}
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ otp: "" }}
      >
        <Form.Item
          name="otp"
          label="OTP"
          rules={[requiredRule("OTP"), otpRule]}
          normalize={(value?: string) => (value || "").replace(/\D/g, "")}
        >
          <Input
            prefix={<SafetyOutlined />}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            inputMode="numeric"
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Verify OTP
        </Button>
      </Form>

      <Typography.Paragraph style={{ textAlign: "center", marginTop: 16, marginBottom: 0 }}>
        Wrong email?{" "}
        <Typography.Link
          onClick={() => {
            const redirectTo = redirectToFromState || readPostLoginRedirect();
            if (redirectTo) storePostLoginRedirect(redirectTo);
            navigate(ROUTES.LOGIN);
          }}
        >
          Go back to login
        </Typography.Link>
      </Typography.Paragraph>
    </AuthCard>
  );
}

