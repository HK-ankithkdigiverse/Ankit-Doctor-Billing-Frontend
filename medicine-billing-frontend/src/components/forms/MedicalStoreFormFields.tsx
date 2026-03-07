import { Col, Form, Input, InputNumber, Row, Select } from "antd";
import { nonWhitespaceRule } from "../../utils/userForm";
import { phoneRule, requiredRule } from "../../utils/formRules";
import UserBusinessFields from "./UserBusinessFields";

type MedicalStoreFormFieldsProps = {
  disabled?: boolean;
};

export default function MedicalStoreFormFields({
  disabled = false,
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

      <Row gutter={16} className="medical-store-gst-row">
        <Col xs={24} md={12}>
          <Form.Item
            name="gstType"
            label="GST Type"
            rules={[requiredRule("GST Type")]}
            className="medical-store-gst-type"
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
        <Col xs={24} md={12}>
          <Form.Item
            name="gstPercent"
            label="GST Percentage (%)"
            rules={[requiredRule("GST Percentage")]}
            className="medical-store-gst-percent"
          >
            <InputNumber
              className="medical-store-gst-input app-percent-input"
              min={0}
              max={100}
              step={1}
              precision={0}
              addonAfter="%"
              style={{ width: "100%" }}
              disabled={disabled}
            />
          </Form.Item>
        </Col>
      </Row>

    </>
  );
}
