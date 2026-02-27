import { Button, Form, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface SignatureUploadFieldProps {
  signatureUrl?: string;
  disabled?: boolean;
  onSelectFile: (file: File) => void;
  onClearFile: () => void;
  onRemoveExisting?: () => void;
}

export default function SignatureUploadField({
  signatureUrl,
  disabled = false,
  onSelectFile,
  onClearFile,
  onRemoveExisting,
}: SignatureUploadFieldProps) {
  return (
    <Form.Item label="Signature (Optional)">
      {signatureUrl ? (
        <div style={{ marginBottom: 8 }}>
          <img
            src={signatureUrl}
            alt="Signature"
            style={{
              maxHeight: 72,
              maxWidth: 220,
              objectFit: "contain",
              border: "1px solid #e5e7eb",
              padding: 6,
              borderRadius: 6,
              background: "#fff",
            }}
          />
        </div>
      ) : null}

      <Upload
        maxCount={1}
        accept=".jpg,.jpeg,.png,.pdf"
        beforeUpload={(file) => {
          onSelectFile(file);
          return false;
        }}
        onRemove={() => {
          onClearFile();
          return true;
        }}
        disabled={disabled}
      >
        <Button icon={<UploadOutlined />} disabled={disabled}>
          {signatureUrl ? "Replace Signature" : "Select Signature File"}
        </Button>
      </Upload>

      {signatureUrl && onRemoveExisting ? (
        <Button
          danger
          size="small"
          style={{ marginTop: 8 }}
          disabled={disabled}
          onClick={onRemoveExisting}
        >
          Remove Signature
        </Button>
      ) : null}
    </Form.Item>
  );
}
