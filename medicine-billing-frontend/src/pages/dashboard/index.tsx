import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, DatePicker, Grid, Row, Select, Space, Statistic, Table, Typography } from "antd";
import { EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
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
import type { BillSortType, DateFilterType } from "../../types/bill";
import {
  type BillingDateRange,
  BILL_SORT_OPTIONS,
  DATE_FILTER_OPTIONS,
  filterBills,
  getBillCompanyName,
  getBillCreatorLabel,
  mapUsersToSelectOptions,
  sortBillsByCreatedAt,
} from "../../utils/billing";

export default function Dashboard() {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customRange, setCustomRange] = useState<BillingDateRange>(null);
  const [sortOrder, setSortOrder] = useState<BillSortType>("newest");
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
  const userFilterOptions = mapUsersToSelectOptions(usersFilterQuery.data?.users);

  const recentBills = useMemo(() => {
    const filtered = filterBills(recentBillsRaw, {
      isAdmin,
      createdBy: createdByFilter,
      dateFilter,
      customRange,
    });
    return sortBillsByCreatedAt(filtered, sortOrder).slice(0, 5);
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
      sorter: (a: any, b: any) => sortText(getBillCompanyName(a), getBillCompanyName(b)),
      render: (_: any, record: any) => getBillCompanyName(record),
    },
    ...(isAdmin
      ? [
          {
            title: "Created By",
            key: "createdBy",
            sorter: (a: any, b: any) => sortText(getBillCreatorLabel(a), getBillCreatorLabel(b)),
            render: (_: any, record: any) => getBillCreatorLabel(record),
          },
        ]
      : []),
    {
      title: "Date (Created Date, Updated Date)",
      key: "createdUpdatedAt",
      sorter: (a: any, b: any) =>
        sortDateTime(a?.updatedAt || a?.createdAt, b?.updatedAt || b?.createdAt),
      render: (_: any, record: any) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(record.createdAt)}
          <br />
          {formatDateTime(record.updatedAt)}
        </span>
      ),
    },
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
              options={DATE_FILTER_OPTIONS}
            />
            {dateFilter === "custom" && (
              <RangePicker
                value={customRange}
                onChange={(values) => setCustomRange(values as BillingDateRange)}
              />
            )}
            <Select
              value={sortOrder}
              onChange={(value: BillSortType) => setSortOrder(value)}
              style={{ width: 140 }}
              options={BILL_SORT_OPTIONS}
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
}
