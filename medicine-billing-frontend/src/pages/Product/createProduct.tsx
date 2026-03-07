import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Typography, App } from "antd";
import { useAllCompanies } from "../../hooks/useCompanies";
import { useCreateProduct } from "../../hooks/useProducts";
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

export default function CreateProduct() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const selectedCompanyId = Form.useWatch("companyId", form);
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === ROLE.ADMIN;
  const { data: companyData, isLoading } = useAllCompanies();
  const { data: categoryData } = useAllCategories();
  const { mutateAsync, isPending } = useCreateProduct();

  const companies = companyData?.companies ?? [];
  const categories = categoryData?.categories ?? [];
  const companyOptions = useMemo(() => buildCompanyOptions(companies), [companies]);
  const selectedCompanyMedicalStoreId = useMemo(() => {
    return resolveSelectedCompanyMedicalStoreId(companies, selectedCompanyId || "");
  }, [companies, selectedCompanyId]);

  const categoryOptions = useMemo(() => {
    return buildCategoryOptionsForProductForm({
      categories,
      isAdmin,
      selectedCompanyId: selectedCompanyId || "",
      selectedCompanyMedicalStoreId,
    });
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

