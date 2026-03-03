import { useMemo, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, FilePdfOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useBills, useDeleteBill } from "../../hooks/useBills";
import { ROLE, ROUTES } from "../../constants";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { useMedicalStores } from "../../hooks/useMedicalStores";
import { formatDateTime } from "../../common/helpers/dateTime";
import { createDateSorter, createNameSorter } from "../../common/helpers/tableSort";
import type { DateFilterType } from "../../types/bill";
import {
  type BillingDateRange,
  DATE_FILTER_OPTIONS,
  filterBills,
  getBillCompanyName,
  getBillMedicalStoreId,
  getBillMedicalStoreName,
} from "../../utils/billing";

export default function BillList() {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    medicalStoreId: "",
  });
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customRange, setCustomRange] = useState<BillingDateRange>(null);
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const hasAdminMedicalStoreFilter = isAdmin && !!filters.medicalStoreId;
  const hasDateFilter = dateFilter !== "all";
  const hasLocalFilter = hasAdminMedicalStoreFilter || hasDateFilter;
  const queryPage = hasLocalFilter ? 1 : filters.page;
  const queryLimit = hasLocalFilter ? 1000 : filters.limit;

  const { data, isLoading, isFetching } = useBills(queryPage, queryLimit, debouncedSearch);
  const { data: medicalStoresData } = useMedicalStores(1, 1000, "", {
    enabled: isAdmin,
  });
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteBill } = useDeleteBill();
  const confirmDialog = useConfirmDialog();
  const medicalStoreNameById = useMemo(() => {
    const map = new Map<string, string>();
    (medicalStoresData?.medicalStores ?? []).forEach((store) => {
      const storeId = store?._id ? String(store._id) : "";
      const storeName = store?.name ? String(store.name).trim() : "";
      if (storeId && storeName) {
        map.set(storeId, storeName);
      }
    });
    return map;
  }, [medicalStoresData?.medicalStores]);
  const getBillMedicalStoreLabel = (bill: any) => {
    const embeddedName = getBillMedicalStoreName(bill);
    if (embeddedName !== "-") return embeddedName;

    const storeId = getBillMedicalStoreId(bill);
    if (!storeId) return "-";
    return medicalStoreNameById.get(storeId) || "-";
  };

  const rowsRaw = data?.data ?? [];
  const filteredRows = filterBills(rowsRaw, {
    isAdmin,
    medicalStoreId: filters.medicalStoreId,
    dateFilter,
    customRange,
  });
  const rows = hasLocalFilter
    ? filteredRows.slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
    : filteredRows;
  const pagination = data?.pagination;
  const totalRecords = hasLocalFilter ? filteredRows.length : pagination?.total || 0;
  const pageSizeSelectOptions = [
    { label: "10 / page", value: 10 },
    { label: "30 / page", value: 30 },
    { label: "50 / page", value: 50 },
    { label: "100 / page", value: 100 },
    ...(totalRecords > 0 ? [{ label: "All / page", value: totalRecords }] : []),
  ].filter((option, index, arr) => arr.findIndex((x) => x.value === option.value) === index);
  const medicalStoreOptions =
    (medicalStoresData?.medicalStores ?? []).map((store) => ({
      value: store._id,
      label: store.name || store._id,
    })) ?? [];

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: any, __: any, index: number) => (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: "Bill No",
      dataIndex: "billNo",
      key: "billNo",
    },
    {
      title: "Company",
      key: "company",
      sorter: createNameSorter((row: any) => getBillCompanyName(row)),
      render: (_: any, bill: any) => getBillCompanyName(bill),
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store",
            key: "medicalStore",
            sorter: createNameSorter((row: any) => getBillMedicalStoreLabel(row)),
            render: (_: any, bill: any) => getBillMedicalStoreLabel(bill),
          },
        ]
      : []),
    {
      title: "Total",
      key: "total",
      align: "right" as const,
      render: (_: any, bill: any) =>
        `Rs ${Number(bill?.totals?.finalPayableAmount ?? bill?.grandTotal ?? 0).toFixed(2)}`,
    },
    {
      title: "Date (Created Date, Updated Date)",
      key: "createdUpdatedAt",
      sorter: createDateSorter((row: any) => row?.updatedAt || row?.createdAt),
      render: (_: any, bill: any) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(bill.createdAt)}
          <br />
          {formatDateTime(bill.updatedAt)}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, bill: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            title="View"
            aria-label="View"
            onClick={() => navigate(`${ROUTES.BILLING}/${bill._id}`)}
          />
          <Button
            icon={<EditOutlined />}
            title="Edit"
            aria-label="Edit"
            onClick={() => navigate(ROUTES.BILL_EDIT.replace(":id", bill._id))}
          />
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            title="Download PDF"
            aria-label="Download PDF"
            onClick={() => navigate(`${ROUTES.BILL_DETAILS(bill._id)}?download=1`)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            title="Delete"
            aria-label="Delete"
            onClick={() =>
              confirmDialog({
                title: "Confirm Deletion",
                message: "This action cannot be undone. Are you sure you want to delete this bill?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => deleteBill(bill._id),
              })
            }
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>Billing</Typography.Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_BILL)}
        >
          New Bill
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search bill number"
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
              placeholder="Filter by medical store"
              value={filters.medicalStoreId || undefined}
              options={medicalStoreOptions}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, page: 1, medicalStoreId: value || "" }))
              }
              style={{ width: 240 }}
            />
          )}
          <Select
            value={dateFilter}
            onChange={(value: DateFilterType) => {
              setFilters((prev) => ({ ...prev, page: 1 }));
              setDateFilter(value);
              if (value !== "custom") setCustomRange(null);
            }}
            style={{ width: 180 }}
            options={DATE_FILTER_OPTIONS}
          />
          {dateFilter === "custom" && (
            <RangePicker
              value={customRange}
              onChange={(values) => {
                setFilters((prev) => ({ ...prev, page: 1 }));
                setCustomRange(values as BillingDateRange);
              }}
            />
          )}
        </Space>
      </div>

      <Table
        rowKey="_id"
        loading={isLoading || searchLoading}
        columns={columns}
        dataSource={rows}
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
