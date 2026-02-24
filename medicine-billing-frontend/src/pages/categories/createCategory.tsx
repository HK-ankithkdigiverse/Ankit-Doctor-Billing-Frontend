import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, App } from "antd";
import axios from "axios";
import { ROUTES } from "../../constants";
import { useCreateCategory } from "../../hooks/useCategories";
import { requiredRule } from "../../utils/formRules";

const CreateCategory = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCategory();
  const [form] = Form.useForm();

  const handleSubmit = async (values: { name: string; description?: string }) => {
    try {
      await mutateAsync({
        name: values.name,
        description: values.description || undefined,
      });
      message.success("Category created");
      navigate(ROUTES.CATEGORIES);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || "Failed to create category");
        return;
      }
      message.error("Failed to create category");
    }
  };

  return (
    <Card style={{ maxWidth: 720, margin: "0 auto" }}>
      <Typography.Title level={4}>Create Category</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
       
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[requiredRule("Category name"), { min: 2, message: "Category name must be at least 2 characters" }]}
        >
          <Input placeholder="Enter category name" />
        </Form.Item>

        <Form.Item name="description" label="Description" rules={[{ max: 500, message: "Description cannot exceed 500 characters" }]}>
          <Input.TextArea rows={4} placeholder="Enter description (optional)" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create Category
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateCategory;

