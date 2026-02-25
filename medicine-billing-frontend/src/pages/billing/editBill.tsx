import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { App } from "antd";
import BillForm from "../../components/billing/billForm";
import { ROLE, ROUTES } from "../../constants";
import { useBill, useUpdateBill } from "../../hooks/useBills";
import { useCompanies } from "../../hooks/useCompanies";
import { useUsers } from "../../hooks/useUsers";
import { useMe } from "../../hooks/useMe";

const EditBill = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const { data: billData, isLoading } = useBill(id);
  const { data: companyData } = useCompanies(1, 1000, "");
  const { data: usersData } = useUsers(1, 1000, "", "all");
  const { mutateAsync, isPending } = useUpdateBill();

  const companies = companyData?.companies ?? [];
  const users = (usersData?.users ?? []).map((user) => ({
    value: user._id,
    label: user.name ? `${user.name} (${user.email})` : user.email,
  }));

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
    userId?: string;
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
      isAdmin={isAdmin}
      users={users}
      initialUserId={(billData.bill.userId as any)?._id || ""}
      companies={companies}
      initialCompanyId={(billData.bill.companyId as any)?._id || ""}
      initialCompanyName={(billData.bill.companyId as any)?.companyName || (billData.bill.companyId as any)?.name || ""}
      initialDiscount={Number(billData.bill.discount || 0)}
      initialItems={initialItems}
      onSubmit={handleSubmit}
      onCancel={() => navigate(ROUTES.BILL_DETAILS(id))}
    />
  );
};

export default EditBill;
