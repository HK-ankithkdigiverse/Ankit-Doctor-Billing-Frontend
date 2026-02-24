import { useNavigate } from "react-router-dom";
import { App } from "antd";
import BillForm from "../../components/billing/billForm";
import { ROUTES } from "../../constants";
import { useCompanies } from "../../hooks/useCompanies";
import { useCreateBill } from "../../hooks/useBills";

const CreateBill = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { data: companyData } = useCompanies(1, 1000, "");
  const { mutateAsync, isPending } = useCreateBill();

  const companies = companyData?.companies ?? [];

  const handleSubmit = async (payload: {
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
      companies={companies}
      onSubmit={handleSubmit}
      onCancel={() => navigate(ROUTES.BILLING)}
    />
  );
};

export default CreateBill;
