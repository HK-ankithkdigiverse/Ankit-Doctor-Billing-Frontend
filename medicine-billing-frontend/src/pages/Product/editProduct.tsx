import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import { useCompanies } from "../../hooks/useCompanies";
import { useUpdateProduct, useProduct } from "../../hooks/useProducts";
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

export default function UpdateProduct() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: product, isLoading } = useProduct(id!);
  const { data: companyData } = useCompanies(1, 1000, "");
  const { data: categoryData } = useCategoryDropdown();
  const { mutateAsync, isPending } = useUpdateProduct();

  const companies = companyData?.companies ?? [];
  const categoryOptions = (categoryData ?? []).map((c) => ({ value: c.name, label: c.name }));
  const companyOptions = useMemo(() => {
    const options = companies.map((c: any) => ({
      value: c._id,
      label: c.companyName || c.name || c.email || c._id,
    }));

    const currentCompany = product?.companyId as any;
    const currentCompanyId = currentCompany?._id;
    const currentCompanyName = currentCompany?.companyName || currentCompany?.name;
    if (
      currentCompanyId &&
      currentCompanyName &&
      !options.some((opt) => opt.value === currentCompanyId)
    ) {
      options.push({ value: currentCompanyId, label: currentCompanyName });
    }

    return options;
  }, [companies, product]);

  useEffect(() => {
    if (!product) return;
    form.setFieldsValue({
      name: product.name ?? "",
      category: product.category ?? "",
      productType: product.productType ?? "",
      companyId: product.companyId?._id ?? "",
      mrp: product.mrp ?? 0,
      price: product.price ?? 0,
      stock: product.stock ?? 0,
    });
  }, [product, form]);

  const submit = async (values: any) => {
    if (!id) return;
    try {
      await mutateAsync({
        id,
        data: toProductPayload(values),
      });
      message.success("Product updated");
      navigate(ROUTES.PRODUCTS);
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to update product");
    }
  };

  if (isLoading || !product) return <p>Loading...</p>;

  return (
    <Card style={{ maxWidth: 820, margin: "0 auto" }}>
      <Typography.Title level={4}>Update Product</Typography.Title>
      <Form form={form} layout="vertical" onFinish={submit}>
        <ProductFormFields categoryOptions={categoryOptions} companyOptions={companyOptions} stockLabel="Stock" />

        <FormActionButtons submitText="Update Product" loading={isPending} onCancel={() => navigate(ROUTES.PRODUCTS)} />
      </Form>
    </Card>
  );
}
