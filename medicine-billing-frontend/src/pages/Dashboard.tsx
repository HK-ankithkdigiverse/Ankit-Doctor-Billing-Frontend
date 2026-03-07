import { useMemo } from "react";
import {
  AppstoreOutlined,
  BankOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Card, Col, DatePicker, Grid, Row, Select, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import StatCard from "../components/StatCard";
import { useDashboardData } from "../hooks/useDashboardData";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { formatDateTime } from "../utils/dateTime";
import {
  getBillCompanyName,
  getBillMedicalStoreId,
  getBillMedicalStoreName,
  type BillingDateRange,
} from "../utils/billing";
import type { DateFilterType } from "../types/bill";
import "./dashboard/dashboard.css";

type DashboardBillRow = Record<string, any>;

const formatCurrency = (value: number) => `Rs ${value.toFixed(2)}`;

const getCardIcon = (title: string) => {
  const iconStyle = { fontSize: 20, color: "#88B5D8" };

  if (title.includes("Medical Store")) return <ShopOutlined style={iconStyle} />;
  if (title.includes("Medicines") || title.includes("Product")) {
    return <MedicineBoxOutlined style={iconStyle} />;
  }
  if (title.includes("Companies")) return <BankOutlined style={iconStyle} />;
  if (title.includes("Categories")) return <AppstoreOutlined style={iconStyle} />;
  if (title.includes("Users")) return <TeamOutlined style={iconStyle} />;
  if (title.includes("Bill Amount")) return <DollarCircleOutlined style={iconStyle} />;
  return <FileTextOutlined style={iconStyle} />;
};

export default function DashboardPage() {
  const { RangePicker } = DatePicker;
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const {
    user,
    isLoading,
    isAdmin,
    medicalStoreFilter,
    setMedicalStoreFilter,
    dateFilter,
    customRange,
    setDateFilter,
    setCustomRange,
    dateFilterOptions,
    effectiveMedicalStoreId,
    currentUserMedicalStoreName,
    medicalStoreOptions,
    filteredCompanies,
    filteredProducts,
    filteredCategories,
    filteredUsers,
    filteredBillsForStore,
    sortedBillsForStore,
    scopedMedicalStores,
    companiesData,
    productsData,
    categoriesData,
    usersData,
    billsData,
    medicalStoresData,
    isDashboardFetching,
  } = useDashboardData();

  const { cards } = useDashboardStats({
    isAdmin,
    isScoped: !!effectiveMedicalStoreId,
    filteredCompanies,
    filteredProducts,
    filteredCategories,
    filteredUsers,
    filteredBillsForStore,
    scopedMedicalStores,
    companiesTotal: companiesData?.pagination?.total,
    productsTotal: productsData?.pagination?.total,
    categoriesTotal: categoriesData?.pagination?.total,
    usersTotal: usersData?.pagination?.total,
    billsTotal: billsData?.pagination?.total,
    medicalStoresTotal: medicalStoresData?.pagination?.total,
  });

  const selectedStoreLabel = useMemo(() => {
    if (!isAdmin) return currentUserMedicalStoreName;
    if (!medicalStoreFilter) return "All Medical Stores";
    return (
      medicalStoreOptions.find((option: { value: string; label: string }) => option.value === medicalStoreFilter)
        ?.label || medicalStoreFilter
    );
  }, [currentUserMedicalStoreName, isAdmin, medicalStoreFilter, medicalStoreOptions]);

  const medicalStoreLabelById = useMemo(
    () => new Map(medicalStoreOptions.map((option: { value: string; label: string }) => [option.value, option.label])),
    [medicalStoreOptions]
  );

  const billColumns: ColumnsType<DashboardBillRow> = useMemo(() => {
    const columns: ColumnsType<DashboardBillRow> = [
      {
        title: "Bill No",
        dataIndex: "billNo",
        key: "billNo",
        render: (value: string) => value || "-",
      },
      {
        title: "Company",
        key: "company",
        render: (_value, bill) => getBillCompanyName(bill),
      },
      {
        title: "Total Amount",
        key: "total",
        align: "right",
        render: (_value, bill) =>
          formatCurrency(Number(bill?.totals?.finalPayableAmount ?? bill?.grandTotal ?? 0)),
      },
      {
        title: "Created At",
        key: "createdAt",
        render: (_value, bill) => formatDateTime(bill?.createdAt),
      },
    ];

    if (isAdmin) {
      columns.splice(2, 0, {
        title: "Medical Store",
        key: "medicalStore",
        render: (_value, bill) => {
          const embeddedName = getBillMedicalStoreName(bill);
          if (embeddedName !== "-") return embeddedName;
          const storeId = getBillMedicalStoreId(bill);
          if (!storeId) return "-";
          return medicalStoreLabelById.get(storeId) || storeId;
        },
      });
    }

    return columns;
  }, [isAdmin, medicalStoreLabelById]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-toolbar">
        <div className="dashboard-title-block">
          <Typography.Title level={3} style={{ margin: 0 }}>
            Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">Scope: {selectedStoreLabel}</Typography.Text>
        </div>
        <div className="dashboard-controls">
          {isAdmin ? (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Filter by medical store"
              value={medicalStoreFilter || undefined}
              options={medicalStoreOptions}
              onChange={(value) => setMedicalStoreFilter(value || "")}
              className="dashboard-control"
            />
          ) : null}
          <Select
            value={dateFilter}
            onChange={(value: DateFilterType) => setDateFilter(value)}
            className="dashboard-control date-filter-select"
            classNames={{ popup: { root: "date-filter-dropdown" } }}
            options={dateFilterOptions}
          />
          {dateFilter === "custom" ? (
            <RangePicker
              value={customRange}
              onChange={(values) => setCustomRange(values as BillingDateRange)}
              className="dashboard-control dashboard-range-picker"
              allowClear
            />
          ) : null}
        </div>
      </div>

      <div className="dashboard-cards-wrap">
        <Row gutter={[12, 12]}>
          {cards.map((card, idx) => (
            <Col xs={24} sm={12} lg={6} key={card.title} className="dashboard-stat-col">
              <StatCard
                title={card.title}
                value={card.value}
                isCurrency={card.isCurrency}
                icon={getCardIcon(card.title)}
                isMobile={isMobile}
                index={idx}
              />
            </Col>
          ))}
        </Row>
      </div>

      <Card title="Bills By Selected Filters" className="dashboard-bills-card">
        <Table
          rowKey={(record) => record?._id || `${record?.billNo || "bill"}-${record?.createdAt || ""}`}
          dataSource={sortedBillsForStore}
          columns={billColumns}
          loading={isDashboardFetching}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "No bills found for selected filters" }}
        />
      </Card>
    </div>
  );
}
