import { Form, Input, InputNumber, Select } from "antd";
import { requiredRule } from "../../utils/formRules";

type Option = {
  value: string;
  label: string;
};

interface ProductFormFieldsProps {
  categoryOptions: Option[];
  companyOptions: Option[];
  stockLabel?: string;
}

export default function ProductFormFields({ categoryOptions, companyOptions, stockLabel = "Stock" }: ProductFormFieldsProps) {
  return (
    <>
      <Form.Item
        name="name"
        label="Product Name"
        rules={[requiredRule("Product name"), { min: 2, message: "Product name must be at least 2 characters" }]}
      >
        <Input placeholder="Enter product name" />
      </Form.Item>

      <Form.Item name="category" label="Category" rules={[requiredRule("Category")]}>
        <Select placeholder="Select category" options={categoryOptions} />
      </Form.Item>

      <Form.Item name="productType" label="Product Type" rules={[requiredRule("Product type")]}>
        <Input placeholder="Tablet / Syrup / Item" />
      </Form.Item>

      <Form.Item name="companyId" label="Company" rules={[requiredRule("Company")]}>
        <Select placeholder="Select company" options={companyOptions} />
      </Form.Item>

      <Form.Item label="Pricing" style={{ marginBottom: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Form.Item name="mrp" label="MRP" rules={[requiredRule("MRP"), { type: "number", min: 0.01, message: "MRP must be greater than 0" }]}>
            <InputNumber style={{ width: "100%" }} min={0.01} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Selling Price"
            rules={[requiredRule("Selling price"), { type: "number", min: 0.01, message: "Selling price must be greater than 0" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0.01} />
          </Form.Item>
        </div>
      </Form.Item>

      <Form.Item label="Stock" style={{ marginBottom: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <Form.Item name="stock" label={stockLabel} rules={[requiredRule(stockLabel), { type: "number", min: 0, message: "Stock cannot be negative" }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </div>
      </Form.Item>
    </>
  );
}
