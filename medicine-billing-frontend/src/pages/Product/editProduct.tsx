import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import { useAllCompanies } from "../../hooks/useCompanies";
import { useUpdateProduct, useProduct } from "../../hooks/useProducts";
import { ROLE, ROUTES } from "../../constants";
import { useAllCategories } from "../../hooks/useCategories";
import { useMe } from "../../hooks/useMe";
import ProductFormFields from "../../components/forms/ProductFormFields";
import FormActionButtons from "../../components/forms/FormActionButtons";
import {
  buildCategoryOptionsForProductForm,
  buildCompanyOptions,
  resolveSelectedCompanyMedicalStoreId,
  toProductPayload,
} from "../../utils/productForm";

export default function UpdateProduct() {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const selectedCompanyId = Form.useWatch("companyId", form);
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === ROLE.ADMIN;
  const { data: product, isLoading } = useProduct(id!);
  const { data: companyData } = useAllCompanies();
  const { data: categoryData } = useAllCategories();
  const { mutateAsync, isPending } = useUpdateProduct();

  const companies = companyData?.companies ?? [];
  const categories = categoryData?.categories ?? [];
  const companyOptions = useMemo(() => {
    return buildCompanyOptions(companies, {
      includeCompany: (product?.companyId as any) || null,
    });
  }, [companies, product]);
  const selectedCompanyMedicalStoreId = useMemo(() => {
    return resolveSelectedCompanyMedicalStoreId(companies, selectedCompanyId || "", {
      fallbackCompany: (product?.companyId as any) || null,
    });
  }, [companies, product, selectedCompanyId]);

  const categoryOptions = useMemo(() => {
    return buildCategoryOptionsForProductForm({
      categories,
      isAdmin,
      selectedCompanyId: selectedCompanyId || "",
      selectedCompanyMedicalStoreId,
      includeCategoryName: product?.category,
    });
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
