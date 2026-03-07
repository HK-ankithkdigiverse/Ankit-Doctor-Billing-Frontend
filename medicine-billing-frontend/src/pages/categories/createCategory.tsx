import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Form, Row, Select, Typography, App } from "antd";
import axios from "axios";
import { ROUTES } from "../../constants";
import { useCreateCategory } from "../../hooks/useCategories";
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

export default function CreateCategory() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCategory();
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

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      await mutateAsync({
        name: values.name,
        description: values.description || undefined,
        ...(isAdmin ? { medicalStoreId: values.medicalStoreId } : {}),
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

        <FormActionButtons submitText="Create Category" loading={isPending} />
      </Form>
    </Card>
  );
}
