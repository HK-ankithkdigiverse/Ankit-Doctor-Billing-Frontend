import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, App } from "antd";
import { ROUTES } from "../../constants";
import { useCompany, useUpdateCompany } from "../../hooks/useCompanies";
import { getCompanyDisplayName } from "../../utils/company";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import CompanyFormFields from "../../components/forms/CompanyFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

export default function EditCompany() {
  const { message } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: company, isLoading } = useCompany(id);
  const { mutateAsync, isPending } = useUpdateCompany();

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
          <CompanyFormFields />
          <FormActionButtons
            submitText="Update Company"
            loading={isPending}
            onCancel={() => navigate(`${ROUTES.COMPANIES}/${company._id}`)}
          />
        </Form>
      </SectionCard>
    </PageShell>
  );
}

