import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import axios from "axios";
import { ROUTES } from "../../constants";
import { useCategory, useUpdateCategory } from "../../hooks/useCategories";
import CategoryFormFields from "../../components/forms/CategoryFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

export default function EditCategory() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: category, isLoading } = useCategory(id || "");
  const { mutateAsync, isPending } = useUpdateCategory();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!category) return;
    form.setFieldsValue({
      name: category.name || "",
      description: category.description || "",
    });
  }, [category, form]);

  const handleSubmit = async (values: { name: string; description?: string }) => {
    if (!id) return;
    try {
      await mutateAsync({
        id,
        payload: {
          name: values.name,
          description: values.description || undefined,
        },
      });
      message.success("Category updated");
      navigate(ROUTES.CATEGORIES);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        message.error(error.response?.data?.message || "Failed to update category");
        return;
      }
      message.error("Failed to update category");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!category) return <p>Category not found</p>;

  return (
    <Card style={{ maxWidth: 720, margin: "0 auto" }}>
      <Typography.Title level={4}>Edit Category</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
       
      >
        <CategoryFormFields />

        <FormActionButtons submitText="Update Category" loading={isPending} />
      </Form>
    </Card>
  );
}

