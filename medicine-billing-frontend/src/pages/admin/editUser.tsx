import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { App, Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { useUpdateUser, useUsers } from "../../hooks/useUsers";
import type { UpdateUserPayload } from "../../api/userApi";
import { ROUTES } from "../../constants";
import type { User } from "../../types";
import { emailRule, gstRule, phoneRule, requiredRule } from "../../utils/formRules";

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
  medicalName: string;
  email: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
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
}

interface EditUserLocationState {
  user?: User;
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
});

const buildPayload = (values: EditUserFormValues): UpdateUserPayload => ({
  name: trimIfString(values.name) || "",
  medicalName: trimIfString(values.medicalName) || "",
  email: (trimIfString(values.email) || "").toLowerCase(),
  phone: trimIfString(values.phone),
  address: trimIfString(values.address),
  state: trimIfString(values.state),
  city: trimIfString(values.city),
  pincode: trimIfString(values.pincode),
  gstNumber: trimIfString(values.gstNumber)?.toUpperCase(),
  panCardNumber: trimIfString(values.panCardNumber)?.toUpperCase(),
});

const getErrorMessage = (error: any): string => {
  const responseData = error?.response?.data;
  if (typeof responseData?.message === "string") return responseData.message;
  if (typeof responseData?.error === "string") return responseData.error;
  if (typeof error?.message === "string") return error.message;
  return "";
};

const isDuplicateEmailError = (error: any) => {
  const errorText = getErrorMessage(error);
  return (
    error?.response?.status === 409 ||
    (/email/i.test(errorText) && /(already|exists|taken|duplicate)/i.test(errorText))
  );
};

const EditUser: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm<EditUserFormValues>();
  const watchedValues = Form.useWatch([], form);
  const { data, isLoading } = useUsers(1, 1000, "", "all");
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const routeState = location.state as EditUserLocationState | null;
  const users = data?.users ?? [];

  const user = useMemo(() => {
    if (!id) return undefined;
    if (routeState?.user?._id === id) return routeState.user;
    return users.find((candidate) => candidate._id === id);
  }, [id, routeState, users]);

  const initialValues = useMemo(
    () => (user ? toInitialValues(user) : undefined),
    [user]
  );

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
      trimIfString(watchedValues?.medicalName) &&
      trimIfString(watchedValues?.email)
  );

  const handleSubmit = async (values: EditUserFormValues) => {
    if (!id) return;

    try {
      await updateUser({
        id,
        data: buildPayload(values),
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
              name="medicalName"
              label="Medical Name"
              rules={[
                requiredRule("Medical Name"),
                nonWhitespaceRule("Medical Name"),
                { min: 2, message: "Medical Name must be at least 2 characters" },
              ]}
            >
              <Input disabled={isPending} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={24}>
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
          <Col xs={24} md={24}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[phoneRule]}
              normalize={(value?: string) => (value || "").replace(/\D/g, "")}
            >
              <Input maxLength={10} inputMode="numeric" disabled={isPending} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ max: 500, message: "Address must be 500 characters or less" }]}
        >
          <Input.TextArea rows={3} disabled={isPending} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="city" label="City">
              <Input disabled={isPending} />
            </Form.Item>
          </Col>
           <Col xs={24} md={8}>
            <Form.Item name="state" label="State">
              <Input disabled={isPending} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="pincode"
              label="Pincode"
              rules={[pincodeRule]}
              normalize={(value?: string) => (value || "").replace(/\D/g, "")}
            >
              <Input maxLength={6} inputMode="numeric" disabled={isPending} />
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
                disabled={isPending}
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
                disabled={isPending}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => navigate(ROUTES.USERS)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            disabled={!hasRequiredValues || !hasChanges}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditUser;

