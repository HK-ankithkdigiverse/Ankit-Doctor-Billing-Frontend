import { Button, Col, Grid, Row, Select, Typography } from "antd";
import {
  AppstoreOutlined,
  BankOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import StatCard from "../components/StatCard";
import { useDashboardData } from "../hooks/useDashboardData";
import { useDashboardStats } from "../hooks/useDashboardStats";

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
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const {
    user,
    isLoading,
    isAdmin,
    medicalStoreFilter,
    setMedicalStoreFilter,
    effectiveMedicalStoreId,
    currentUserMedicalStoreName,
    medicalStoreOptions,
    filteredCompanies,
    filteredProducts,
    filteredCategories,
    filteredUsers,
    filteredBillsForStore,
    scopedMedicalStores,
    companiesData,
    productsData,
    categoriesData,
    usersData,
    billsData,
    medicalStoresData,
    isDashboardFetching,
    refreshDashboardData,
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

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">
            {isAdmin
              ? `Scope: ${
                  medicalStoreFilter
                    ? medicalStoreOptions.find((s: { value: string; label: string }) => s.value === medicalStoreFilter)?.label ||
                      medicalStoreFilter
                    : "All Medical Stores"
                }`
              : `Medical Store: ${currentUserMedicalStoreName}`}
          </Typography.Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {isAdmin && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Filter by medical store"
              value={medicalStoreFilter || undefined}
              options={medicalStoreOptions}
              onChange={(value) => setMedicalStoreFilter(value || "")}
              style={{ width: 260 }}
            />
          )}
          <Button
            icon={<ReloadOutlined />}
            loading={isDashboardFetching}
            onClick={refreshDashboardData}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: 1220 }}>
        <Row gutter={[12, 12]}>
          {cards.map((card, idx) => (
            <Col
              xs={24}
              sm={12}
              lg={6}
              key={card.title}
              style={{ display: "flex", justifyContent: "center" }}
            >
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
    </div>
  );
}
