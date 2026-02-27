import { useLocation, useNavigate } from "react-router-dom";
import { App, Button, Form, Input } from "antd";
import { resetPasswordApi } from "../../api/auth.api";
import { ROUTES } from "../../constants";
import { otpRule, passwordMinRule, requiredRule } from "../../utils/formRules";
import AuthCard from "../../components/auth/AuthCard";

type ResetPasswordValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
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
    <AuthCard title="Reset Password" subtitle={`Set a new password for ${email || "your account"}`}>
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item
          name="otp"
          label="OTP"
          rules={[requiredRule("OTP"), otpRule]}
          normalize={(value?: string) => (value || "").replace(/\D/g, "")}
        >
          <Input maxLength={6} inputMode="numeric" placeholder="Enter 6-digit OTP" />
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
    </AuthCard>
  );
}

