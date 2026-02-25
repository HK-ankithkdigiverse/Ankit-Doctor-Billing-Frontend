import { useNavigate } from "react-router-dom";
import { App, Button, Card, ConfigProvider, Form, Input, Typography } from "antd";
import { forgotPasswordApi } from "../../api/auth.api";
import { ROUTES } from "../../constants";
import { emailRule, requiredRule } from "../../utils/formRules";
import { authPageBackground, authPageCardBase, authPageTheme } from "../../theme/authPageTheme";

type ForgotPasswordValues = {
  email: string;
};

const ForgotPassword: React.FC = () => {
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
    <ConfigProvider theme={authPageTheme}>
      <div style={authPageBackground}>
        <Card style={{ ...authPageCardBase, maxWidth: 420 }}>
          <Typography.Title level={3} style={{ textAlign: "center", marginBottom: 4 }}>
            Forgot Password
          </Typography.Title>
          <Typography.Paragraph style={{ textAlign: "center", color: "#64748b", marginBottom: 20 }}>
            Enter your email to receive OTP
          </Typography.Paragraph>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="email" label="Email" rules={[requiredRule("Email"), emailRule]}>
              <Input placeholder="Enter your email" />
            </Form.Item>

            <Button type="primary" htmlType="submit" block size="large">
              Send OTP
            </Button>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default ForgotPassword;

