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
      console.log("Create Bill Payload", payload);
      await mutateAsync(payload);
      message.success("Bill created successfully");
      navigate(ROUTES.BILLING);
    } catch (error: any) {
      console.error("Create Bill Error", error?.response || error);
      const serverMsg = error?.response?.data?.message || error?.response?.data || error?.message;
      message.error(serverMsg || "Failed to create bill");
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
