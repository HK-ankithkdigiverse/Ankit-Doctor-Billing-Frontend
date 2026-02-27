import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, App } from "antd";
import { ROUTES } from "../../constants";
import { useCreateCompany } from "../../hooks/useCompanies";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import CompanyFormFields from "../../components/forms/CompanyFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

export default function CreateCompany() {
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
          <CompanyFormFields showLogo onLogoSelect={setLogo} />
          <div className="!rounded-[10px]">
            <FormActionButtons
              submitText="Create Company"
              loading={isPending}
              onCancel={() => navigate(ROUTES.COMPANIES)}
            />
          </div>
        </Form>
      </SectionCard>
    </PageShell>
  );
}

