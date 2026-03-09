import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App, Card, Col, Form, Input, Row, Typography } from "antd";
import { ROUTES } from "../../constants";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { emailRule, optionalPhoneRule, requiredRule } from "../../utils/formRules";
import { uploadSingleFileApi } from "../../api/uploadApi";
import { getUploadFileUrl } from "../../utils/company";
import SignatureUploadField from "../../components/forms/SignatureUploadField";
import FormActionButtons from "../../components/forms/FormActionButtons";
import { nonWhitespaceRule, trimIfString } from "../../utils/userForm";

interface EditProfileFormValues {
  name: string;
  email: string;
  phoneNumber?: string;
  signature?: string;
}

export default function EditProfile() {
  const { message } = App.useApp();
  const { data: user } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfile();
  const navigate = useNavigate();
  const [form] = Form.useForm<EditProfileFormValues>();
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [removeSignature, setRemoveSignature] = useState(false);

  useEffect(() => {
    if (!user) return;
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || user.phone || "",
      signature: user.signature || "",
    });
  }, [user, form]);

  if (!user) return null;
  const existingSignatureUrl =
    !removeSignature && !signatureFile ? getUploadFileUrl(user.signature) : "";

  const handleSave = async (values: EditProfileFormValues) => {
    try {
      const payload: Parameters<typeof mutateAsync>[0] = {
        name: trimIfString(values.name) || "",
        email: (trimIfString(values.email) || "").toLowerCase(),
      };
      const phoneNumber = trimIfString(values.phoneNumber);
      if (phoneNumber) {
        payload.phoneNumber = phoneNumber;
      }

      if (signatureFile) {
        payload.signature = await uploadSingleFileApi(signatureFile);
      } else if (removeSignature) {
        payload.signature = "";
      }

      await mutateAsync(payload);
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
          <Col xs={24}>
            <Form.Item
              name="name"
              label="Name"
              rules={[requiredRule("Name"), nonWhitespaceRule("Name"), { min: 2, message: "Name must be at least 2 characters" }]}
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
            <Form.Item
              name="phoneNumber"
              label="Phone Number (Optional)"
              rules={[optionalPhoneRule]}
              normalize={(value?: string) => (value || "").replace(/\D/g, "").slice(0, 10)}
            >
              <Input maxLength={10} inputMode="numeric" />
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

        <FormActionButtons submitText="Save Changes" loading={isPending} onCancel={() => navigate(ROUTES.PROFILE)} />
      </Form>
    </Card>
  );
}





