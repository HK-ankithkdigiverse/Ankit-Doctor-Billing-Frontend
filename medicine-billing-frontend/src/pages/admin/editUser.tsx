import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { App, Button, Card, Col, Form, Input, Row, Typography } from "antd";
import { useUpdateUser, useUsers } from "../../hooks/useUsers";
import type { UpdateUserPayload } from "../../api/userApi";
import { ROUTES } from "../../constants";
import type { User } from "../../types";
import { emailRule, phoneRule, requiredRule } from "../../utils/formRules";
import { uploadSingleFileApi } from "../../api/uploadApi";
import { getUploadFileUrl } from "../../utils/company";
import SignatureUploadField from "../../components/forms/SignatureUploadField";
import UserBusinessFields from "../../components/forms/UserBusinessFields";
import FormActionButtons from "../../components/forms/FormActionButtons";
import { getErrorMessage, isDuplicateEmailError, nonWhitespaceRule, trimIfString } from "../../utils/userForm";
import type { EditUserFormValues, NormalizedEditUserValues } from "../../types/userForm";

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




export default function EditUser() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm<EditUserFormValues>();
  const watchedValues = Form.useWatch([], form);
  const { data, isLoading } = useUsers(1, 1000, "", "all");
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [removeSignature, setRemoveSignature] = useState(false);

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
  const signatureChanged = Boolean(signatureFile) || removeSignature;
  const existingSignatureUrl =
    !removeSignature && !signatureFile ? getUploadFileUrl(user?.signature) : "";

  const handleSubmit = async (values: EditUserFormValues) => {
    if (!id) return;

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

        <UserBusinessFields disabled={isPending} />

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
