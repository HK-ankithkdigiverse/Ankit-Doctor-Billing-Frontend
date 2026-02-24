import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, Upload, App } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCompanies, useUpdateCompany } from "../../hooks/useCompanies";
import { emailRule, gstRule, phoneRule, requiredRule } from "../../utils/formRules";

const EditCompany = () => {
  const { message } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data, isLoading } = useCompanies(1, 100, "");
  const { mutateAsync, isPending } = useUpdateCompany();
  const [logo, setLogo] = useState<File | null>(null);

  const company = data?.companies.find((c) => c._id === id);

  useEffect(() => {
    if (!company) return;
    form.setFieldsValue({
      companyName: company.companyName || "",
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
    <Card style={{ maxWidth: 820, margin: "0 auto" }}>
      <Typography.Title level={4}>Edit Company</Typography.Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="companyName" label="Company Name" rules={[requiredRule("Company name")]}>
          <Input />
        </Form.Item>
        <Form.Item name="gstNumber" label="GST Number" rules={[requiredRule("GST number"), gstRule]}>
          <Input style={{ textTransform: "uppercase" }} />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[requiredRule("Email"), emailRule]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[requiredRule("Phone"), phoneRule]}>
          <Input />
        </Form.Item>
        <Form.Item name="state" label="State" rules={[requiredRule("State"), { max: 80, message: "State must be 80 characters or less" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[requiredRule("Address"), { max: 500, message: "Address must be 500 characters or less" }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Logo">
          <Upload beforeUpload={(file) => { setLogo(file); return false; }} maxCount={1}>
            <Button icon={<UploadOutlined />}>Change Logo</Button>
          </Upload>
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => navigate(`${ROUTES.COMPANIES}/${company._id}`)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update Company
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditCompany;

