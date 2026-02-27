import { Col, Form, Input, Row } from "antd";
import { gstRule, requiredRule } from "../../utils/formRules";
import { nonWhitespaceRule, panRule, pincodeRule } from "../../utils/userForm";

interface UserBusinessFieldsProps {
  required?: boolean;
  disabled?: boolean;
}

export default function UserBusinessFields({ required = false, disabled = false }: UserBusinessFieldsProps) {
  const addressRules = required
    ? [
        requiredRule("Address"),
        nonWhitespaceRule("Address"),
        { min: 3, message: "Address must be at least 3 characters" },
        { max: 500, message: "Address must be 500 characters or less" },
      ]
    : [{ max: 500, message: "Address must be 500 characters or less" }];

  const cityRules = required
    ? [
        requiredRule("City"),
        nonWhitespaceRule("City"),
        { min: 2, message: "City must be at least 2 characters" },
        { max: 80, message: "City must be 80 characters or less" },
      ]
    : [{ max: 80, message: "City must be 80 characters or less" }];

  const stateRules = required
    ? [
        requiredRule("State"),
        nonWhitespaceRule("State"),
        { min: 2, message: "State must be at least 2 characters" },
        { max: 80, message: "State must be 80 characters or less" },
      ]
    : [{ max: 80, message: "State must be 80 characters or less" }];

  return (
    <>
      <Form.Item name="address" label="Address" rules={addressRules}>
        <Input.TextArea rows={3} maxLength={500} disabled={disabled} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="city" label="City" rules={cityRules}>
            <Input maxLength={80} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="state" label="State" rules={stateRules}>
            <Input maxLength={80} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="pincode"
            label="Pincode"
            rules={required ? [requiredRule("Pincode"), pincodeRule] : [pincodeRule]}
            normalize={(value?: string) => (value || "").replace(/\D/g, "")}
          >
            <Input maxLength={6} inputMode="numeric" disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="gstNumber"
            label="GST Number"
            rules={required ? [requiredRule("GST Number"), gstRule] : [gstRule]}
            normalize={(value?: string) => value?.toUpperCase()}
          >
            <Input style={{ textTransform: "uppercase" }} maxLength={15} disabled={disabled} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="panCardNumber"
            label="PAN Card Number"
            rules={required ? [requiredRule("PAN Card Number"), panRule] : [panRule]}
            normalize={(value?: string) => value?.toUpperCase()}
          >
            <Input style={{ textTransform: "uppercase" }} maxLength={10} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
