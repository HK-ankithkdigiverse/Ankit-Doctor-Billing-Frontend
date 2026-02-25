import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Typography,
  App,
} from "antd";
import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { ROLE, ROUTES } from "../../constants";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { useUsers } from "../../hooks/useUsers";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { Category } from "../../types/category";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";

const CategoriesList = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    createdBy: "",
  });
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const hasAdminUserFilter = isAdmin && !!filters.createdBy;
  const queryPage = hasAdminUserFilter ? 1 : filters.page;
  const queryLimit = hasAdminUserFilter ? 1000 : filters.limit;

  const { data, isLoading, isFetching, error } = useCategories(
    queryPage,
    queryLimit,
    debouncedSearch
  );
  const { data: usersFilterData } = useUsers(1, 1000, "", "all");
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();
  const confirmDialog = useConfirmDialog();

  const categoriesRaw = data?.categories ?? [];
  const getCreatedById = (category: Category) =>
    typeof category.createdBy === "object" ? category.createdBy?._id : category.createdBy;
  const filteredCategories = isAdmin
    ? categoriesRaw.filter((category) => !filters.createdBy || getCreatedById(category) === filters.createdBy)
    : categoriesRaw;
  const categories = hasAdminUserFilter
    ? filteredCategories.slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
    : filteredCategories;
  const pagination = data?.pagination;
  const totalRecords = hasAdminUserFilter ? filteredCategories.length : pagination?.total || 0;
  const pageSizeSelectOptions = [
    { label: "10 / page", value: 10 },
    { label: "30 / page", value: 30 },
    { label: "50 / page", value: 50 },
    { label: "100 / page", value: 100 },
    ...(totalRecords > 0 ? [{ label: "All / page", value: totalRecords }] : []),
  ].filter((option, index, arr) => arr.findIndex((x) => x.value === option.value) === index);
  const userOptions =
    usersFilterData?.users?.map((user) => ({
      value: user._id,
      label: user.name || user.email,
    })) ?? [];
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success("Category deleted");
    } catch {
      message.error("Failed to delete category");
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: unknown, __: Category, index: number) =>
        (filters.page - 1) * filters.limit + index + 1,
    },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string) => value || "-",
    },
    ...(me?.role === "ADMIN"
      ? [
          {
            title: "Created By",
            key: "createdBy",
            render: (_: unknown, category: Category) => {
              const createdBy = category.createdBy;
              if (!createdBy || typeof createdBy === "string") return "-";
              return createdBy.name || createdBy.email || "-";
            },
          },
        ]
      : []),
    {
      title: "Created Date & Time",
      key: "createdAt",
      render: (_: unknown, category: Category) => formatDateTime(category.createdAt),
    },
    ...(me?.role === "ADMIN"
      ? [
          {
            title: "Updated Date & Time",
            key: "updatedAt",
            render: (_: unknown, category: Category) => formatDateTime(category.updatedAt),
          },
        ]
      : []),
    {
      title: "Action",
      key: "action",
      render: (_: unknown, category: Category) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            title="Edit"
            aria-label="Edit"
            onClick={() => navigate(ROUTES.CATEGORY_EDIT.replace(":id", category._id))}
          />
          <Button
            danger
            loading={isPending}
            icon={<DeleteOutlined />}
            title="Delete"
            aria-label="Delete"
            onClick={() =>
              confirmDialog({
                title: "Confirm Deletion",
                message: "This action cannot be undone. Are you sure you want to delete this category?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => handleDelete(category._id),
              })
            }
          />
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <Typography.Text type="danger">Failed to load categories.</Typography.Text>
      </Card>
    );
  }

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>Categories</Typography.Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_CATEGORY)}
        >
          Add Category
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search category..."
            allowClear
            prefix={<SearchOutlined />}
            suffix={searchLoading ? <LoadingOutlined spin /> : null}
            value={filters.search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFilters((prev) => ({ ...prev, page: 1, search: e.target.value }));
            }}
            style={{ width: 360, maxWidth: "100%" }}
          />
          {isAdmin && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Filter by user"
              value={filters.createdBy || undefined}
              options={userOptions}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, page: 1, createdBy: value || "" }))
              }
              style={{ width: 220 }}
            />
          )}
        </Space>
      </div>

      <Table
        rowKey="_id"
        loading={isLoading || searchLoading}
        columns={columns}
        dataSource={categories}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "end" }}>
        <Pagination
          current={filters.page}
          pageSize={filters.limit}
          total={totalRecords}
          onChange={(p: number, pageSize: number) =>
            setFilters((prev) => ({ ...prev, page: p, limit: pageSize }))
          }
          showSizeChanger={{ options: pageSizeSelectOptions }}
        />
      </div>
    </Card>
  );
};

export default CategoriesList;
