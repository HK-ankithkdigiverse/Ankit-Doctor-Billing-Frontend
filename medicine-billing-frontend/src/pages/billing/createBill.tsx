import { useNavigate } from "react-router-dom";
import { App } from "antd";
import BillForm from "../../components/billing/billForm";
import { ROUTES } from "../../constants";
import { useCreateBill } from "../../hooks/useBills";
import { useBillFormMeta } from "../../hooks/useBillFormMeta";
import type { BillPayload } from "../../types/bill";

export default function CreateBill() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { isAdmin, companies, users } = useBillFormMeta();
  const { mutateAsync, isPending } = useCreateBill();

  const handleSubmit = async (payload: BillPayload) => {
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
}
