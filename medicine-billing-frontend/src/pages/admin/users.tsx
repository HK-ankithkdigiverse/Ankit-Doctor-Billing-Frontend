import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Card, Input, Pagination, Space, Table, Typography } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useUsers, useUpdateUser, useDeleteUser } from "../../hooks/useUsers";
import EditUserModal from "../../components/editUserModal";
import { ROUTES } from "../../constants";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { User } from "../../types";
import { useMe } from "../../hooks/useMe";
import { useConfirmDialog } from "../../utils/confirmDialog";

const Users = () => {
  const { message } = App.useApp();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const debouncedSearch = useDebouncedValue(search, 500);
  const navigate = useNavigate();
  const { data: me } = useMe();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, isFetching } = useUsers(page, limit, debouncedSearch, statusFilter);
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isLoading) return <p>Loading users...</p>;
  if (!data) return <p>No access</p>;

  const { users: usersRaw, pagination } = data;
  const matchesStatus = (user: User) =>
    statusFilter === "active" ? user.isActive !== false : user.isActive === false;
  const query = debouncedSearch.trim().toLowerCase();
  const matchesSearch = (user: User) => {
    if (!query) return true;

    return Object.values(user).some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "object") {
        return JSON.stringify(value).toLowerCase().includes(query);
      }
      return String(value).toLowerCase().includes(query);
    });
  };

  // Fallback: if backend doesn't filter by isActive, filter on frontend.
  const backendAlreadyFiltered =
    usersRaw.every(matchesStatus);
  const users = backendAlreadyFiltered ? usersRaw : usersRaw.filter(matchesStatus);
  const filteredUsers = users.filter(matchesSearch);
  const totalRecords = query
      ? filteredUsers.length
      : backendAlreadyFiltered
        ? pagination?.total || 0
        : users.length;
  const pageSizeSelectOptions = [
    { label: "10 / page", value: 10 },
    { label: "30 / page", value: 30 },
    { label: "50 / page", value: 50 },
    { label: "100 / page", value: 100 },
    ...(totalRecords > 0 ? [{ label: "All / page", value: totalRecords }] : []),
  ].filter((option, index, arr) => arr.findIndex((x) => x.value === option.value) === index);
  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : "-";

  const handleToggleStatus = async (user: User) => {
    const nextIsActive = !(user.isActive ?? true);
    try {
      await updateUser({
        id: user._id,
        data: { isActive: nextIsActive },
      });
      message.success(`User ${nextIsActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: any, __: User, index: number) => (page - 1) * limit + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value: string, user: User) => (
        <span style={{ color: (user.isActive ?? true) ? undefined : "#94a3b8" }}>
          {value}
        </span>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone", render: (v: string) => v || "-" },
    {
      title: "Created Date",
      key: "createdAt",
      render: (_: any, user: User) => formatDate(user.createdAt),
    },
    {
      title: "Updated Date",
      key: "updatedAt",
      render: (_: any, user: User) => formatDate(user.updatedAt),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, user: User) => (
        <Space>
          <Button icon={<EditOutlined />} title="Edit" aria-label="Edit" onClick={() => setSelectedUser(user)} />
          <Button
            icon={(user.isActive ?? true) ? <CheckCircleOutlined /> : <StopOutlined />}
            loading={isPending}
            title={(user.isActive ?? true) ? "Deactivate" : "Activate"}
            aria-label={(user.isActive ?? true) ? "Deactivate" : "Activate"}
            style={{ color: (user.isActive ?? true) ? "#16a34a" : "#dc2626" }}
            disabled={user._id === me?._id}
            onClick={() =>
              confirmDialog({
                title: `${(user.isActive ?? true) ? "Deactivate" : "Activate"} User`,
                message: `Are you sure you want to ${(user.isActive ?? true) ? "deactivate" : "activate"} this user?`,
                confirmText: (user.isActive ?? true) ? "Deactivate" : "Activate",
                danger: user.isActive ?? true,
                onConfirm: () => handleToggleStatus(user),
              })
            }
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            title="Delete"
            aria-label="Delete"
            disabled={user._id === me?._id}
            onClick={() =>
              confirmDialog({
                title: "Delete User",
                message: "Are you sure you want to delete this user?",
                confirmText: "Delete",
                danger: true,
                onConfirm: async () => {
                  try {
                    await deleteUser(user._id);
                    message.success("User deleted");
                  } catch (err: any) {
                    message.error(err?.response?.data?.message || "Failed to delete user");
                  }
                },
              })
            }
          />
        </Space>
      ),
    },
  ];

  const handleSave = async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
  }) => {
    if (!selectedUser) return;
    try {
      await updateUser({ id: selectedUser._id, data });
      message.success("User updated");
      setSelectedUser(null);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>Users</Typography.Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_USER)}
        >
          Create User
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Space wrap align="center" style={{ justifyContent: "flex-start" }}>
            <Input
              placeholder="Search by name, email, phone, address..."
              allowClear
              prefix={<SearchOutlined />}
              suffix={searchLoading ? <LoadingOutlined spin /> : null}
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              style={{ width: 360, maxWidth: "100%" }}
            />
          </Space>
          <Space wrap align="center">
            <Button
              type={statusFilter === "active" ? "primary" : "default"}
              danger={false}
              onClick={() => {
                setPage(1);
                setStatusFilter("active");
              }}
              style={statusFilter === "active" ? { background: "#16a34a", borderColor: "#16a34a" } : undefined}
            >
              Active
            </Button>
            <Button
              type={statusFilter === "inactive" ? "primary" : "default"}
              danger={statusFilter === "inactive"}
              onClick={() => {
                setPage(1);
                setStatusFilter("inactive");
              }}
            >
              Inactive
            </Button>
          </Space>
        </div>
      </div>

      <Table
        rowKey="_id"
        loading={searchLoading}
        columns={columns}
        dataSource={filteredUsers}
        rowClassName={(record: User) => ((record.isActive ?? true) ? "" : "inactive-user-row")}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "end" }}>
        <Pagination
          current={page}
          pageSize={limit}
          total={totalRecords}
          onChange={(p: number, pageSize: number) => {
            setPage(p);
            setLimit(pageSize);
          }}
          showSizeChanger={{ options: pageSizeSelectOptions }}
        />
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSave}
          isLoading={isPending}
        />
      )}
    </Card>
  );
};

export default Users;
