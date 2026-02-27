import { Col, Form, Input, Modal, Row, Select } from "antd";
import { useMemo } from "react";
import type { UpdateUserPayload } from "../api/userApi";
import { ROLE } from "../constants";
import type { User } from "../types";
import { emailRule, phoneRule, requiredRule } from "../utils/formRules";
import UserBusinessFields from "./forms/UserBusinessFields";
import { nonWhitespaceRule, trimIfString } from "../utils/userForm";
import type { EditUserFormValues, NormalizedEditUserValues } from "../types/userForm";

type EditUserModalFormValues = Omit<EditUserFormValues, "medicalName"> & {
  medicalName?: string;
  role: string;
};

type NormalizedEditUserModalValues = NormalizedEditUserValues & {
  role: string;
};

const toInitialValues = (user: User): EditUserModalFormValues => ({
  name: user.name || "",
  medicalName: user.medicalName || "",
  email: user.email || "",
  phone: user.phone || "",
  address: user.address || "",
  state: user.state || "",
  city: user.city || "",
  pincode: user.pincode || "",
  gstNumber: user.gstNumber || "",
  panCardNumber: user.panCardNumber || "",
  role: user.role || ROLE.USER,
});

const normalizeForCompare = (
  values: Partial<EditUserModalFormValues> | undefined
): NormalizedEditUserModalValues => ({
  name: trimIfString(values?.name) ?? "",
  medicalName: trimIfString(values?.medicalName) ?? "",
  email: (trimIfString(values?.email) ?? "").toLowerCase(),
  phone: trimIfString(values?.phone) ?? "",
  address: trimIfString(values?.address) ?? "",
  state: trimIfString(values?.state) ?? "",
  city: trimIfString(values?.city) ?? "",
  pincode: trimIfString(values?.pincode) ?? "",
  gstNumber: (trimIfString(values?.gstNumber) ?? "").toUpperCase(),
  panCardNumber: (trimIfString(values?.panCardNumber) ?? "").toUpperCase(),
  role: values?.role || ROLE.USER,
});

const buildPayload = (values: EditUserModalFormValues): UpdateUserPayload => ({
  name: trimIfString(values.name) || "",
  medicalName: trimIfString(values.medicalName),
  email: (trimIfString(values.email) || "").toLowerCase(),
  phone: trimIfString(values.phone),
  address: trimIfString(values.address),
  state: trimIfString(values.state),
  city: trimIfString(values.city),
  pincode: trimIfString(values.pincode),
  gstNumber: trimIfString(values.gstNumber)?.toUpperCase(),
  panCardNumber: trimIfString(values.panCardNumber)?.toUpperCase(),
  role: values.role || ROLE.USER,
});

const ROLE_OPTIONS = [
  { label: "Admin", value: ROLE.ADMIN },
  { label: "User", value: ROLE.USER },
];

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
      watchedValues?.role
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
            <Form.Item name="medicalName" label="Medical Name">
              <Input disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
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
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[phoneRule]}
              normalize={(value?: string) => (value || "").replace(/\D/g, "")}
            >
              <Input maxLength={10} inputMode="numeric" disabled={isLoading} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="role" label="Role" rules={[requiredRule("Role")]}>
              <Select options={ROLE_OPTIONS} disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <UserBusinessFields disabled={isLoading} />
      </Form>
    </Modal>
  );
}

