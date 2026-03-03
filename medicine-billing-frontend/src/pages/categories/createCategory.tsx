import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Form, Row, Select, Typography, App } from "antd";
import axios from "axios";
import { ROUTES } from "../../constants";
import { useCreateCategory } from "../../hooks/useCategories";
import { useMe } from "../../hooks/useMe";
import { useUsers } from "../../hooks/useUsers";
import { useMedicalStores } from "../../hooks/useMedicalStores";
import type { User } from "../../types";
import CategoryFormFields from "../../components/forms/CategoryFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";
import { requiredRule } from "../../common/helpers/formRules";

interface CategoryFormValues {
  name: string;
  description?: string;
  userId?: string;
  medicalStoreId?: string;
}

const getUserMedicalStoreId = (user: {
  medicalStoreId?: string | { _id?: string } | null;
}) => {
  if (!user?.medicalStoreId) return "";
  return typeof user.medicalStoreId === "string"
    ? user.medicalStoreId
    : user.medicalStoreId?._id || "";
};

export default function CreateCategory() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCategory();
  const [form] = Form.useForm<CategoryFormValues>();
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === "ADMIN";
  const { data: usersData, isLoading: isUsersLoading } = useUsers(1, 1000, "", "all");
  const { data: medicalStoresData, isLoading: isLoadingMedicalStores } = useMedicalStores(
    1,
    1000,
    "",
    { enabled: isAdmin }
  );

  const userOptions = useMemo<{ label: string; value: string }[]>(
    () =>
      (usersData?.users ?? ([] as User[]))
        .filter((user: User) => user.isActive !== false)
        .map((user: User) => ({
          value: user._id,
          label: user.name || user.email || user._id,
        }))
        .sort((a: { label: string; value: string }, b: { label: string; value: string }) =>
          a.label.localeCompare(b.label)
        ),
    [usersData?.users]
  );

  const userStoreMap = useMemo(() => {
    const map = new Map<string, string>();
    (usersData?.users ?? ([] as User[])).forEach((user: User) => {
      const storeId = getUserMedicalStoreId(user);
      if (storeId) {
        map.set(user._id, storeId);
      }
    });
    return map;
  }, [usersData?.users]);

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
        ...(isAdmin ? { userId: values.userId, medicalStoreId: values.medicalStoreId } : {}),
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
        onValuesChange={(changedValues: Partial<CategoryFormValues>) => {
          if (!isAdmin || !changedValues.userId) return;
          const linkedMedicalStoreId = userStoreMap.get(changedValues.userId);
          if (linkedMedicalStoreId) {
            form.setFieldValue("medicalStoreId", linkedMedicalStoreId);
          }
        }}
        style={{ marginTop: 16 }}
      >
        {isAdmin && (
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="userId"
                label="User"
                rules={[requiredRule("User")]}
                extra={
                  !isUsersLoading && userOptions.length === 0
                    ? "No active users found."
                    : undefined
                }
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={isUsersLoading ? "Loading users..." : "Select user"}
                  options={userOptions}
                  loading={isUsersLoading}
                  disabled={isPending}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="medicalStoreId"
                label="Medical Store"
                rules={[requiredRule("Medical Store")]}
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
                    isLoadingMedicalStores ? "Loading medical stores..." : "Select medical store"
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

