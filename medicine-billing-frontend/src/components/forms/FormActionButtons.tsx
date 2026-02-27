import { Button, Form } from "antd";

interface FormActionButtonsProps {
  submitText: string;
  loading?: boolean;
  disabled?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  submitType?: "primary" | "default";
}

export default function FormActionButtons({
  submitText,
  loading = false,
  disabled = false,
  cancelText = "Cancel",
  onCancel,
  submitType = "primary",
}: FormActionButtonsProps) {
  return (
    <Form.Item style={{ marginBottom: 0 }}>
      {onCancel ? (
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          {cancelText}
        </Button>
      ) : null}
      <Button type={submitType} htmlType="submit" loading={loading} disabled={disabled}>
        {submitText}
      </Button>
    </Form.Item>
  );
}
