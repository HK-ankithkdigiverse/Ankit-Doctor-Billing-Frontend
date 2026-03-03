import { useMemo, useState } from "react";
import type { User } from "../../types";
import { useNavigate } from "react-router-dom";
import { Form, App } from "antd";
import { ROLE, ROUTES } from "../../constants";
import { useCreateCompany } from "../../hooks/useCompanies";
import { useMe } from "../../hooks/useMe";
import { useUsers } from "../../hooks/useUsers";
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

export default function CreateCompany() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateCompany();
  const [form] = Form.useForm<CompanyFormValues>();
  const [logo, setLogo] = useState<File | null>(null);
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

  const handleSubmit = async (values: CompanyFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
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
        <SectionTitle className="mb-4.5! mt-0!">Create Company</SectionTitle>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <CompanyFormFields
            showLogo
            onLogoSelect={setLogo}
            showUserSelect={isAdmin}
            userSelectRequired={isAdmin}
            userOptions={userOptions}
            userSelectLoading={isAdmin && isUsersLoading}
          />
          <div className="rounded-[10px]!">
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

