import { useNavigate, useParams } from "react-router-dom";
import { App } from "antd";
import BillForm from "../../components/billing/billForm";
import { ROUTES } from "../../constants";
import { useBill, useUpdateBill } from "../../hooks/useBills";
import { useBillFormMeta } from "../../hooks/useBillFormMeta";
import type { BillPayload } from "../../types/bill";
import {
  normalizeBillItemsForForm,
  resolveBillDiscountPercent,
  resolveBillGstPercent,
} from "../../utils/billing";

export default function EditBill() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, companies, users } = useBillFormMeta();
  const isValidBillId = !!id && /^[a-fA-F0-9]{24}$/.test(id);
  const { data: billData, isLoading } = useBill(id, { enabled: isValidBillId });
  const { mutateAsync, isPending } = useUpdateBill();

  const initialItems = normalizeBillItemsForForm(billData?.items);
  const initialDiscountPercent = resolveBillDiscountPercent(billData?.bill);
  const initialGstPercent = resolveBillGstPercent(billData?.bill, billData?.items ?? []);

  if (isLoading) return <p>Loading...</p>;
  if (!billData || !id) return <p>Bill not found</p>;

  const handleSubmit = async (payload: BillPayload) => {
    try {
      await mutateAsync({
        id,
        payload,
      });
      message.success("Bill updated successfully");
      navigate(ROUTES.BILL_DETAILS(id));
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to update bill");
    }
  };

  return (
    <BillForm
      title="Edit Bill"
      submitText="Update Bill"
      submitLoading={isPending}
      isAdmin={isAdmin}
      users={users}
      initialUserId={(billData.bill.userId as any)?._id || ""}
      companies={companies}
      initialCompanyId={(billData.bill.companyId as any)?._id || ""}
      initialCompanyName={(billData.bill.companyId as any)?.companyName || (billData.bill.companyId as any)?.name || ""}
      initialDiscount={initialDiscountPercent}
      initialGstPercent={initialGstPercent}
      initialItems={initialItems}
      onSubmit={handleSubmit}
      onCancel={() => navigate(ROUTES.BILL_DETAILS(id))}
    />
  );
}
