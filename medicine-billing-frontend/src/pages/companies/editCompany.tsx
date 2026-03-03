import { useEffect, useMemo } from "react";
import type { User } from "../../types";
import { useParams, useNavigate } from "react-router-dom";
import { Form, App } from "antd";
import { ROLE, ROUTES } from "../../constants";
import { useCompany, useUpdateCompany } from "../../hooks/useCompanies";
import { useMe } from "../../hooks/useMe";
import { useUsers } from "../../hooks/useUsers";
import { getCompanyDisplayName } from "../../utils/company";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import CompanyFormFields from "../../components/forms/CompanyFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

interface CompanyFormValues {
  userId?: string;
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
  const { data: usersData, isLoading: isUsersLoading } = useUsers(1, 1000, "", "all");
  const userOptions = useMemo<{ label: string; value: string }[]>(
    () =>
      (usersData?.users ?? ([] as User[]))
        .filter(
          (user: User) =>
            user.isActive !== false && String(user.role || "").toUpperCase() === ROLE.USER
        )
        .map((user: User) => ({
          value: user._id,
          label: user.name || user.email || user._id,
        }))
        .sort((a: { label: string; value: string }, b: { label: string; value: string }) =>
          a.label.localeCompare(b.label)
        ),
    [usersData?.users]
  );

  useEffect(() => {
    if (!company) return;
    const selectedUserId =
      typeof company.userId === "string" ? company.userId : company.userId?._id;

    form.setFieldsValue({
      userId: selectedUserId || undefined,
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
            showUserSelect={isAdmin}
            userSelectRequired={isAdmin}
            userOptions={userOptions}
            userSelectLoading={isAdmin && isUsersLoading}
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

