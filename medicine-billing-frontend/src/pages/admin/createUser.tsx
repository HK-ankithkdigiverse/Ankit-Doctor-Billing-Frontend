import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, App } from "antd";
import { ROUTES } from "../../constants";
import { useCreateUser } from "../../hooks/useUsers";
import { emailRule, passwordMinRule, phoneRule, requiredRule } from "../../utils/formRules";

const CreateUser: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync: createUser, isPending } = useCreateUser();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await createUser({ ...values, role: "USER" });
      message.success("User created");
      navigate(ROUTES.USERS);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <Card style={{ maxWidth: 720, margin: "0 auto" }}>
      <Typography.Title level={4}>Create User</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="name" label="Name" rules={[requiredRule("Name"), { min: 2, message: "Name must be at least 2 characters" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[requiredRule("Email"), emailRule]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[requiredRule("Password"), passwordMinRule]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[phoneRule]}>
          <Input />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => navigate(ROUTES.USERS)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create User
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateUser;

