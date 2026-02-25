import { useState, type ChangeEvent } from "react";
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
import { DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useBills, useDeleteBill } from "../../hooks/useBills";
import { ROLE, ROUTES } from "../../constants";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { useUsers } from "../../hooks/useUsers";

type DateFilterType = "all" | "today" | "week" | "month" | "custom";

const getCurrentWeekRange = () => {
  const today = dayjs();
  const mondayStart = today.startOf("day").subtract((today.day() + 6) % 7, "day");
  const sundayEnd = mondayStart.add(6, "day").endOf("day");
  return { start: mondayStart, end: sundayEnd };
};

const BillList = () => {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    createdBy: "",
  });
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const hasAdminUserFilter = isAdmin && !!filters.createdBy;
  const hasDateFilter = dateFilter !== "all";
  const hasLocalFilter = hasAdminUserFilter || hasDateFilter;
  const queryPage = hasLocalFilter ? 1 : filters.page;
  const queryLimit = hasLocalFilter ? 1000 : filters.limit;

  const { data, isLoading, isFetching } = useBills(queryPage, queryLimit, debouncedSearch);
  const { data: usersFilterData } = useUsers(1, 1000, "", "all");
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteBill } = useDeleteBill();
  const confirmDialog = useConfirmDialog();

  const rowsRaw = data?.data ?? [];
  const getCreatedById = (bill: any) => bill?.userId?._id || bill?.createdBy?._id || "";
  const isInDateFilter = (bill: any) => {
    if (dateFilter === "all") return true;
    const createdAt = bill?.createdAt ? dayjs(bill.createdAt) : null;
    if (!createdAt || !createdAt.isValid()) return false;

    if (dateFilter === "today") return createdAt.isSame(dayjs(), "day");

    if (dateFilter === "week") {
      const { start, end } = getCurrentWeekRange();
      return !createdAt.isBefore(start) && !createdAt.isAfter(end);
    }

    if (dateFilter === "month") {
      const start = dayjs().startOf("month");
      const end = dayjs().endOf("month");
      return !createdAt.isBefore(start) && !createdAt.isAfter(end);
    }

    if (dateFilter === "custom") {
      const start = customRange?.[0];
      const end = customRange?.[1];
      if (!start || !end) return true;
      return !createdAt.isBefore(start.startOf("day")) && !createdAt.isAfter(end.endOf("day"));
    }

    return true;
  };

  const filteredRows = rowsRaw.filter((bill: any) => {
    const userOk = !isAdmin || !filters.createdBy || getCreatedById(bill) === filters.createdBy;
    const dateOk = isInDateFilter(bill);
    return userOk && dateOk;
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
  const userOptions =
    usersFilterData?.users?.map((user) => ({
      value: user._id,
      label: user.name || user.email,
    })) ?? [];
  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : "-";
  const getCompanyName = (bill: any) =>
    bill?.companyId?.companyName || bill?.companyId?.name || "-";
  const getUserLabel = (bill: any) => {
    const userName = bill?.userId?.name || bill?.createdBy?.name || "";
    const userEmail = bill?.userId?.email || bill?.createdBy?.email || "";
    if (!userName) return "-";
    return userEmail ? `${userName} (${userEmail})` : userName;
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: any, __: any, index: number) => (filters.page - 1) * filters.limit + index + 1,
    },
    { title: "Bill No", dataIndex: "billNo", key: "billNo" },
    {
      title: "Company",
      key: "company",
      render: (_: any, bill: any) => getCompanyName(bill),
    },
    ...(isAdmin
      ? [
          {
            title: "Added By",
            key: "addedBy",
            render: (_: any, bill: any) => getUserLabel(bill),
          },
        ]
      : []),
    {
      title: "Total",
      key: "total",
      align: "right" as const,
      render: (_: any, bill: any) => `Rs ${Number(bill.grandTotal || 0).toFixed(2)}`,
    },
    {
      title: "Created Date",
      key: "createdAt",
      render: (_: any, bill: any) => formatDate(bill.createdAt),
    },
    ...(isAdmin
      ? [
          {
            title: "Updated Date",
            key: "updatedAt",
            render: (_: any, bill: any) => formatDate(bill.updatedAt),
          },
        ]
      : []),
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
              placeholder="Filter by user"
              value={filters.createdBy || undefined}
              options={userOptions}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, page: 1, createdBy: value || "" }))
              }
              style={{ width: 220 }}
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
            options={[
              { value: "all", label: "All Dates" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "custom", label: "Custom Range" },
            ]}
          />
          {dateFilter === "custom" && (
            <RangePicker
              value={customRange}
              onChange={(values) => {
                setFilters((prev) => ({ ...prev, page: 1 }));
                setCustomRange(values as [Dayjs | null, Dayjs | null] | null);
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

export default BillList;
