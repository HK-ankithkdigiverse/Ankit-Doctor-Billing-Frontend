import { useNavigate } from "react-router-dom";
import { App } from "antd";
import BillForm from "../../components/billing/billForm";
import { ROLE, ROUTES } from "../../constants";
import { useCompanies } from "../../hooks/useCompanies";
import { useCreateBill } from "../../hooks/useBills";
import { useUsers } from "../../hooks/useUsers";
import { useMe } from "../../hooks/useMe";

const CreateBill = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const { data: companyData } = useCompanies(1, 1000, "");
  const { data: usersData } = useUsers(1, 1000, "", "all");
  const { mutateAsync, isPending } = useCreateBill();

  const companies = companyData?.companies ?? [];
  const users = (usersData?.users ?? []).map((user) => ({
    value: user._id,
    label: user.name ? `${user.name} (${user.email})` : user.email,
  }));

  const handleSubmit = async (payload: {
    userId?: string;
    companyId: string;
    discount: number;
    items: any[];
  }) => {
    try {
      await mutateAsync(payload);
      message.success("Bill created successfully");
      navigate(ROUTES.BILLING);
    } catch (error: any) {
      message.error(error?.message || "Failed to create bill");
    }
  };

  return (
    <BillForm
      title="Create Bill"
      submitText="Create Bill"
      submitLoading={isPending}
      isAdmin={isAdmin}
      users={users}
      companies={companies}
      onSubmit={handleSubmit}
      onCancel={() => navigate(ROUTES.BILLING)}
    />
  );
};

export default CreateBill;
