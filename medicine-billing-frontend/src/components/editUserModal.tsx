import { Col, Form, Input, Modal, Row, Select } from "antd";
import { useMemo } from "react";
import type { UpdateUserPayload } from "../api/userApi";
import { ROLE } from "../constants";
import type { User } from "../types";
import { emailRule, gstRule, phoneRule, requiredRule } from "../utils/formRules";

const PINCODE_REGEX = /^[0-9]{6}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const pincodeRule = {
  pattern: PINCODE_REGEX,
  message: "Pincode must be exactly 6 digits",
};

const panRule = {
  pattern: PAN_REGEX,
  message: "PAN card number must match format ABCDE1234F",
};

const nonWhitespaceRule = (label: string) => ({
  validator: (_: unknown, value: string | undefined) => {
    if (value === undefined || value === null) return Promise.resolve();
    if (typeof value === "string" && value.trim().length === 0) {
      return Promise.reject(new Error(`${label} is required`));
    }
    return Promise.resolve();
  },
});

const trimIfString = (value?: string) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

interface EditUserFormValues {
  name: string;
  medicalName?: string;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
  role: string;
}

interface NormalizedEditUserValues {
  name: string;
  medicalName: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panCardNumber: string;
  role: string;
}

const toInitialValues = (user: User): EditUserFormValues => ({
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
  values: Partial<EditUserFormValues> | undefined
): NormalizedEditUserValues => ({
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

const buildPayload = (values: EditUserFormValues): UpdateUserPayload => ({
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

const EditUserModal = ({ user, onClose, onSave, isLoading }: Props) => {
  const [form] = Form.useForm<EditUserFormValues>();
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
      (Object.keys(normalizedInitial) as Array<keyof NormalizedEditUserValues>)
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

        <Form.Item
          name="address"
          label="Address"
          rules={[{ max: 500, message: "Address must be 500 characters or less" }]}
        >
          <Input.TextArea rows={3} disabled={isLoading} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="state" label="State">
              <Input disabled={isLoading} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="city" label="City">
              <Input disabled={isLoading} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="pincode"
              label="Pincode"
              rules={[pincodeRule]}
              normalize={(value?: string) => (value || "").replace(/\D/g, "")}
            >
              <Input maxLength={6} inputMode="numeric" disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="gstNumber"
              label="GST Number"
              rules={[gstRule]}
              normalize={(value?: string) => value?.toUpperCase()}
            >
              <Input
                style={{ textTransform: "uppercase" }}
                maxLength={15}
                disabled={isLoading}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="panCardNumber"
              label="PAN Card Number"
              rules={[panRule]}
              normalize={(value?: string) => value?.toUpperCase()}
            >
              <Input
                style={{ textTransform: "uppercase" }}
                maxLength={10}
                disabled={isLoading}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditUserModal;

