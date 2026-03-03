import { Col, Form, Input, Row, Select, Switch } from "antd";
import { nonWhitespaceRule } from "../../utils/userForm";
import { phoneRule, requiredRule } from "../../utils/formRules";
import UserBusinessFields from "./UserBusinessFields";

type MedicalStoreFormFieldsProps = {
  disabled?: boolean;
  showStatus?: boolean;
};

export default function MedicalStoreFormFields({
  disabled = false,
  showStatus = true,
}: MedicalStoreFormFieldsProps) {
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="name"
            label="Medical Store Name"
            rules={[
              requiredRule("Medical Store Name"),
              nonWhitespaceRule("Medical Store Name"),
              { min: 2, message: "Medical Store Name must be at least 2 characters" },
              { max: 120, message: "Medical Store Name must be 120 characters or less" },
            ]}
          >
            <Input maxLength={120} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[requiredRule("Phone"), phoneRule]}
            normalize={(value?: string) => (value || "").replace(/\D/g, "")}
          >
            <Input maxLength={10} inputMode="numeric" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <UserBusinessFields required disabled={disabled} />

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="gstType"
            label="GST Type"
            rules={[requiredRule("GST Type")]}
            initialValue="CGST_SGST"
          >
            <Select
              disabled={disabled}
              options={[
                { value: "CGST_SGST", label: "CGST & SGST" },
                { value: "IGST", label: "IGST" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      {showStatus ? (
        <Form.Item name="isActive" label="Status" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" disabled={disabled} />
        </Form.Item>
      ) : null}
    </>
  );
}
