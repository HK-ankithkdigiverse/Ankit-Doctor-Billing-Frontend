import type { ChangeEvent } from "react";
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
import { ROUTES } from "../../constants";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useViewState } from "../../hooks/useViewState";
import type { User } from "../../types";
import { useMe } from "../../hooks/useMe";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { getUserMedicalStoreId } from "../../utils/medicalStore";
import { buildPageSizeSelectOptions, getSerialNumber } from "../../utils/pagination";
import {
  applyTableSort,
  createDateSorter,
  createNameSorter,
  getColumnSortOrder,
  resolveTableSort,
} from "../../utils/tableSort";

export default function Users() {
  const { message } = App.useApp();
  const {
    view: { page, limit, search, userStatus, sortField, sortOrder },
    setPagination,
    setSearch,
    setUserStatus,
    setSort,
  } = useViewState("users");
  const debouncedSearch = useDebouncedValue(search, 500);
  const navigate = useNavigate();
  const { data: me } = useMe();
  const confirmDialog = useConfirmDialog();

  const { data, isLoading, isFetching } = useUsers(page, limit, debouncedSearch, userStatus);
  const searchLoading = search !== debouncedSearch || isFetching;
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();
  const sortState = { field: sortField, order: sortOrder };

  const usersRaw = data?.users ?? [];
  const pagination = data?.pagination;
  const getMedicalStoreId = (user: User) => getUserMedicalStoreId(user);
  const getMedicalStoreName = (user: User) => {
    const populatedStoreName =
      typeof user.medicalStoreId === "object"
        ? (user.medicalStoreId?.name || "").trim()
        : "";
    if (populatedStoreName) return populatedStoreName;

    const fallbackName = (user.medicalName || "").trim();
    if (fallbackName) return fallbackName;

    const storeId = getMedicalStoreId(user);
    if (!storeId) return "-";
    return storeId;
  };
  const matchesStatus = (user: User) =>
    userStatus === "active" ? user.isActive !== false : user.isActive === false;
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

  const backendAlreadyFiltered = usersRaw.every(matchesStatus);
  const users = backendAlreadyFiltered ? usersRaw : usersRaw.filter(matchesStatus);
  const filteredUsers = users.filter(matchesSearch);
  const sortedUsers = applyTableSort(filteredUsers, sortState, {
    name: createNameSorter((row: User) => row.name),
    medicalStore: createNameSorter((row: User) => getMedicalStoreName(row)),
    createdUpdatedAt: createDateSorter((row: User) => row.updatedAt || row.createdAt),
  });
  const totalRecords = query
      ? filteredUsers.length
      : backendAlreadyFiltered
        ? pagination?.total || 0
        : users.length;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);

  if (isLoading) return <p>Loading users...</p>;
  if (!data) return <p>No access</p>;
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
      render: (_: any, __: User, index: number) => getSerialNumber(page, limit, index),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "name"),
      render: (value: string, user: User) => (
        <span style={{ color: (user.isActive ?? true) ? undefined : "#94a3b8" }}>
          {value}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Medical Store",
      key: "medicalStore",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "medicalStore"),
      render: (_: any, user: User) => getMedicalStoreName(user),
    },
    {
      title: "Created At",
      key: "createdUpdatedAt",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "createdUpdatedAt"),
      render: (_: any, user: User) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(user.createdAt)}
          <br />
          {formatDateTime(user.updatedAt)}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, user: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            title="Edit"
            aria-label="Edit"
            onClick={() =>
              navigate(ROUTES.USER_EDIT.replace(":id", user._id), { state: { user } })
            }
          />
          <Button
            icon={(user.isActive ?? true) ? <StopOutlined /> : <CheckCircleOutlined />}
            loading={isPending}
            title={(user.isActive ?? true) ? "Deactivate" : "Activate"}
            aria-label={(user.isActive ?? true) ? "Deactivate" : "Activate"}
            style={{ color: (user.isActive ?? true) ? "#dc2626" : "#16a34a" }}
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

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>Users</Typography.Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_USER)}
        >
          Add User
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
              placeholder="Search by name, email, medical store..."
              allowClear
              prefix={<SearchOutlined />}
              suffix={searchLoading ? <LoadingOutlined spin /> : null}
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
              }}
              style={{ width: 360, maxWidth: "100%" }}
            />
          </Space>
          <Space wrap align="center">
            <Button
              type={userStatus === "active" ? "primary" : "default"}
              danger={false}
              onClick={() => {
                setUserStatus("active");
              }}
              style={userStatus === "active" ? { background: "#16a34a", borderColor: "#16a34a" } : undefined}
            >
              Active
            </Button>
            <Button
              type={userStatus === "inactive" ? "primary" : "default"}
              danger={userStatus === "inactive"}
              onClick={() => {
                setUserStatus("inactive");
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
        dataSource={sortedUsers}
        sortDirections={["ascend", "descend"]}
        rowClassName={(record: User) => ((record.isActive ?? true) ? "" : "inactive-user-row")}
        pagination={false}
        scroll={{ x: "max-content" }}
        onChange={(_pagination, _filters, sorter) => {
          const nextSort = resolveTableSort(sorter);
          setSort(nextSort.field, nextSort.order);
        }}
      />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "end" }}>
        <Pagination
          current={page}
          pageSize={limit}
          total={totalRecords}
          onChange={(nextPage: number, pageSize: number) => {
            setPagination(nextPage, pageSize);
          }}
          showSizeChanger={{ options: pageSizeSelectOptions }}
        />
      </div>
    </Card>
  );
}
