import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Form, Input, InputNumber, Select, Typography, App } from "antd";
import { useCompanies } from "../../hooks/useCompanies";
import { useUpdateProduct, useProduct } from "../../hooks/useProducts";
import { ROUTES } from "../../constants";
import { useCategoryDropdown } from "../../hooks/useCategories";
import { requiredRule } from "../../utils/formRules";

const UpdateProduct = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: product, isLoading } = useProduct(id!);
  const { data: companyData } = useCompanies(1, 1000, "");
  const { data: categoryData } = useCategoryDropdown();
  const { mutateAsync, isPending } = useUpdateProduct();

  const companies = companyData?.companies ?? [];
  const categories = categoryData ?? [];
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
      taxPercent: product.taxPercent ?? 0,
      stock: product.stock ?? 0,
    });
  }, [product, form]);

  const submit = async (values: any) => {
    if (!id) return;
    try {
      await mutateAsync({
        id,
        data: {
          ...values,
          mrp: Number(values.mrp || 0),
          price: Number(values.price || 0),
          taxPercent: Number(values.taxPercent || 0),
          stock: Number(values.stock || 0),
        },
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
        <Form.Item name="name" label="Product Name" rules={[requiredRule("Product name"), { min: 2, message: "Product name must be at least 2 characters" }]}>
          <Input />
        </Form.Item>

        <Form.Item name="category" label="Category" rules={[requiredRule("Category")]}>
          <Select options={categories.map((c) => ({ value: c.name, label: c.name }))} />
        </Form.Item>

        <Form.Item name="productType" label="Product Type" rules={[requiredRule("Product type")]}>
          <Input />
        </Form.Item>

        <Form.Item name="companyId" label="Company" rules={[requiredRule("Company")]}>
          <Select options={companyOptions} />
        </Form.Item>

        <Form.Item label="Pricing" style={{ marginBottom: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="mrp" label="MRP" rules={[requiredRule("MRP")]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
            <Form.Item name="price" label="Selling Price" rules={[requiredRule("Selling price")]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label="Tax & Stock" style={{ marginBottom: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item name="taxPercent" label="GST (%)" rules={[requiredRule("GST"), { type: "number", min: 0, max: 100, message: "GST must be between 0 and 100" }]}>
              <InputNumber style={{ width: "100%" }} min={0} max={100} />
            </Form.Item>
            <Form.Item name="stock" label="Stock" rules={[requiredRule("Stock"), { type: "number", min: 0, message: "Stock cannot be negative" }]}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button onClick={() => navigate(ROUTES.PRODUCTS)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update Product
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UpdateProduct;

