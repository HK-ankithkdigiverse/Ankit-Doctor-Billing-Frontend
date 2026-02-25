import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, DatePicker, Grid, Row, Select, Space, Statistic, Table, Typography } from "antd";
import { EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { ROLE } from "../../constants";
import { ROUTES } from "../../constants";
import { useMe } from "../../hooks/useMe";
import { useBills } from "../../hooks/useBills";
import { useCategories } from "../../hooks/useCategories";
import { useCompanies } from "../../hooks/useCompanies";
import { useProducts } from "../../hooks/useProducts";
import { useUsers } from "../../hooks/useUsers";
import { useThemeMode } from "../../contexts/themeMode";
import { formatDateTime } from "../../utils/dateTime";
import { sortDateTime, sortNumber, sortText } from "../../utils/tableSort";

type DateFilterType = "all" | "today" | "week" | "month" | "custom";
type SortType = "newest" | "oldest";

const getCurrentWeekRange = () => {
  const today = dayjs();
  const mondayStart = today.startOf("day").subtract((today.day() + 6) % 7, "day");
  const sundayEnd = mondayStart.add(6, "day").endOf("day");
  return { start: mondayStart, end: sundayEnd };
};

const Dashboard = () => {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [sortOrder, setSortOrder] = useState<SortType>("newest");
  const [createdByFilter, setCreatedByFilter] = useState<string>("");
  const { data: user, isLoading } = useMe();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const isAdmin = user?.role === ROLE.ADMIN;

  const companiesQuery = useCompanies(1, 1, "");
  const productsQuery = useProducts(1, 1, "");
  const categoriesQuery = useCategories(1, 1, "");
  const billsQuery = useBills(1, 1000, "");
  const usersQuery = useUsers(1, 1, "");
  const usersFilterQuery = useUsers(1, 1000, "", "all");

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const totalCompanies = companiesQuery.data?.pagination?.total ?? 0;
  const totalProducts = productsQuery.data?.pagination?.total ?? 0;
  const totalCategories = categoriesQuery.data?.pagination?.total ?? 0;
  const totalBills = billsQuery.data?.pagination?.total ?? 0;
  const totalUsers = usersQuery.data?.pagination?.total ?? 0;
  const recentBillsRaw = billsQuery.data?.data ?? [];
  const userFilterOptions =
    usersFilterQuery.data?.users?.map((u) => ({ value: u._id, label: u.name || u.email })) ?? [];

  const recentBills = useMemo(() => {
    const isInDateFilter = (bill: any) => {
      if (dateFilter === "all") return true;
      const createdAt = bill?.createdAt ? dayjs(bill.createdAt) : null;
      if (!createdAt || !createdAt.isValid()) return false;
      if (dateFilter === "today") return createdAt.isSame(dayjs(), "day");
      if (dateFilter === "week") {
        const { start, end } = getCurrentWeekRange();
        return !createdAt.isBefore(start) && !createdAt.isAfter(end);
      }
      if (dateFilter === "month") return !createdAt.isBefore(dayjs().startOf("month")) && !createdAt.isAfter(dayjs().endOf("month"));
      if (dateFilter === "custom") {
        const start = customRange?.[0];
        const end = customRange?.[1];
        if (!start || !end) return true;
        return !createdAt.isBefore(start.startOf("day")) && !createdAt.isAfter(end.endOf("day"));
      }
      return true;
    };

    const getCreatedById = (bill: any) => bill?.userId?._id || bill?.createdBy?._id || "";

    const filtered = recentBillsRaw.filter((bill: any) => {
      const userOk = !isAdmin || !createdByFilter || getCreatedById(bill) === createdByFilter;
      const dateOk = isInDateFilter(bill);
      return userOk && dateOk;
    });

    const sorted = [...filtered].sort((a: any, b: any) => {
      const ta = dayjs(a?.createdAt).isValid() ? dayjs(a.createdAt).valueOf() : 0;
      const tb = dayjs(b?.createdAt).isValid() ? dayjs(b.createdAt).valueOf() : 0;
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });

    return sorted.slice(0, 5);
  }, [recentBillsRaw, dateFilter, customRange, isAdmin, createdByFilter, sortOrder]);
  const billColumns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Bill No",
      dataIndex: "billNo",
      key: "billNo",
      sorter: (a: any, b: any) => sortText(a.billNo, b.billNo),
    },
    {
      title: "Company",
      key: "company",
      sorter: (a: any, b: any) => sortText(a?.companyId?.companyName || a?.companyId?.name, b?.companyId?.companyName || b?.companyId?.name),
      render: (_: any, record: any) => record.companyId?.companyName || record.companyId?.name || "-",
    },
    ...(isAdmin
      ? [
          {
            title: "Created By",
            key: "createdBy",
            sorter: (a: any, b: any) => sortText(a?.userId?.name || a?.createdBy?.name, b?.userId?.name || b?.createdBy?.name),
            render: (_: any, record: any) => record.userId?.name || "-",
          },
        ]
      : []),
    {
      title: "Created Date & Time",
      key: "createdAt",
      sorter: (a: any, b: any) => sortDateTime(a?.createdAt, b?.createdAt),
      render: (_: any, record: any) => formatDateTime(record.createdAt),
    },
    ...(isAdmin
      ? [
          {
            title: "Updated Date & Time",
            key: "updatedAt",
            sorter: (a: any, b: any) => sortDateTime(a?.updatedAt, b?.updatedAt),
            render: (_: any, record: any) => formatDateTime(record.updatedAt),
          },
        ]
      : []),
    {
      title: "Total",
      key: "total",
      align: "right" as const,
      sorter: (a: any, b: any) => sortNumber(a?.grandTotal, b?.grandTotal),
      render: (_: any, record: any) => `Rs ${Number(record.grandTotal || 0).toFixed(2)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            title="View"
            aria-label="View"
            onClick={() => navigate(ROUTES.BILL_DETAILS(record._id))}
          />
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            title="Download PDF"
            aria-label="Download PDF"
            onClick={() => navigate(`${ROUTES.BILL_DETAILS(record._id)}?download=1`)}
          />
        </Space>
      ),
    },
  ];

  const cards = isAdmin
    ? [
        { title: "Total Medicines", value: totalProducts },
        { title: "Total Companies", value: totalCompanies },
        { title: "Total Categories", value: totalCategories },
        { title: "Total Users", value: totalUsers },
      ]
    : [
        { title: "My Medicines", value: totalProducts },
        { title: "My Companies", value: totalCompanies },
        { title: "My Categories", value: totalCategories },
        { title: "My Bills", value: totalBills },
      ];

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        Dashboard
      </Typography.Title>

      <Row gutter={[16, 16]}>
        {cards.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              style={{
                background:
                  isDark
                    ? idx % 2 === 0
                      ? "linear-gradient(135deg, #111827 0%, #1f2937 100%)"
                      : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                    : idx % 2 === 0
                      ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
                      : "linear-gradient(135deg, #f8fffc 0%, #edf7f4 100%)",
              }}
            >
              <Statistic title={card.title} value={card.value} valueStyle={{ color: isDark ? "#E2E8F0" : "#102A43" }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{ marginTop: 16 }}
        title="Recent Bills"
        extra={
          <Space wrap>
            {isAdmin && (
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Filter by user"
                value={createdByFilter || undefined}
                options={userFilterOptions}
                onChange={(value) => setCreatedByFilter(value || "")}
                style={{ width: 200 }}
              />
            )}
            <Select
              value={dateFilter}
              onChange={(value: DateFilterType) => {
                setDateFilter(value);
                if (value !== "custom") setCustomRange(null);
              }}
              style={{ width: 160 }}
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
                onChange={(values) => setCustomRange(values as [Dayjs | null, Dayjs | null] | null)}
              />
            )}
            <Select
              value={sortOrder}
              onChange={(value: SortType) => setSortOrder(value)}
              style={{ width: 140 }}
              options={[
                { value: "newest", label: "Newest" },
                { value: "oldest", label: "Oldest" },
              ]}
            />
          </Space>
        }
      >
        <Table
          rowKey="_id"
          columns={billColumns}
          dataSource={recentBills}
          sortDirections={["ascend", "descend"]}
          size={isMobile ? "small" : "middle"}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
