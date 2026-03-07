import type { ChangeEvent } from "react";
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
import { ROUTES } from "../../constants";
import {
  type BillingDateRange,
  type DateFilterType,
  useBillsListData,
} from "../../hooks/useBillsListData";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { getSerialNumber } from "../../utils/pagination";
import {
  getColumnSortOrder,
  resolveTableSort,
} from "../../utils/tableSort";

export default function BillList() {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const {
    page,
    limit,
    search,
    medicalStoreId,
    dateFilter,
    customRange,
    isAdmin,
    sortState,
    rows,
    totalRecords,
    pageSizeSelectOptions,
    medicalStoreOptions,
    requestMedicalStoreOptions,
    searchLoading,
    isLoading,
    setPagination,
    setSearch,
    setMedicalStoreId,
    setDateFilter,
    setCustomRange,
    setSort,
    deleteBill,
    getBillMedicalStoreLabel,
    getBillCompanyName,
    DATE_FILTER_OPTIONS,
  } = useBillsListData();
  const confirmDialog = useConfirmDialog();

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: any, __: any, index: number) => getSerialNumber(page, limit, index),
    },
    {
      title: "Bill No",
      dataIndex: "billNo",
      key: "billNo",
    },
    {
      title: "Company",
      key: "company",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "company"),
      render: (_: any, bill: any) => getBillCompanyName(bill),
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store",
            key: "medicalStore",
            sorter: true,
            sortOrder: getColumnSortOrder(sortState, "medicalStore"),
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
      title: "Created At",
      key: "createdUpdatedAt",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "createdUpdatedAt"),
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
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
            }}
            style={{ width: 360, maxWidth: "100%" }}
          />
          {isAdmin && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Filter by medical store"
              value={medicalStoreId || undefined}
              options={medicalStoreOptions}
              onOpenChange={(open) => {
                if (open) requestMedicalStoreOptions();
              }}
              onChange={(value) => setMedicalStoreId(value || "")}
              style={{ width: 240 }}
            />
          )}
          <Select
            value={dateFilter}
            onChange={(value: DateFilterType) => {
              setDateFilter(value);
            }}
            className="date-filter-select"
            classNames={{ popup: { root: "date-filter-dropdown" } }}
            style={{ width: 180 }}
            options={DATE_FILTER_OPTIONS}
          />
          {dateFilter === "custom" && (
            <RangePicker
              value={customRange}
              onChange={(values) => {
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
          onChange={(nextPage: number, pageSize: number) =>
            setPagination(nextPage, pageSize)
          }
          showSizeChanger={{ options: pageSizeSelectOptions }}
        />
      </div>
    </Card>
  );
}
