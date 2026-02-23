import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Input, Pagination, Table, Tag, Typography } from "antd";
import { LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useUsers, useUpdateUser } from "../../hooks/useUsers";
import EditUserModal from "../../components/editUserModal";
import { ROUTES } from "../../constants";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { User } from "../../types";

const Users = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500);
  const limit = 10;
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useUsers(page, limit, debouncedSearch);
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  if (isLoading) return <p>Loading users...</p>;
  if (!data) return <p>No access</p>;

  const { users, pagination } = data;

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone", render: (v: string) => v || "-" },
    {
      title: "Role",
      key: "role",
      render: (_: any, user: User) => (
        <Tag color={user.role === "ADMIN" ? "geekblue" : "default"}>{user.role}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, user: User) => (
        <Button onClick={() => setSelectedUser(user)}>Edit</Button>
      ),
    },
  ];

  const handleSave = async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: string;
  }) => {
    if (!selectedUser) return;
    await updateUser({ id: selectedUser._id, data });
    setSelectedUser(null);
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
        <Input
          placeholder="Search by name or email"
          allowClear
          prefix={<SearchOutlined />}
          suffix={searchLoading ? <LoadingOutlined spin /> : null}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          style={{ maxWidth: 360 }}
        />
      </div>

      <Table
        rowKey="_id"
        loading={searchLoading}
        columns={columns}
        dataSource={users}
        pagination={false}
        scroll={{ x: 700 }}
      />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "end" }}>
        <Pagination
          current={page}
          pageSize={limit}
          total={pagination?.total || 0}
          onChange={(p: number) => setPage(p)}
          showSizeChanger={false}
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
