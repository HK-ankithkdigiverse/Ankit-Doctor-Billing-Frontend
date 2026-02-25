import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { ROUTES } from "../../constants";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
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

interface EditProfileFormValues {
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
}

const EditProfile = () => {
  const { message } = App.useApp();
  const { data: user } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfile();
  const navigate = useNavigate();
  const [form] = Form.useForm<EditProfileFormValues>();

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      name: user.name,
      medicalName: user.medicalName || "",
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      state: user.state || "",
      city: user.city || "",
      pincode: user.pincode || "",
      gstNumber: user.gstNumber || "",
      panCardNumber: user.panCardNumber || "",
    });
  }, [user, form]);

  if (!user) return null;

  const handleSave = async (values: EditProfileFormValues) => {
    try {
      await mutateAsync({
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
      });
      message.success("Profile updated");
      navigate(ROUTES.PROFILE);
    } catch {
      message.error("Failed to update profile");
    }
  };

  return (
    <Card style={{ maxWidth: 760, margin: "0 auto" }}>
      <Typography.Title level={4}>Update Profile</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSave}>
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
              rules={[requiredRule("Medical Name"), nonWhitespaceRule("Medical Name"), { min: 2, message: "Medical Name must be at least 2 characters" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="email" label="Email" rules={[requiredRule("Email"), nonWhitespaceRule("Email"), emailRule]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="phone" label="Phone" rules={[phoneRule]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address" rules={[{ max: 500, message: "Address must be 500 characters or less" }]}>
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
          <Button onClick={() => navigate(ROUTES.PROFILE)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditProfile;

