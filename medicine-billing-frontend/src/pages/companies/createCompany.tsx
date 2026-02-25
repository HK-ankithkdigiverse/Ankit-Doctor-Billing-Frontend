import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Upload, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCreateCompany } from "../../hooks/useCompanies";
import { emailRule, gstRule, phoneRule, requiredRule } from "../../utils/formRules";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";

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
    <PageShell>
      <SectionCard
        className="w-full"
        style={{ width: "100%", maxWidth: 900, marginInline: "auto" }}
      >
        <SectionTitle className="!mb-[18px] !mt-0">Create Company</SectionTitle>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="companyName" label="Company Name" rules={[requiredRule("Company name")]}>
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="gstNumber" label="GST Number" rules={[requiredRule("GST number"), gstRule]}>
            <Input style={{ textTransform: "uppercase", borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[requiredRule("Email"), emailRule]}>
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[requiredRule("Phone"), phoneRule]}>
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="state" label="State" rules={[requiredRule("State"), { max: 80, message: "State must be 80 characters or less" }]}>
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[requiredRule("Address"), { max: 500, message: "Address must be 500 characters or less" }]}>
            <Input.TextArea rows={4} style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item label="Logo">
            <Upload beforeUpload={(file) => { setLogo(file); return false; }} maxCount={1}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>Select Logo</Button>
            </Upload>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button onClick={() => navigate(ROUTES.COMPANIES)} style={{ marginRight: 8, borderRadius: 10 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isPending} className="!border-0 !bg-hero-gradient !rounded-[10px]">
              Create Company
            </Button>
          </Form.Item>
        </Form>
      </SectionCard>
    </PageShell>
  );
};

export default CreateCompany;

