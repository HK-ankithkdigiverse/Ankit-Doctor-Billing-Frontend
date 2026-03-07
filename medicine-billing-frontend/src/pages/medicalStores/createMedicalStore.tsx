import { App, Form } from "antd";
import { useNavigate } from "react-router-dom";
import type { MedicalStorePayload } from "../../types/api";
import MedicalStoreFormFields from "../../components/forms/MedicalStoreFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import { ROUTES } from "../../constants";
import { useCreateMedicalStore } from "../../hooks/useMedicalStores";
import { getErrorMessage, trimIfString } from "../../utils/userForm";

interface MedicalStoreFormValues {
  name: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  gstNumber: string;
  panCardNumber: string;
  gstType: "IGST" | "CGST_SGST";
}

const buildPayload = (values: MedicalStoreFormValues): MedicalStorePayload => {
  return {
    name: trimIfString(values.name) || "",
    phone: trimIfString(values.phone) || "",
    address: trimIfString(values.address) || "",
    state: trimIfString(values.state) || "",
    city: trimIfString(values.city) || "",
    pincode: trimIfString(values.pincode) || "",
    gstNumber: (trimIfString(values.gstNumber) || "").toUpperCase(),
    panCardNumber: (trimIfString(values.panCardNumber) || "").toUpperCase(),
    gstType: values.gstType,
    isActive: true,
  };
};

export default function CreateMedicalStore() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { mutateAsync: createMedicalStore, isPending } = useCreateMedicalStore();
  const [form] = Form.useForm<MedicalStoreFormValues>();

  const handleSubmit = async (values: MedicalStoreFormValues) => {
    try {
      await createMedicalStore(buildPayload(values));
      message.success("Medical Store created");
      navigate(ROUTES.MEDICAL_STORES);
    } catch (error: any) {
      message.error(getErrorMessage(error) || "Failed to create Medical Store");
    }
  };

  return (
    <PageShell>
      <SectionCard
        className="w-full"
        style={{ width: "100%", maxWidth: 900, marginInline: "auto" }}
      >
        <SectionTitle className="!mb-[18px] !mt-0">Create Medical Store</SectionTitle>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ gstType: "CGST_SGST" }}
        >
          <MedicalStoreFormFields disabled={isPending} showStatus={false} />
          <FormActionButtons
            submitText="Create Medical Store"
            loading={isPending}
            onCancel={() => navigate(ROUTES.MEDICAL_STORES)}
          />
        </Form>
      </SectionCard>
    </PageShell>
  );
}

