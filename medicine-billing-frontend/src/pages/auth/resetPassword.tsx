import { useLocation, useNavigate } from "react-router-dom";
import { App, Button, Card, Form, Input, Typography } from "antd";
import { resetPasswordApi } from "../../api/auth.api";
import { ROUTES } from "../../constants";
import { otpRule, passwordMinRule, requiredRule } from "../../utils/formRules";

type ResetPasswordValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetPassword: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || "";
  const [form] = Form.useForm<ResetPasswordValues>();

  const submit = async (values: ResetPasswordValues) => {
    if (!email) {
      message.error("Email is missing. Please start from Forgot Password.");
      navigate(ROUTES.FORGOT_PASSWORD);
      return;
    }

    try {
      await resetPasswordApi({ email, otp: values.otp, newPassword: values.newPassword });
      message.success("Password reset successful");
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to reset password");
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
      <Card style={{ width: "100%", maxWidth: 420, borderRadius: 16 }}>
        <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
          Reset Password
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: "center", color: "#64748b", marginBottom: 20 }}>
          Set a new password for {email || "your account"}
        </Typography.Paragraph>

        <Form form={form} layout="vertical" onFinish={submit} requiredMark={false}>
          <Form.Item name="otp" label="OTP" rules={[requiredRule("OTP"), otpRule]}>
            <Input maxLength={6} placeholder="Enter 6-digit OTP" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[requiredRule("New password"), passwordMinRule]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["newPassword"]}
            rules={[
              requiredRule("Confirm password"),
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter new password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large">
            Reset Password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;
