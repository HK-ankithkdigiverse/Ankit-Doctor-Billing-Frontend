import { Button, Form, Input, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { emailRule, gstRule, phoneRule, requiredRule } from "../../utils/formRules";

interface CompanyFormFieldsProps {
  showLogo?: boolean;
  onLogoSelect?: (file: File | null) => void;
}

export default function CompanyFormFields({ showLogo = false, onLogoSelect }: CompanyFormFieldsProps) {
  return (
    <>
      <Form.Item name="companyName" label="Company Name" rules={[requiredRule("Company name")]}>
        <Input style={{ borderRadius: 10 }} />
      </Form.Item>

      <Form.Item name="gstNumber" label="GST Number" rules={[requiredRule("GST number"), gstRule]}>
        <Input style={{ textTransform: "uppercase", borderRadius: 10 }} />
      </Form.Item>

      <Form.Item name="email" label="Email" rules={[emailRule]}>
        <Input style={{ borderRadius: 10 }} />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[phoneRule]}
        normalize={(value?: string) => (value || "").replace(/\D/g, "")}
      >
        <Input style={{ borderRadius: 10 }} maxLength={10} inputMode="numeric" />
      </Form.Item>

      <Form.Item name="state" label="State" rules={[{ max: 80, message: "State must be 80 characters or less" }]}>
        <Input style={{ borderRadius: 10 }} />
      </Form.Item>

      <Form.Item name="address" label="Address" rules={[{ max: 500, message: "Address must be 500 characters or less" }]}>
        <Input.TextArea rows={4} style={{ borderRadius: 10 }} />
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
            <Button icon={<UploadOutlined />} style={{ borderRadius: 10 }}>
              Select Logo
            </Button>
          </Upload>
        </Form.Item>
      )}
    </>
  );
}
