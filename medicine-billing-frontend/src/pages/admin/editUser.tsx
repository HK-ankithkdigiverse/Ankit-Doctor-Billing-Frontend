import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { App, Button, Card, Col, Form, Input, Row, Select, Typography } from "antd";
import { ROUTES } from "../../constants";
import { useAllUsers, useUpdateUser } from "../../hooks/useUsers";
import { useAllMedicalStores } from "../../hooks/useMedicalStores";
import { uploadSingleFileApi } from "../../api/uploadApi";
import type { UpdateUserPayload } from "../../api/userApi";
import type { User } from "../../types";
import { emailRule, optionalPhoneRule, requiredRule } from "../../utils/formRules";
import { getUploadFileUrl } from "../../utils/company";
import SignatureUploadField from "../../components/forms/SignatureUploadField";
import FormActionButtons from "../../components/forms/FormActionButtons";
import { getErrorMessage, isDuplicateEmailError, nonWhitespaceRule, trimIfString } from "../../utils/userForm";
import type { EditUserFormValues, NormalizedEditUserValues } from "../../types/userForm";

interface EditUserLocationState {
  user?: User;
}

const toInitialValues = (user: User): EditUserFormValues => ({
  name: user.name || "",
  email: user.email || "",
  phoneNumber: user.phoneNumber || user.phone || "",
  medicalStoreId:
    (typeof user.medicalStoreId === "string"
      ? trimIfString(user.medicalStoreId)
      : trimIfString(user.medicalStoreId?._id)) || "",
});

const normalizeForCompare = (
  values: Partial<EditUserFormValues> | undefined
): NormalizedEditUserValues => ({
  name: trimIfString(values?.name) ?? "",
  email: (trimIfString(values?.email) ?? "").toLowerCase(),
  phoneNumber: trimIfString(values?.phoneNumber) ?? "",
  medicalStoreId: trimIfString(values?.medicalStoreId) ?? "",
});

const buildPayload = (values: EditUserFormValues): UpdateUserPayload => {
  const payload: UpdateUserPayload = {
    name: trimIfString(values.name) || "",
    email: (trimIfString(values.email) || "").toLowerCase(),
  };
  const phoneNumber = trimIfString(values.phoneNumber);
  if (phoneNumber) payload.phoneNumber = phoneNumber;

  const medicalStoreId = trimIfString(values.medicalStoreId);
  if (medicalStoreId) payload.medicalStoreId = medicalStoreId;

  return payload;
};

