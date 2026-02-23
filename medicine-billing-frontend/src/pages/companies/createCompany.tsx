import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, Upload, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCreateCompany } from "../../hooks/useCompanies";
import { emailRule, gstRule, phoneRule, requiredRule } from "../../utils/formRules";

const CreateCompany = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCompany();
  const [form] = Form.useForm();
  const [logo, setLogo] = useState<File | null>(null);

  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value || "")));
    if (logo) formData.append("logo", logo);

    try {
      await mutateAsync(formData);
      message.success("Company created");
      navigate(ROUTES.COMPANIES);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to create company");
    }
  };

  return (
    <Card style={{ maxWidth: 820, margin: "0 auto" }}>
      <Typography.Title level={4}>Create Company</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item name="companyName" label="Company Name" rules={[requiredRule("Company name")]}>
          <Input />
        </Form.Item>
        <Form.Item name="gstNumber" label="GST Number" rules={[requiredRule("GST number"), gstRule]}>
          <Input style={{ textTransform: "uppercase" }} />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[emailRule]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[phoneRule]}>
          <Input />
        </Form.Item>
        <Form.Item name="state" label="State" rules={[{ max: 80, message: "State must be 80 characters or less" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ max: 500, message: "Address must be 500 characters or less" }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Logo">
          <Upload beforeUpload={(file) => { setLogo(file); return false; }} maxCount={1}>
            <Button icon={<UploadOutlined />}>Select Logo</Button>
          </Upload>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => navigate(ROUTES.COMPANIES)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create Company
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateCompany;
