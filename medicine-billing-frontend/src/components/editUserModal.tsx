import { Col, Form, Input, Modal, Row, Select } from "antd";
import { useMemo } from "react";
import type { UpdateUserPayload } from "../api/userApi";
import { useMedicalStores } from "../hooks/useMedicalStores";
import type { User } from "../types";
import { emailRule, requiredRule } from "../utils/formRules";
import { nonWhitespaceRule, trimIfString } from "../utils/userForm";
import type { EditUserFormValues, NormalizedEditUserValues } from "../types/userForm";

type EditUserModalFormValues = EditUserFormValues;
type NormalizedEditUserModalValues = NormalizedEditUserValues;

const toInitialValues = (user: User): EditUserModalFormValues => ({
  name: user.name || "",
  email: user.email || "",
  medicalStoreId:
    (typeof user.medicalStoreId === "string"
      ? trimIfString(user.medicalStoreId)
      : trimIfString(user.medicalStoreId?._id)) || "",
});

const normalizeForCompare = (
  values: Partial<EditUserModalFormValues> | undefined
): NormalizedEditUserModalValues => ({
  name: trimIfString(values?.name) ?? "",
  email: (trimIfString(values?.email) ?? "").toLowerCase(),
  medicalStoreId: trimIfString(values?.medicalStoreId) ?? "",
});

const buildPayload = (values: EditUserModalFormValues): UpdateUserPayload => {
  const payload: UpdateUserPayload = {
    name: trimIfString(values.name) || "",
    email: (trimIfString(values.email) || "").toLowerCase(),
  };

  const medicalStoreId = trimIfString(values.medicalStoreId);
  if (medicalStoreId) payload.medicalStoreId = medicalStoreId;

  return payload;
};

interface Props {
  user: User;
  onClose: () => void;
  onSave: (data: UpdateUserPayload) => Promise<void>;
  isLoading?: boolean;
}

export default function EditUserModal({ user, onClose, onSave, isLoading }: Props) {
  const [form] = Form.useForm<EditUserModalFormValues>();
  const initialValues = useMemo(() => toInitialValues(user), [user]);
  const watchedValues = Form.useWatch([], form);
  const { data: medicalStoresData, isLoading: isLoadingMedicalStores } = useMedicalStores(
    1,
    1000,
    "",
    { enabled: true }
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

  const normalizedInitial = useMemo(
    () => normalizeForCompare(initialValues),
    [initialValues]
  );
  const normalizedCurrent = useMemo(
    () => normalizeForCompare(watchedValues || initialValues),
    [watchedValues, initialValues]
  );

  const hasChanges = useMemo(
    () =>
      (Object.keys(normalizedInitial) as Array<keyof NormalizedEditUserModalValues>)
        .some((key) => normalizedInitial[key] !== normalizedCurrent[key]),
    [normalizedInitial, normalizedCurrent]
  );

  const hasRequiredValues = Boolean(
    trimIfString(watchedValues?.name) &&
      trimIfString(watchedValues?.email) &&
      trimIfString(watchedValues?.medicalStoreId)
  );

  return (
    <Modal
      open
      title="Edit User"
      onCancel={onClose}
      width={900}
      styles={{ body: { maxHeight: "68vh", overflowY: "auto", paddingRight: 8 } }}
      onOk={() => form.submit()}
      okText={isLoading ? "Saving..." : "Save"}
      okButtonProps={{
        loading: isLoading,
        disabled: !hasRequiredValues || !hasChanges,
      }}
      destroyOnHidden
    >
      <Form
        key={user._id}
        form={form}
        layout="vertical"
        onFinish={async (values) => onSave(buildPayload(values))}
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
              <Input disabled={isLoading} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[requiredRule("Email"), nonWhitespaceRule("Email"), emailRule]}
            >
              <Input disabled={isLoading} />
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
                disabled={isLoading}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}




