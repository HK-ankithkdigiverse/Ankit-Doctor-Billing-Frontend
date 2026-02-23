import { useNavigate, useLocation } from "react-router-dom";
import { Alert, Button, Card, Form, Input, Typography, App } from "antd";
import { MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { VerifyOtpPayload } from "../../types";
import { ROUTES } from "../../constants";
import { otpRule, requiredRule } from "../../utils/formRules";

const VerifyOtp: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, loading } = useAuth();

  const emailFromState = location.state?.email || "";
  const otpSent = Boolean(location.state?.otpSent);

  const [form] = Form.useForm<VerifyOtpPayload>();

  const handleSubmit = async (values: VerifyOtpPayload) => {
    try {
      await verifyOtp(values);
      message.success("OTP verified successfully");
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      message.error(`OTP verification failed: ${error.message}`);
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
          maxWidth: 430,
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(15,42,67,0.25)",
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
          requiredMark={false}
          initialValues={{ email: emailFromState, otp: "" }}
        >
          <Form.Item name="email" label="Email" rules={[requiredRule("Email")]}>
            <Input readOnly />
          </Form.Item>

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
          <Typography.Link onClick={() => navigate(ROUTES.LOGIN)}>Go back to login</Typography.Link>
        </Typography.Paragraph>
      </Card>
    </div>
  );
};

export default VerifyOtp;
