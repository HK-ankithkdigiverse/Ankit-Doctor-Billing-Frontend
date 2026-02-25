import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Form, Input, Upload, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCompany, useUpdateCompany } from "../../hooks/useCompanies";
import { emailRule, gstRule, phoneRule, requiredRule } from "../../utils/formRules";
import { getCompanyDisplayName } from "../../utils/company";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";

const EditCompany = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: company, isLoading } = useCompany(id);
  const { mutateAsync, isPending } = useUpdateCompany();
  const [logo, setLogo] = useState<File | null>(null);

  useEffect(() => {
    if (!company) return;
    form.setFieldsValue({
      companyName: getCompanyDisplayName(company),
      gstNumber: company.gstNumber || "",
      email: company.email || "",
      phone: company.phone || "",
      state: company.state || "",
      address: company.address || "",
    });
  }, [company, form]);

  const handleSubmit = async (values: any) => {
    if (!company) return;
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, String(value || "")));
    if (logo) formData.append("logo", logo);

    try {
      await mutateAsync({ id: company._id, formData });
      message.success("Company updated");
      navigate(`${ROUTES.COMPANIES}/${company._id}`);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to update company");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!company) return <p>Company not found</p>;

  return (
    <PageShell>
      <SectionCard
        className="w-full"
        style={{ width: "100%", maxWidth: 900, marginInline: "auto" }}
      >
        <SectionTitle className="!mb-[18px] !mt-0">Edit Company</SectionTitle>
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
          <Form.Item
            name="phone"
            label="Phone"
            rules={[requiredRule("Phone"), phoneRule]}
            normalize={(value?: string) => (value || "").replace(/\D/g, "")}
          >
            <Input style={{ borderRadius: 10 }} maxLength={10} inputMode="numeric" />
          </Form.Item>
          <Form.Item name="state" label="State" rules={[requiredRule("State"), { max: 80, message: "State must be 80 characters or less" }]}>
            <Input style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[requiredRule("Address"), { max: 500, message: "Address must be 500 characters or less" }]}>
            <Input.TextArea rows={4} style={{ borderRadius: 10 }} />
          </Form.Item>
          <Form.Item label="Logo">
            <Upload beforeUpload={(file) => { setLogo(file); return false; }} maxCount={1}>
              <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>Change Logo</Button>
            </Upload>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button onClick={() => navigate(`${ROUTES.COMPANIES}/${company._id}`)} style={{ marginRight: 8, borderRadius: 10 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isPending} className="!border-0 !bg-hero-gradient !rounded-[10px]">
              Update Company
            </Button>
          </Form.Item>
        </Form>
      </SectionCard>
    </PageShell>
  );
};

export default EditCompany;

