import type { ChangeEvent } from "react";
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
import { useMedicalStoresListData } from "../../hooks/useMedicalStoresListData";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { getSerialNumber } from "../../utils/pagination";
import { getColumnSortOrder, resolveTableSort } from "../../utils/tableSort";
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
  const {
    page,
    limit,
    search,
    storeStatus,
    sortState,
    stores,
    totalRecords,
    pageSizeSelectOptions,
    searchLoading,
    isLoading,
    isUpdatePending,
    isDeletePending,
    setPagination,
    setSearch,
    setStoreStatus,
    setSort,
    updateMedicalStore,
    deleteMedicalStore,
  } = useMedicalStoresListData();

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
        getSerialNumber(page, limit, index),
    },
    {
      title: "Medical Store Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "name"),
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
      title: "Created At",
      key: "createdUpdatedAt",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "createdUpdatedAt"),
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
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              style={{ width: 360, maxWidth: "100%" }}
            />
            <Select
              value={storeStatus}
              options={[...STATUS_FILTER_OPTIONS]}
              onChange={(status: StoreStatusFilter) => setStoreStatus(status)}
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
            onChange={(nextPage, pageSize) =>
              setPagination(nextPage, pageSize)
            }
            showSizeChanger={{ options: pageSizeSelectOptions }}
          />
        </div>
      </SectionCard>
    </PageShell>
  );
}
