import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Card, Col, Form, Input, Row, Select, Typography } from "antd";
import { ROLE, ROUTES } from "../../constants";
import { useCreateUser } from "../../hooks/useUsers";
import { useAllMedicalStores } from "../../hooks/useMedicalStores";
import { emailRule, passwordMinRule, requiredRule } from "../../utils/formRules";
import { uploadSingleFileApi } from "../../api/uploadApi";
import type { CreateUserPayload } from "../../api/userApi";
import SignatureUploadField from "../../components/forms/SignatureUploadField";
import FormActionButtons from "../../components/forms/FormActionButtons";
import { getErrorMessage, isDuplicateEmailError, nonWhitespaceRule, trimIfString } from "../../utils/userForm";

interface CreateUserFormValues {
  name: string;
  email: string;
  password: string;
  medicalStoreId: string;
}

const buildPayload = (values: CreateUserFormValues): CreateUserPayload => {
  const medicalStoreId = trimIfString(values.medicalStoreId);

  const payload: CreateUserPayload = {
    name: trimIfString(values.name) || "",
    email: (trimIfString(values.email) || "").toLowerCase(),
    password: trimIfString(values.password) || "",
    role: ROLE.USER,
    isActive: true,
  };

  if (medicalStoreId) {
    payload.medicalStoreId = medicalStoreId;
  }

  return payload;
};

export default function CreateUser() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync: createUser, isPending } = useCreateUser();
  const { data: medicalStoresData, isLoading: isLoadingMedicalStores } = useAllMedicalStores();
  const [form] = Form.useForm<CreateUserFormValues>();
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const medicalStoreOptions = useMemo(() => {
    const options = (medicalStoresData?.medicalStores ?? [])
      .filter((store) => store.isActive !== false)
      .map((store) => {
        const storeId = trimIfString(store._id);
        if (!storeId) return null;
        const storeName = trimIfString(store.name) || "Medical Store";
        return {
          label: storeName,
          value: storeId,
        };
      })
      .filter((value): value is { label: string; value: string } => Boolean(value));

    const deduped = new Map<string, { label: string; value: string }>();
    options.forEach((option) => {
      if (!deduped.has(option.value)) deduped.set(option.value, option);
    });

    return [...deduped.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [medicalStoresData?.medicalStores]);

  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      const payload = buildPayload(values);

      if (signatureFile) {
        const signaturePath = await uploadSingleFileApi(signatureFile);
        payload.signature = signaturePath;
      }

      await createUser(payload);
      message.success("User created");
      navigate(ROUTES.USERS);
    } catch (error: any) {
      if (isDuplicateEmailError(error)) {
        form.setFields([{ name: "email", errors: ["Email already exists"] }]);
        message.error("Email already exists");
        return;
      }

      message.error(getErrorMessage(error) || "Failed to create user");
    }
  };

  return (
    <Card style={{ maxWidth: 900, margin: "0 auto" }}>
      <Typography.Title level={4}>Add User</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                requiredRule("Name"),
                nonWhitespaceRule("Name"),
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input disabled={isPending} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="medicalStoreId"
              label="Medical Store"
              rules={[requiredRule("Medical Store")]}
              extra={
                !isLoadingMedicalStores && medicalStoreOptions.length === 0
                  ? "No active medical store found. Create a medical store first."
                  : undefined
              }
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={
                  isLoadingMedicalStores ? "Loading Medical Stores..." : "Select Medical Store"
                }
                options={medicalStoreOptions}
                loading={isLoadingMedicalStores}
                disabled={
                  isPending || (!isLoadingMedicalStores && medicalStoreOptions.length === 0)
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="email"
              label="Email"
              rules={[requiredRule("Email"), nonWhitespaceRule("Email"), emailRule]}
            >
              <Input disabled={isPending} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                requiredRule("Password"),
                nonWhitespaceRule("Password"),
                passwordMinRule,
              ]}
            >
              <Input.Password disabled={isPending} />
            </Form.Item>
          </Col>
        </Row>

        <SignatureUploadField
          disabled={isPending}
          onSelectFile={(file) => setSignatureFile(file)}
          onClearFile={() => setSignatureFile(null)}
        />

        <FormActionButtons
          submitText="Add User"
          loading={isPending}
          onCancel={() => navigate(ROUTES.USERS)}
        />
      </Form>
    </Card>
  );
}



