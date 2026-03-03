import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, App } from "antd";
import { ROLE, ROUTES } from "../../constants";
import { useCompany, useUpdateCompany } from "../../hooks/useCompanies";
import { useMe } from "../../hooks/useMe";
import { useMedicalStores } from "../../hooks/useMedicalStores";
import { getCompanyDisplayName } from "../../utils/company";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import CompanyFormFields from "../../components/forms/CompanyFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

interface CompanyFormValues {
  medicalStoreId?: string;
  companyName: string;
  gstNumber: string;
  email?: string;
  phone?: string;
  state?: string;
  address?: string;
}

export default function EditCompany() {
  const { message } = App.useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm<CompanyFormValues>();
  const { data: company, isLoading } = useCompany(id);
  const { mutateAsync, isPending } = useUpdateCompany();
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === ROLE.ADMIN;
  const { data: medicalStoresData, isLoading: isLoadingStores } = useMedicalStores(1, 1000, "", {
    enabled: isAdmin,
  });
  const storeOptions = useMemo<{ label: string; value: string }[]>(
    () =>
      (medicalStoresData?.medicalStores ?? [])
        .filter((store) => store.isActive !== false)
        .map((store) => ({
          value: store._id,
          label: store.name || store._id,
        }))
        .sort((a: { label: string; value: string }, b: { label: string; value: string }) =>
          a.label.localeCompare(b.label)
        ),
    [medicalStoresData?.medicalStores]
  );

  useEffect(() => {
    if (!company) return;
    const selectedStoreId =
      typeof company.medicalStoreId === "string" ? company.medicalStoreId : company.medicalStoreId?._id;

    form.setFieldsValue({
      medicalStoreId: selectedStoreId || undefined,
      companyName: getCompanyDisplayName(company),
      gstNumber: company.gstNumber || "",
      email: company.email || "",
      phone: company.phone || "",
      state: company.state || "",
      address: company.address || "",
    });
  }, [company, form]);

  const handleSubmit = async (values: CompanyFormValues) => {
    if (!company) return;
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });

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
        <SectionTitle className="mb-4.5! mt-0!">Edit Company</SectionTitle>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <CompanyFormFields
            showStoreSelect={isAdmin}
            storeSelectRequired={isAdmin}
            storeOptions={storeOptions}
            storeSelectLoading={isAdmin && isLoadingStores}
          />
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
