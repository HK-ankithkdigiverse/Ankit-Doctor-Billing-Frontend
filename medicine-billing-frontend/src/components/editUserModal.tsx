import { Input, Modal, Space, Typography } from "antd";
import { useState } from "react";
import type { User } from "../types";

interface Props {
  user: User;
  onClose: () => void;
  onSave: (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

const EditUserModal = ({ user, onClose, onSave, isLoading }: Props) => {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
  });

  return (
    <Modal
      open
      title="Edit User"
      onCancel={onClose}
      onOk={() =>
        onSave({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        })
      }
      okText={isLoading ? "Saving..." : "Save"}
      okButtonProps={{
        loading: isLoading,
        disabled: !form.name.trim() || !form.email.trim(),
      }}
      destroyOnHidden
    >
      <Space direction="vertical" style={{ width: "100%" }} size={10}>
        <div>
          <Typography.Text type="secondary">Name <span style={{ color: "#ff4d4f" }}>*</span></Typography.Text>
          <Input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            disabled={isLoading}
          />
        </div>

        <div>
          <Typography.Text type="secondary">Email <span style={{ color: "#ff4d4f" }}>*</span></Typography.Text>
          <Input
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            disabled={isLoading}
          />
        </div>

        <div>
          <Typography.Text type="secondary">Phone</Typography.Text>
          <Input
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            disabled={isLoading}
          />
        </div>

        <div>
          <Typography.Text type="secondary">Address</Typography.Text>
          <Input
            value={form.address}
            onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            disabled={isLoading}
          />
        </div>

      </Space>
    </Modal>
  );
};

export default EditUserModal;
