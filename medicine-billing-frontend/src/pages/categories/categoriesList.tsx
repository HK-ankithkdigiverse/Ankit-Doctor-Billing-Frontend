import { useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Pagination,
  Space,
  Table,
  Typography,
  App,
} from "antd";
import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { useMe } from "../../hooks/useMe";
import { useMedicalStores } from "../../hooks/useMedicalStores";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { Category } from "../../types/category";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { buildMedicalStoreNameById } from "../../utils/medicalStore";
import { buildPageSizeSelectOptions } from "../../utils/pagination";
import { createDateSorter, createNameSorter } from "../../utils/tableSort";
import { getSerialNumber } from "../../utils/tablePagination";

export default function CategoriesList() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  });
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const { data: me } = useMe();
  const isAdmin = String(me?.role || "").toUpperCase() === "ADMIN";

  const { data, isLoading, isFetching, error } = useCategories(
    filters.page,
    filters.limit,
    debouncedSearch
  );
  const { data: medicalStoresData } = useMedicalStores(1, 1000, "", {
    enabled: isAdmin,
  });
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();
  const confirmDialog = useConfirmDialog();

  const categories = data?.categories ?? [];
  const pagination = data?.pagination;
  const totalRecords = pagination?.total || 0;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);

  const medicalStoreNameById = useMemo(
    () => buildMedicalStoreNameById(medicalStoresData?.medicalStores),
    [medicalStoresData?.medicalStores]
  );

  const getMedicalStoreId = (category: Category) =>
    typeof category.medicalStoreId === "string"
      ? category.medicalStoreId
      : category.medicalStoreId?._id || "";

  const getMedicalStoreName = (category: Category) => {
    const populatedStoreName =
      typeof category.medicalStoreId === "object"
        ? (category.medicalStoreId?.name || "").trim()
        : "";
    if (populatedStoreName) return populatedStoreName;
    const storeId = getMedicalStoreId(category);
    if (!storeId) return "-";
    return medicalStoreNameById.get(storeId) || "-";
  };

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
        getSerialNumber(filters.page, filters.limit, index),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: createNameSorter((row: Category) => row.name),
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store",
            key: "medicalStore",
            sorter: createNameSorter((row: Category) => getMedicalStoreName(row)),
            render: (_: unknown, category: Category) => getMedicalStoreName(category),
          },
        ]
      : []),
    {
      title: "Date (Created Date, Updated Date)",
      key: "createdUpdatedAt",
      sorter: createDateSorter((row: Category) => row.updatedAt || row.createdAt),
      render: (_: unknown, category: Category) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(category.createdAt)}
          <br />
          {formatDateTime(category.updatedAt)}
        </span>
      ),
    },
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
        </Space>
      </div>

      <Table
        rowKey="_id"
        loading={isLoading || searchLoading}
        columns={columns}
        dataSource={categories}
        sortDirections={["ascend", "descend"]}
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
}
