import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, App } from "antd";
import { ROUTES } from "../../constants";
import { useChangePassword } from "../../hooks/useProfile";
import { passwordMinRule, requiredRule } from "../../utils/formRules";

const ChangePassword = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const changePasswordMutation = useChangePassword();
  const [form] = Form.useForm();

  const handleSubmit = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New passwords do not match");
      return;
    }
    if (values.newPassword.length < 6) {
      message.error("New password must be at least 6 characters");
      return;
    }
    if (values.oldPassword === values.newPassword) {
      message.error("New password must be different from old password");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Password changed successfully");
      navigate(ROUTES.PROFILE);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to change password");
    }
  };

  return (
    <Card style={{ maxWidth: 760, margin: "0 auto" }}>
      <Typography.Title level={4}>Change Password</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item name="oldPassword" label="Current Password" rules={[requiredRule("Current password"), passwordMinRule]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="newPassword" label="New Password" rules={[requiredRule("New password"), passwordMinRule]}>
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
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
          <Input.Password />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => navigate(ROUTES.PROFILE)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={changePasswordMutation.isPending}>
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ChangePassword;
