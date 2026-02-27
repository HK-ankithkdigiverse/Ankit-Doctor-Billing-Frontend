import { useNavigate } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import axios from "axios";
import { ROUTES } from "../../constants";
import { useCreateCategory } from "../../hooks/useCategories";
import CategoryFormFields from "../../components/forms/CategoryFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

export default function CreateCategory() {
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
        <CategoryFormFields />

        <FormActionButtons submitText="Create Category" loading={isPending} />
      </Form>
    </Card>
  );
}

