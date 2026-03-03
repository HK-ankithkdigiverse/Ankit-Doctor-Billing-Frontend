import { useEffect } from "react";
import { App, Button, Form, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import type { MedicalStorePayload } from "../../modules/medicalStores/api";
import MedicalStoreFormFields from "../../components/forms/MedicalStoreFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import { ROUTES } from "../../constants";
import { useMedicalStore, useUpdateMedicalStore } from "../../hooks/useMedicalStores";
import { getErrorMessage, trimIfString } from "../../common/helpers/userForm";

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
  isActive?: boolean;
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
    isActive: values.isActive !== false,
  };
};

export default function EditMedicalStore() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm<MedicalStoreFormValues>();
  const { data: medicalStore, isLoading } = useMedicalStore(id);
  const { mutateAsync: updateMedicalStore, isPending } = useUpdateMedicalStore();

  useEffect(() => {
    if (!medicalStore) return;
    form.setFieldsValue({
      name: medicalStore.name || "",
      phone: medicalStore.phone || "",
      address: medicalStore.address || "",
      state: medicalStore.state || "",
      city: medicalStore.city || "",
      pincode: medicalStore.pincode || "",
      gstNumber: medicalStore.gstNumber || "",
      panCardNumber: medicalStore.panCardNumber || "",
      gstType:
        (medicalStore as any).gstType === "IGST" ||
        (medicalStore as any).taxType === "INTER"
          ? "IGST"
          : "CGST_SGST",
      isActive: medicalStore.isActive !== false,
    });
  }, [form, medicalStore]);

  const handleSubmit = async (values: MedicalStoreFormValues) => {
    if (!medicalStore) return;

    try {
      await updateMedicalStore({
        id: medicalStore._id,
        payload: buildPayload(values),
      });
      message.success("Medical Store updated");
      navigate(ROUTES.MEDICAL_STORES);
    } catch (error: any) {
      message.error(getErrorMessage(error) || "Failed to update Medical Store");
    }
  };

  if (isLoading) return <p>Loading...</p>;

  if (!medicalStore) {
    return (
      <SectionCard style={{ maxWidth: 900, margin: "0 auto" }}>
        <Typography.Title level={4}>Edit Medical Store</Typography.Title>
        <Typography.Paragraph>Medical Store not found.</Typography.Paragraph>
        <Button onClick={() => navigate(ROUTES.MEDICAL_STORES)}>
          Back to Medical Stores
        </Button>
      </SectionCard>
    );
  }

  return (
    <PageShell>
      <SectionCard
        className="w-full"
        style={{ width: "100%", maxWidth: 900, marginInline: "auto" }}
      >
        <SectionTitle className="!mb-[18px] !mt-0">Edit Medical Store</SectionTitle>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <MedicalStoreFormFields disabled={isPending} showStatus />
          <FormActionButtons
            submitText="Update Medical Store"
            loading={isPending}
            onCancel={() => navigate(ROUTES.MEDICAL_STORES)}
          />
        </Form>
      </SectionCard>
    </PageShell>
  );
}
