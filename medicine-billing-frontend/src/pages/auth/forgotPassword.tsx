import { useNavigate } from "react-router-dom";
import { App, Button, Form, Input } from "antd";
import { forgotPasswordApi } from "../../api/auth.api";
import { ROUTES } from "../../constants";
import { emailRule, requiredRule } from "../../utils/formRules";
import AuthCard from "../../components/auth/AuthCard";

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPassword() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<ForgotPasswordValues>();

  const handleSubmit = async (values: ForgotPasswordValues) => {
    try {
      await forgotPasswordApi({ email: values.email });
      message.success("OTP sent to your email");
      navigate(ROUTES.RESET_PASSWORD, { state: { email: values.email } });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <AuthCard title="Forgot Password" subtitle="Enter your email to receive OTP">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="email" label="Email" rules={[requiredRule("Email"), emailRule]}>
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block size="large">
          Send OTP
        </Button>
      </Form>
    </AuthCard>
  );
}

