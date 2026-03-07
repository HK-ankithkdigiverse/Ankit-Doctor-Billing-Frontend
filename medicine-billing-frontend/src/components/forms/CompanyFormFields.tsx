import { Button, Form, Input, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { emailRule, gstRule, phoneRule, requiredRule } from "../../utils/formRules";

interface CompanyFormFieldsProps {
  showLogo?: boolean;
  onLogoSelect?: (file: File | null) => void;
  showStoreSelect?: boolean;
  storeSelectRequired?: boolean;
  storeOptions?: Array<{ label: string; value: string }>;
  storeSelectLoading?: boolean;
}

export default function CompanyFormFields({
  showLogo = false,
  onLogoSelect,
  showStoreSelect = false,
  storeSelectRequired = false,
  storeOptions = [],
  storeSelectLoading = false,
}: CompanyFormFieldsProps) {
  return (
    <>
      {showStoreSelect && (
        <Form.Item
          name="medicalStoreId"
          label="Store"
          rules={storeSelectRequired ? [requiredRule("Store")] : []}
          extra={
            !storeSelectLoading && storeOptions.length === 0
              ? "No active medical store found."
              : undefined
          }
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder={storeSelectLoading ? "Loading stores..." : "Select store"}
            options={storeOptions}
            loading={storeSelectLoading}
            allowClear={!storeSelectRequired}
          />
        </Form.Item>
      )}

      <Form.Item name="companyName" label="Company Name" rules={[requiredRule("Company name")]}>
        <Input />
      </Form.Item>

      <Form.Item name="gstNumber" label="GST Number" rules={[requiredRule("GST number"), gstRule]}>
        <Input style={{ textTransform: "uppercase" }} />
      </Form.Item>

      <Form.Item name="email" label="Email" rules={[emailRule]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[phoneRule]}
        normalize={(value?: string) => (value || "").replace(/\D/g, "")}
      >
        <Input maxLength={10} inputMode="numeric" />
      </Form.Item>

      <Form.Item name="state" label="State" rules={[{ max: 80, message: "State must be 80 characters or less" }]}>
        <Input />
      </Form.Item>

      <Form.Item name="address" label="Address" rules={[{ max: 500, message: "Address must be 500 characters or less" }]}>
        <Input.TextArea rows={4} />
      </Form.Item>

      {showLogo && (
        <Form.Item label="Logo">
          <Upload
            beforeUpload={(file) => {
              onLogoSelect?.(file);
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>
              Select Logo
            </Button>
          </Upload>
        </Form.Item>
      )}
    </>
  );
}
