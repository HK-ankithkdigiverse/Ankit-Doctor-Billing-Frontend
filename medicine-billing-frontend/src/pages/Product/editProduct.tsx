import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import { useCompanies } from "../../hooks/useCompanies";
import { useUpdateProduct, useProduct } from "../../hooks/useProducts";
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

const getCompanyMedicalStoreId = (company: any) =>
  toId(company?.medicalStoreId) || toId(company?.userId?.medicalStoreId);

const getCategoryMedicalStoreId = (category: any) =>
  toId(category?.medicalStoreId) || toId(category?.createdBy?.medicalStoreId);

export default function UpdateProduct() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const selectedCompanyId = Form.useWatch("companyId", form);
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === ROLE.ADMIN;
  const { data: product, isLoading } = useProduct(id!);
  const { data: companyData } = useCompanies(1, 1000, "");
  const { data: categoryData } = useCategories(1, 100, "");
  const { mutateAsync, isPending } = useUpdateProduct();

  const companies = companyData?.companies ?? [];
  const categories = categoryData?.categories ?? [];
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
  const selectedCompanyMedicalStoreId = useMemo(() => {
    if (!selectedCompanyId) return "";
    const selectedCompany =
      companies.find((company: any) => company._id === selectedCompanyId) ||
      (product?.companyId as any);
    return getCompanyMedicalStoreId(selectedCompany);
  }, [companies, product, selectedCompanyId]);

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

    if (product?.category && !options.some((option) => option.value === product.category)) {
      options.push({ value: product.category, label: product.category });
    }

    const deduped = new Map<string, { value: string; label: string }>();
    options.forEach((option) => {
      if (!deduped.has(option.value)) deduped.set(option.value, option);
    });

    return [...deduped.values()];
  }, [categories, isAdmin, product?.category, selectedCompanyId, selectedCompanyMedicalStoreId]);

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

  useEffect(() => {
    const selectedCategory = form.getFieldValue("category");
    if (!selectedCategory) return;
    const isValidCategory = categoryOptions.some((option) => option.value === selectedCategory);
    if (!isValidCategory) {
      form.setFieldValue("category", undefined);
    }
  }, [categoryOptions, form]);

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
        <ProductFormFields
          categoryOptions={categoryOptions}
          companyOptions={companyOptions}
          stockLabel="Stock"
          categoryDisabled={isAdmin ? !selectedCompanyId || categoryOptions.length === 0 : false}
          categoryPlaceholder={
            isAdmin && !selectedCompanyId ? "Select company first" : "Select category"
          }
        />

        <FormActionButtons submitText="Update Product" loading={isPending} onCancel={() => navigate(ROUTES.PRODUCTS)} />
      </Form>
    </Card>
  );
}
