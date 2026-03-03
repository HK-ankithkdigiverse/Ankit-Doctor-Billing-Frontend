import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import { useCompanies } from "../../hooks/useCompanies";
import { useCreateProduct } from "../../hooks/useProducts";
import { ROLE, ROUTES } from "../../constants";
import { useCategories } from "../../hooks/useCategories";
import { useMe } from "../../hooks/useMe";
import ProductFormFields from "../../components/forms/ProductFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";

const toProductPayload = (values: any) => ({
  ...values,
  mrp: Number(values.mrp || 0),
  price: Number(values.price || 0),
  stock: Number(values.stock || 0),
});

const toId = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id?: unknown })._id || "");
  }
  return "";
};

const getCompanyMedicalStoreId = (company: any) => toId(company?.medicalStoreId);

const getCategoryMedicalStoreId = (category: any) => toId(category?.medicalStoreId);

export default function CreateProduct() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const selectedCompanyId = Form.useWatch("companyId", form);
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === ROLE.ADMIN;
  const { data: companyData, isLoading } = useCompanies(1, 1000, "");
  const { data: categoryData } = useCategories(1, 100, "");
  const { mutateAsync, isPending } = useCreateProduct();

  const companies = companyData?.companies ?? [];
  const categories = categoryData?.categories ?? [];
  const companyOptions = companies.map((c: any) => ({
    value: c._id,
    label: c.companyName || c.name || c.email || c._id,
  }));
  const selectedCompanyMedicalStoreId = useMemo(() => {
    if (!selectedCompanyId) return "";
    const selectedCompany = companies.find((company: any) => company._id === selectedCompanyId);
    return getCompanyMedicalStoreId(selectedCompany);
  }, [companies, selectedCompanyId]);

  const categoryOptions = useMemo(() => {
    const filteredCategories = categories.filter((category: any) => {
      if (!isAdmin) return true;
      if (!selectedCompanyId) return false;
      if (!selectedCompanyMedicalStoreId) return true;
      const categoryStoreId = getCategoryMedicalStoreId(category);
      if (!categoryStoreId) return true;
      return categoryStoreId === selectedCompanyMedicalStoreId;
    });

    const options = filteredCategories.map((category: any) => ({
      value: category.name,
      label: category.name,
    }));

    const deduped = new Map<string, { value: string; label: string }>();
    options.forEach((option) => {
      if (!deduped.has(option.value)) deduped.set(option.value, option);
    });

    return [...deduped.values()];
  }, [categories, isAdmin, selectedCompanyId, selectedCompanyMedicalStoreId]);

  useEffect(() => {
    const selectedCategory = form.getFieldValue("category");
    if (!selectedCategory) return;
    const isValidCategory = categoryOptions.some((option) => option.value === selectedCategory);
    if (!isValidCategory) {
      form.setFieldValue("category", undefined);
    }
  }, [categoryOptions, form]);

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
        <ProductFormFields
          categoryOptions={categoryOptions}
          companyOptions={companyOptions}
          stockLabel="Opening stock"
          categoryDisabled={isAdmin ? !selectedCompanyId || categoryOptions.length === 0 : false}
          categoryPlaceholder={
            isAdmin && !selectedCompanyId ? "Select company first" : "Select category"
          }
        />

        <FormActionButtons submitText="Create Product" loading={isPending} onCancel={() => navigate(ROUTES.PRODUCTS)} />
      </Form>
    </Card>
  );
}

