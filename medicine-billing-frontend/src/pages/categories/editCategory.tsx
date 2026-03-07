import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Col, Form, Row, Select, Typography, App } from "antd";
import axios from "axios";
import { ROUTES } from "../../constants";
import { useCategory, useUpdateCategory } from "../../hooks/useCategories";
import { useMe } from "../../hooks/useMe";
import { useAllMedicalStores } from "../../hooks/useMedicalStores";
import CategoryFormFields from "../../components/forms/CategoryFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";
import { requiredRule } from "../../utils/formRules";

interface CategoryFormValues {
  name: string;
  description?: string;
  medicalStoreId?: string;
}

const getCategoryMedicalStoreId = (category: {
  medicalStoreId?: string | { _id?: string } | null;
}) => {
  if (!category?.medicalStoreId) return "";
  return typeof category.medicalStoreId === "string"
    ? category.medicalStoreId
    : category.medicalStoreId?._id || "";
};

export default function EditCategory() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: category, isLoading } = useCategory(id || "");
  const { mutateAsync, isPending } = useUpdateCategory();
  const [form] = Form.useForm<CategoryFormValues>();
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === "ADMIN";
  const { data: medicalStoresData, isLoading: isLoadingMedicalStores } = useAllMedicalStores({
    enabled: isAdmin,
  });

  const medicalStoreOptions = useMemo(
    () =>
      (medicalStoresData?.medicalStores ?? [])
        .filter((store) => store.isActive !== false)
        .map((store) => ({
          value: store._id,
          label: store.name || store._id,
        }))
        .sort((a: { label: string; value: string }, b: { label: string; value: string }) =>
          a.label.localeCompare(b.label)
        ),
    [medicalStoresData?.medicalStores]
  );

  useEffect(() => {
    if (!category) return;
    form.setFieldsValue({
      name: category.name || "",
      description: category.description || "",
      medicalStoreId: getCategoryMedicalStoreId(category) || undefined,
    });
  }, [category, form]);

  const handleSubmit = async (values: CategoryFormValues) => {
    if (!id) return;
    try {
      await mutateAsync({
        id,
        payload: {
          name: values.name,
          description: values.description || undefined,
          ...(isAdmin ? { medicalStoreId: values.medicalStoreId } : {}),
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
        {isAdmin && (
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="medicalStoreId"
                label="Store"
                rules={[requiredRule("Store")]}
                extra={
                  !isLoadingMedicalStores && medicalStoreOptions.length === 0
                    ? "No active medical store found."
                    : undefined
                }
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={
                    isLoadingMedicalStores ? "Loading stores..." : "Select store"
                  }
                  options={medicalStoreOptions}
                  loading={isLoadingMedicalStores}
                  disabled={isPending}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <CategoryFormFields />

        <FormActionButtons submitText="Update Category" loading={isPending} />
      </Form>
    </Card>
  );
}
