import { useNavigate } from "react-router-dom";
import { App, Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { ROLE, ROUTES } from "../../constants";
import { useCreateUser } from "../../hooks/useUsers";
import { emailRule, gstRule, passwordMinRule, phoneRule, requiredRule } from "../../utils/formRules";
import type { CreateUserPayload } from "../../api/userApi";

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

interface CreateUserFormValues {
  name: string;
  medicalName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  gstNumber?: string;
  panCardNumber?: string;
}

const trimIfString = (value?: string) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

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

const buildPayload = (values: CreateUserFormValues): CreateUserPayload => {
  const name = trimIfString(values.name) || "";
  const medicalName = trimIfString(values.medicalName) || "";
  const email = trimIfString(values.email) || "";
  const password = trimIfString(values.password) || "";

  const payload: CreateUserPayload = {
    name,
    medicalName,
    email: email.toLowerCase(),
    password,
    role: ROLE.USER,
    isActive: true,
  };

  const phone = trimIfString(values.phone);
  const address = trimIfString(values.address);
  const state = trimIfString(values.state);
  const city = trimIfString(values.city);
  const pincode = trimIfString(values.pincode);
  const gstNumber = trimIfString(values.gstNumber)?.toUpperCase();
  const panCardNumber = trimIfString(values.panCardNumber)?.toUpperCase();

  if (phone) payload.phone = phone;
  if (address) payload.address = address;
  if (state) payload.state = state;
  if (city) payload.city = city;
  if (pincode) payload.pincode = pincode;
  if (gstNumber) payload.gstNumber = gstNumber;
  if (panCardNumber) payload.panCardNumber = panCardNumber;

  return payload;
};

const CreateUser: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync: createUser, isPending } = useCreateUser();
  const [form] = Form.useForm<CreateUserFormValues>();

  const handleSubmit = async (values: CreateUserFormValues) => {
    try {
      await createUser(buildPayload(values));
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
              rules={[requiredRule("Name"), nonWhitespaceRule("Name"), { min: 2, message: "Name must be at least 2 characters" }]}
            >
              <Input />
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
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={24}>
            <Form.Item name="email" label="Email" rules={[requiredRule("Email"), nonWhitespaceRule("Email"), emailRule]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="password" label="Password" rules={[requiredRule("Password"), nonWhitespaceRule("Password"), passwordMinRule]}>
              <Input.Password />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="phone" label="Phone" rules={[phoneRule]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item name="state" label="State">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="city" label="City">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="pincode" label="Pincode" rules={[pincodeRule]}>
              <Input maxLength={6} />
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
              <Input style={{ textTransform: "uppercase" }} maxLength={15} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="panCardNumber"
              label="PAN Card Number"
              rules={[panRule]}
              normalize={(value?: string) => value?.toUpperCase()}
            >
              <Input style={{ textTransform: "uppercase" }} maxLength={10} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => navigate(ROUTES.USERS)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Add User
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateUser;

