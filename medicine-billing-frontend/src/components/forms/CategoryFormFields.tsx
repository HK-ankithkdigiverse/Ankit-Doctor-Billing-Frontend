import { Form, Input } from "antd";
import { requiredRule } from "../../utils/formRules";

export default function CategoryFormFields() {
  return (
    <>
      <Form.Item
        name="name"
        label="Category Name"
        rules={[requiredRule("Category name"), { min: 2, message: "Category name must be at least 2 characters" }]}
      >
        <Input placeholder="Enter category name" />
      </Form.Item>

      <Form.Item name="description" label="Description" rules={[{ max: 500, message: "Description cannot exceed 500 characters" }]}>
        <Input.TextArea rows={4} placeholder="Enter description (optional)" />
      </Form.Item>
    </>
  );
}
