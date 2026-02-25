import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Button, Card, ConfigProvider, Form, Input, Typography, App } from "antd";
import { MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { VerifyOtpPayload } from "../../types";
import { ROUTES } from "../../constants";
import { otpRule, requiredRule } from "../../utils/formRules";
import {
  clearPostLoginRedirect,
  readPostLoginRedirect,
  storePostLoginRedirect,
} from "../../utils/authRedirect";
import { authPageBackground, authPageCardBase, authPageTheme } from "../../theme/authPageTheme";

const VerifyOtp: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, loading } = useAuth();

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
      message.success("OTP verified successfully");
      const redirectTo = redirectToFromState || readPostLoginRedirect() || ROUTES.DASHBOARD;
      clearPostLoginRedirect();
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      message.error(`OTP verification failed: ${error.message}`);
    }
  };

  return (
    <ConfigProvider theme={authPageTheme}>
      <div style={authPageBackground}>
        <Card
          style={{
            ...authPageCardBase,
            maxWidth: 430,
          }}
        >
          <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
            Verify OTP
          </Typography.Title>
          <Typography.Paragraph style={{ textAlign: "center", color: "#64748b", marginBottom: 20 }}>
            Enter the verification code sent to your email
          </Typography.Paragraph>

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
            <Form.Item name="otp" label="OTP" rules={[requiredRule("OTP"), otpRule]}>
              <Input
                prefix={<SafetyOutlined />}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
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
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default VerifyOtp;

