import { useNavigate } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import { useCompanies } from "../../hooks/useCompanies";
import { useCreateProduct } from "../../hooks/useProducts";
import { ROUTES } from "../../constants";
import { useCategoryDropdown } from "../../hooks/useCategories";
import ProductFormFields from "../../components/forms/ProductFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

const toProductPayload = (values: any) => ({
  ...values,
  mrp: Number(values.mrp || 0),
  price: Number(values.price || 0),
  stock: Number(values.stock || 0),
});

export default function CreateProduct() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: companyData, isLoading } = useCompanies(1, 1000, "");
  const { data: categoryData } = useCategoryDropdown();
  const { mutateAsync, isPending } = useCreateProduct();

  const companies = companyData?.companies ?? [];
  const categoryOptions = (categoryData ?? []).map((c) => ({ value: c.name, label: c.name }));
  const companyOptions = companies.map((c: any) => ({
    value: c._id,
    label: c.companyName || c.name || c.email || c._id,
  }));

  const submit = async (values: any) => {
    try {
      await mutateAsync(toProductPayload(values));
      message.success("Product created");
      navigate(ROUTES.PRODUCTS);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to create product");
    }
  };

  if (isLoading) return <p>Loading companies...</p>;

  return (
    <Card style={{ maxWidth: 820, margin: "0 auto" }}>
      <Typography.Title level={4}>Create Product</Typography.Title>
      <Form form={form} layout="vertical" onFinish={submit}>
        <ProductFormFields categoryOptions={categoryOptions} companyOptions={companyOptions} stockLabel="Opening stock" />

        <FormActionButtons submitText="Create Product" loading={isPending} onCancel={() => navigate(ROUTES.PRODUCTS)} />
      </Form>
    </Card>
  );
}