export default function EditUser() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm<EditUserFormValues>();
  const watchedValues = Form.useWatch([], form);
  const { data, isLoading } = useAllUsers("all");
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const { data: medicalStoresData, isLoading: isLoadingMedicalStores } = useAllMedicalStores({
    enabled: true,
  });
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [removeSignature, setRemoveSignature] = useState(false);

  const routeState = location.state as EditUserLocationState | null;
  const users = data?.users ?? [];

  const user = useMemo(() => {
    if (!id) return undefined;
    if (routeState?.user?._id === id) return routeState.user;
    return users.find((candidate: User) => candidate._id === id);
  }, [id, routeState, users]);
  const initialValues = useMemo(
    () => (user ? toInitialValues(user) : undefined),
    [user]
  );
  const medicalStoreOptions = useMemo(() => {
    const options = (medicalStoresData?.medicalStores ?? [])
      .map((store) => {
        const storeId = trimIfString(store._id);
        if (!storeId) return null;
        const storeName = trimIfString(store.name) || "Medical Store";
        const status = store.isActive === false ? "Inactive" : "Active";
        return {
          label: status === "Inactive" ? `${storeName} (Inactive)` : storeName,
          value: storeId,
        };
      })
      .filter((value): value is { label: string; value: string } => Boolean(value));

    const selectedStoreId = trimIfString(initialValues?.medicalStoreId);
    if (selectedStoreId && !options.some((option) => option.value === selectedStoreId)) {
      const fallbackLabel = user?.medicalName || "Linked Medical Store";
      options.unshift({ label: fallbackLabel, value: selectedStoreId });
    }

    const deduped = new Map<string, { label: string; value: string }>();
    options.forEach((option) => {
      if (!deduped.has(option.value)) deduped.set(option.value, option);
    });

    return [...deduped.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [medicalStoresData?.medicalStores, initialValues?.medicalStoreId, user?.medicalName]);

  useEffect(() => {
    if (!initialValues) return;
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const normalizedInitial = useMemo(
    () => normalizeForCompare(initialValues),
    [initialValues]
  );
  const normalizedCurrent = useMemo(
    () => normalizeForCompare(watchedValues || initialValues),
    [watchedValues, initialValues]
  );

  const hasChanges = useMemo(() => {
    if (!initialValues) return false;
    return (Object.keys(normalizedInitial) as Array<keyof NormalizedEditUserValues>)
      .some((key) => normalizedInitial[key] !== normalizedCurrent[key]);
  }, [initialValues, normalizedInitial, normalizedCurrent]);

  const hasRequiredValues = Boolean(
    trimIfString(watchedValues?.name) &&
      trimIfString(watchedValues?.email) &&
      trimIfString(watchedValues?.medicalStoreId)
  );
  const signatureChanged = Boolean(signatureFile) || removeSignature;
  const existingSignatureUrl =
    !removeSignature && !signatureFile ? getUploadFileUrl(user?.signature) : "";

  const handleSubmit = async (values: EditUserFormValues) => {
    if (!id || !user) return;

    try {
      const payload = buildPayload(values);

      if (signatureFile) {
        payload.signature = await uploadSingleFileApi(signatureFile);
      } else if (removeSignature) {
        payload.signature = "";
      }

      await updateUser({
        id,
        data: payload,
      });
      message.success("User updated");
      navigate(ROUTES.USERS);
    } catch (error: any) {
      if (isDuplicateEmailError(error)) {
        form.setFields([{ name: "email", errors: ["Email already exists"] }]);
        message.error("Email already exists");
        return;
      }
      message.error(getErrorMessage(error) || "Failed to update user");
    }
  };

  if (isLoading && !user) return <p>Loading...</p>;

  if (!id || !user) {
    return (
      <Card style={{ maxWidth: 900, margin: "0 auto" }}>
        <Typography.Title level={4}>Edit User</Typography.Title>
        <Typography.Paragraph>User not found.</Typography.Paragraph>
        <Button onClick={() => navigate(ROUTES.USERS)}>Back to Users</Button>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: 900, margin: "0 auto" }}>
      <Typography.Title level={4}>Edit User</Typography.Title>
      <Form
        key={user._id}
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
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
              name="phoneNumber"
              label="Phone Number (Optional)"
              rules={[optionalPhoneRule]}
              normalize={(value?: string) => (value || "").replace(/\D/g, "").slice(0, 10)}
            >
              <Input maxLength={10} inputMode="numeric" disabled={isPending} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              name="medicalStoreId"
              label="Medical Store"
              rules={[requiredRule("Medical Store")]}
              extra={
                !isLoadingMedicalStores && medicalStoreOptions.length === 0
                  ? "No medical store found."
                  : undefined
              }
            >
              <Select
                allowClear={false}
                showSearch
                optionFilterProp="label"
                placeholder={
                  isLoadingMedicalStores ? "Loading Medical Stores..." : "Select Medical Store"
                }
                options={medicalStoreOptions}
                loading={isLoadingMedicalStores}
                disabled={isPending}
              />
            </Form.Item>
          </Col>
        </Row>

        <SignatureUploadField
          signatureUrl={existingSignatureUrl}
          disabled={isPending}
          onSelectFile={(file) => {
            setSignatureFile(file);
            setRemoveSignature(false);
          }}
          onClearFile={() => setSignatureFile(null)}
          onRemoveExisting={() => {
            setSignatureFile(null);
            setRemoveSignature(true);
          }}
        />

        <FormActionButtons
          submitText="Save"
          loading={isPending}
          disabled={!hasRequiredValues || (!hasChanges && !signatureChanged)}
          onCancel={() => navigate(ROUTES.USERS)}
        />
      </Form>
    </Card>
  );
}



