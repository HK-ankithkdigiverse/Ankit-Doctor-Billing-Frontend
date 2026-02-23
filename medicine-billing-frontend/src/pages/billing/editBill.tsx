import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App } from "antd";
import BillForm from "../../components/billing/billForm";
import { ROUTES } from "../../constants";
import { useBill, useUpdateBill } from "../../hooks/useBills";
import { useCompanies } from "../../hooks/useCompanies";

const EditBill = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: billData, isLoading } = useBill(id);
  const { data: companyData } = useCompanies(1, 100, "");
  const { mutateAsync, isPending } = useUpdateBill();

  const companies = companyData?.companies ?? [];

  const initialItems = useMemo(
    () =>
      (billData?.items || []).map((item: any) => ({
        productId: item.productId?._id || item.productId || "",
        qty: Number(item.qty || 1),
        freeQty: Number(item.freeQty || 0),
        rate: Number(item.rate || 0),
        mrp: Number(item.mrp || 0),
        taxPercent: Number(item.taxPercent || 0),
        discount: Number(item.discount || 0),
      })),
    [billData]
  );

  if (isLoading) return <p>Loading...</p>;
  if (!billData || !id) return <p>Bill not found</p>;

  const handleSubmit = async (payload: {
    companyId: string;
    discount: number;
    items: any[];
  }) => {
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
      companies={companies}
      initialCompanyId={(billData.bill.companyId as any)?._id || ""}
      initialDiscount={Number(billData.bill.discount || 0)}
      initialItems={initialItems}
      onSubmit={handleSubmit}
      onCancel={() => navigate(ROUTES.BILL_DETAILS(id))}
    />
  );
};

export default EditBill;
