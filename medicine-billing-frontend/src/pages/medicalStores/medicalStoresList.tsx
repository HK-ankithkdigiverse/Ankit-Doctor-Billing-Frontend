import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { App, Button, Input, Pagination, Select, Space, Table } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { MedicalStore } from "../../types";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";
import { ROUTES } from "../../constants";
import {
  useDeleteMedicalStore,
  useMedicalStores,
  useUpdateMedicalStore,
} from "../../hooks/useMedicalStores";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { buildPageSizeSelectOptions } from "../../utils/pagination";
import { createDateSorter, createNameSorter } from "../../utils/tableSort";
import { getSerialNumber, paginateByPage } from "../../utils/tablePagination";
import { getErrorMessage } from "../../utils/userForm";

type StoreStatusFilter = "all" | "active" | "inactive";

const STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
] as const;

export default function MedicalStoresList() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const confirmDialog = useConfirmDialog();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "all" as StoreStatusFilter,
  });
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const hasStatusFilter = filters.status !== "all";
  const queryPage = hasStatusFilter ? 1 : filters.page;
  const queryLimit = hasStatusFilter ? 1000 : filters.limit;

  const { data, isLoading, isFetching } = useMedicalStores(
    queryPage,
    queryLimit,
    debouncedSearch
  );
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: updateMedicalStore, isPending: isUpdatePending } =
    useUpdateMedicalStore();
  const { mutateAsync: deleteMedicalStore, isPending: isDeletePending } =
    useDeleteMedicalStore();

  const storesRaw = data?.medicalStores ?? [];
  const storesFilteredByStatus = storesRaw.filter((store) => {
    if (filters.status === "active") return store.isActive !== false;
    if (filters.status === "inactive") return store.isActive === false;
    return true;
  });
  const stores = hasStatusFilter
    ? paginateByPage(storesFilteredByStatus, filters.page, filters.limit)
    : storesFilteredByStatus;
  const totalRecords = hasStatusFilter
    ? storesFilteredByStatus.length
    : data?.pagination?.total || 0;
  const pageSizeSelectOptions = buildPageSizeSelectOptions(totalRecords);

  const handleToggleStatus = async (store: MedicalStore) => {
    const nextIsActive = store.isActive === false;

    try {
      await updateMedicalStore({
        id: store._id,
        payload: { isActive: nextIsActive },
      });
      message.success(`Medical Store ${nextIsActive ? "activated" : "deactivated"}`);
    } catch (error: any) {
      message.error(getErrorMessage(error) || "Failed to update Medical Store status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicalStore(id);
      message.success("Medical Store deleted");
    } catch (error: any) {
      message.error(getErrorMessage(error) || "Failed to delete Medical Store");
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: unknown, __: MedicalStore, index: number) =>
        getSerialNumber(filters.page, filters.limit, index),
    },
    {
      title: "Medical Store Name",
      dataIndex: "name",
      key: "name",
      sorter: createNameSorter((row: MedicalStore) => row.name),
      render: (value: string) => value || "-",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (value: string) => value || "-",
    },
    {
      title: "Location",
      key: "location",
      render: (_: unknown, store: MedicalStore) => {
        const locationParts = [store.city, store.state, store.pincode].filter(Boolean);
        return locationParts.length ? locationParts.join(", ") : "-";
      },
    },
    {
      title: "GST",
      dataIndex: "gstNumber",
      key: "gstNumber",
      render: (value: string) => value || "-",
    },
    {
      title: "Date (Created, Updated)",
      key: "createdUpdatedAt",
      sorter: createDateSorter((row: MedicalStore) => row.updatedAt || row.createdAt),
      render: (_: unknown, store: MedicalStore) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(store.createdAt)}
          <br />
          {formatDateTime(store.updatedAt)}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, store: MedicalStore) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            title="Edit"
            aria-label="Edit"
            onClick={() =>
              navigate(ROUTES.MEDICAL_STORE_EDIT.replace(":id", store._id))
            }
          />
          <Button
            icon={store.isActive === false ? <CheckCircleOutlined /> : <StopOutlined />}
            loading={isUpdatePending}
            title={store.isActive === false ? "Activate" : "Deactivate"}
            aria-label={store.isActive === false ? "Activate" : "Deactivate"}
            style={{ color: store.isActive === false ? "#16a34a" : "#dc2626" }}
            onClick={() =>
              confirmDialog({
                title: `${store.isActive === false ? "Activate" : "Deactivate"} Medical Store`,
                message: `Are you sure you want to ${
                  store.isActive === false ? "activate" : "deactivate"
                } this Medical Store?`,
                confirmText: store.isActive === false ? "Activate" : "Deactivate",
                danger: store.isActive !== false,
                onConfirm: () => handleToggleStatus(store),
              })
            }
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={isDeletePending}
            title="Delete"
            aria-label="Delete"
            onClick={() =>
              confirmDialog({
                title: "Delete Medical Store",
                message:
                  "This action cannot be undone. Are you sure you want to delete this Medical Store?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => handleDelete(store._id),
              })
            }
          />
        </Space>
      ),
    },
  ];

  return (
    <PageShell>
      <SectionCard
        title={<SectionTitle>Medical Stores</SectionTitle>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(ROUTES.CREATE_MEDICAL_STORE)}
          >
            Add Medical Store
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search medical store..."
              allowClear
              prefix={<SearchOutlined />}
              suffix={searchLoading ? <LoadingOutlined spin /> : null}
              value={filters.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFilters((prev) => ({ ...prev, page: 1, search: e.target.value }))
              }
              style={{ width: 360, maxWidth: "100%" }}
            />
            <Select
              value={filters.status}
              options={[...STATUS_FILTER_OPTIONS]}
              onChange={(status: StoreStatusFilter) =>
                setFilters((prev) => ({ ...prev, page: 1, status }))
              }
              style={{ width: 180 }}
            />
          </Space>
        </div>

        <Table
          rowKey="_id"
          loading={isLoading || searchLoading}
          columns={columns}
          dataSource={stores}
          sortDirections={["ascend", "descend"]}
          pagination={false}
          scroll={{ x: "max-content" }}
        />

        <div style={{ marginTop: 16, display: "flex", justifyContent: "end" }}>
          <Pagination
            current={filters.page}
            pageSize={filters.limit}
            total={totalRecords}
            onChange={(page, pageSize) =>
              setFilters((prev) => ({ ...prev, page, limit: pageSize }))
            }
            showSizeChanger={{ options: pageSizeSelectOptions }}
          />
        </div>
      </SectionCard>
    </PageShell>
  );
}
