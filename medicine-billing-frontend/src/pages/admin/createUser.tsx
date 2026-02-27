import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Card, Col, Form, Input, Row, Typography } from "antd";
import { ROLE, ROUTES } from "../../constants";
import { useCreateUser } from "../../hooks/useUsers";
import { emailRule, passwordMinRule, phoneRule, requiredRule } from "../../utils/formRules";
import type { CreateUserPayload } from "../../api/userApi";
import { uploadSingleFileApi } from "../../api/uploadApi";
import SignatureUploadField from "../../components/forms/SignatureUploadField";
import UserBusinessFields from "../../components/forms/UserBusinessFields";
import FormActionButtons from "../../components/forms/FormActionButtons";
import { getErrorMessage, isDuplicateEmailError, nonWhitespaceRule, trimIfString } from "../../utils/userForm";

interface CreateUserFormValues {
  name: string;
  medicalName: string;
  email: string;
  password: string;
  phone?: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panCardNumber: string;
}

const buildPayload = (values: CreateUserFormValues): CreateUserPayload => {
  const name = trimIfString(values.name) || "";
  const medicalName = trimIfString(values.medicalName) || "";
  const email = trimIfString(values.email) || "";
  const password = trimIfString(values.password) || "";
  const address = trimIfString(values.address) || "";
  const state = trimIfString(values.state) || "";
  const city = trimIfString(values.city) || "";
  const pincode = trimIfString(values.pincode) || "";
  const gstNumber = trimIfString(values.gstNumber)?.toUpperCase() || "";
  const panCardNumber = trimIfString(values.panCardNumber)?.toUpperCase() || "";

  const payload: CreateUserPayload = {  
    name,
    medicalName,
    email: email.toLowerCase(),
    password,
    address,
    state,
    city,
    pincode,
    gstNumber,
    panCardNumber,
    role: ROLE.USER,
    isActive: true,
  };

  const phone = trimIfString(values.phone);

  if (phone) payload.phone = phone;

  return payload;
};

export default function CreateUser() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync: createUser, isPending } = useCreateUser();
  const [form] = Form.useForm<CreateUserFormValues>();
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

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
            <Form.Item
              name="phone"
              label="Phone"
              rules={[phoneRule]}
              normalize={(value?: string) => (value || "").replace(/\D/g, "")}
            >
              <Input maxLength={10} inputMode="numeric" />
            </Form.Item>
          </Col>
        </Row>

        <UserBusinessFields required />

        <SignatureUploadField
          disabled={isPending}
          onSelectFile={(file) => setSignatureFile(file)}
          onClearFile={() => setSignatureFile(null)}
        />

        <FormActionButtons submitText="Add User" loading={isPending} onCancel={() => navigate(ROUTES.USERS)} />
      </Form>
    </Card>
  );
}
