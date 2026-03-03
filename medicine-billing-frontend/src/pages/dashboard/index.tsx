import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, DatePicker, Grid, Row, Select, Space, Statistic, Table, Typography } from "antd";
import {
  AppstoreOutlined,
  BankOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { ROLE } from "../../constants";
import { ROUTES } from "../../constants";
import { useMe } from "../../hooks/useMe";
import { useBills } from "../../hooks/useBills";
import { useCategories } from "../../hooks/useCategories";
import { useCompanies } from "../../hooks/useCompanies";
import { useMedicalStores } from "../../hooks/useMedicalStores";
import { useProducts } from "../../hooks/useProducts";
import { useUsers } from "../../hooks/useUsers";
import { useThemeMode } from "../../contexts/themeMode";
import { formatDateTime } from "../../common/helpers/dateTime";
import { createDateSorter, createNameSorter } from "../../common/helpers/tableSort";
import type { BillSortType, DateFilterType } from "../../types/bill";
import {
  type BillingDateRange,
  BILL_SORT_OPTIONS,
  DATE_FILTER_OPTIONS,
  filterBills,
  getBillDateValue,
  getBillCompanyName,
  getBillMedicalStoreId,
  getBillMedicalStoreName,
  sortBillsByCreatedAt,
} from "../../utils/billing";

const toId = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in (value as Record<string, unknown>)) {
    return String((value as { _id?: unknown })._id || "");
  }
  return "";
};

const toDashboardLimit = (total?: number) => {
  const parsed = Number(total);
  return Number.isFinite(parsed) && parsed > 0 ? Math.ceil(parsed) : 1;
};

export default function Dashboard() {
  const { RangePicker } = DatePicker;
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [dateFilter, setDateFilter] = useState<DateFilterType>("all");
  const [customRange, setCustomRange] = useState<BillingDateRange>(null);
  const [sortOrder, setSortOrder] = useState<BillSortType>("newest");
  const [medicalStoreFilter, setMedicalStoreFilter] = useState<string>("");
  const [companiesLimit, setCompaniesLimit] = useState(1);
  const [productsLimit, setProductsLimit] = useState(1);
  const [categoriesLimit, setCategoriesLimit] = useState(1);
  const [billsLimit, setBillsLimit] = useState(1);
  const [usersLimit, setUsersLimit] = useState(1);
  const { data: user, isLoading } = useMe();
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const isAdmin = user?.role === ROLE.ADMIN;
  const meMedicalStoreId =
    toId(user?.medicalStoreId) || (typeof user?.medicineId === "string" ? user.medicineId : "");
  const effectiveMedicalStoreId = isAdmin ? medicalStoreFilter : meMedicalStoreId;

  const companiesQuery = useCompanies(1, companiesLimit, "");
  const productsQuery = useProducts(1, productsLimit, "", {
    enabled: !isLoading && !!user,
  });
  const categoriesQuery = useCategories(1, categoriesLimit, "");
  const billsQuery = useBills(1, billsLimit, "");
  const usersQuery = useUsers(1, usersLimit, "", "all");
  const medicalStoresQuery = useMedicalStores(1, 1000, "", { enabled: isAdmin });

  useEffect(() => {
    const nextLimit = toDashboardLimit(companiesQuery.data?.pagination?.total);
    if (nextLimit !== companiesLimit) setCompaniesLimit(nextLimit);
  }, [companiesLimit, companiesQuery.data?.pagination?.total]);

  useEffect(() => {
    const nextLimit = toDashboardLimit(productsQuery.data?.pagination?.total);
    if (nextLimit !== productsLimit) setProductsLimit(nextLimit);
  }, [productsLimit, productsQuery.data?.pagination?.total]);

  useEffect(() => {
    const nextLimit = toDashboardLimit(categoriesQuery.data?.pagination?.total);
    if (nextLimit !== categoriesLimit) setCategoriesLimit(nextLimit);
  }, [categoriesLimit, categoriesQuery.data?.pagination?.total]);

  useEffect(() => {
    const nextLimit = toDashboardLimit(billsQuery.data?.pagination?.total);
    if (nextLimit !== billsLimit) setBillsLimit(nextLimit);
  }, [billsLimit, billsQuery.data?.pagination?.total]);

  useEffect(() => {
    const nextLimit = toDashboardLimit(usersQuery.data?.pagination?.total);
    if (nextLimit !== usersLimit) setUsersLimit(nextLimit);
  }, [usersLimit, usersQuery.data?.pagination?.total]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const getUserMedicalStoreId = (targetUser: any) => {
    const directStoreId = toId(targetUser?.medicalStoreId);
    if (directStoreId) return directStoreId;
    return typeof targetUser?.medicineId === "string" ? targetUser.medicineId : "";
  };

  const usersRaw = usersQuery.data?.users ?? [];
  const userMedicalStoreIdByUserId = new Map<string, string>(
    usersRaw
      .map((targetUser: any) => [toId(targetUser?._id), getUserMedicalStoreId(targetUser)] as const)
      .filter(([userId, storeId]: [string, string]) => !!userId && !!storeId)
  );
  const currentUserId = toId(user?._id);
  if (currentUserId && meMedicalStoreId && !userMedicalStoreIdByUserId.has(currentUserId)) {
    userMedicalStoreIdByUserId.set(currentUserId, meMedicalStoreId);
  }

  const medicalStoreNameById = new Map<string, string>();
  (medicalStoresQuery.data?.medicalStores ?? []).forEach((store) => {
    const storeId = store?._id ? String(store._id) : "";
    const storeName = store?.name ? String(store.name).trim() : "";
    if (storeId && storeName) {
      medicalStoreNameById.set(storeId, storeName);
    }
  });

  usersRaw.forEach((targetUser: any) => {
    const storeId = getUserMedicalStoreId(targetUser);
    if (!storeId || medicalStoreNameById.has(storeId)) return;
    const fallbackStoreName =
      (typeof targetUser?.medicalStoreId === "object" ? targetUser?.medicalStoreId?.name : "") ||
      targetUser?.medicalStore?.name ||
      targetUser?.medicalName ||
      "";
    if (fallbackStoreName) {
      medicalStoreNameById.set(storeId, String(fallbackStoreName).trim());
    }
  });

  const medicalStoreOptions = [...medicalStoreNameById.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a: { label: string; value: string }, b: { label: string; value: string }) =>
      a.label.localeCompare(b.label)
    );

  const hasEffectiveMedicalStoreFilter = !!effectiveMedicalStoreId;
  const currentUserMedicalStoreName =
    (meMedicalStoreId ? medicalStoreNameById.get(meMedicalStoreId) : "") ||
    (typeof user?.medicalStoreId === "object" ? user.medicalStoreId?.name : "") ||
    user?.medicalStore?.name ||
    user?.medicalName ||
    meMedicalStoreId ||
    "N/A";
  const resolveStoreIdByUserId = (userId: string) => {
    if (!userId) return "";
    const mappedStoreId = userMedicalStoreIdByUserId.get(userId);
    if (mappedStoreId) return mappedStoreId;
    if (userId === currentUserId) return meMedicalStoreId || "";
    return "";
  };

  const getCompanyMedicalStoreId = (company: any) => {
    const directStoreId = toId(company?.medicalStoreId);
    if (directStoreId) return directStoreId;
    if (typeof company?.userId === "object") {
      const ownerStoreId = toId((company.userId as any)?.medicalStoreId);
      if (ownerStoreId) return ownerStoreId;
    }
    const ownerId = toId(company?.userId);
    if (ownerId) return resolveStoreIdByUserId(ownerId);
    return "";
  };

  const getProductMedicalStoreId = (product: any) => {
    const directStoreId = toId(product?.medicalStoreId);
    if (directStoreId) return directStoreId;
    const legacyStoreId = toId(product?.medicineId);
    if (legacyStoreId) return legacyStoreId;
    const nestedStoreId = toId(product?.medicalStore);
    if (nestedStoreId) return nestedStoreId;
    const creatorStoreId = toId(product?.createdBy?.medicalStoreId);
    if (creatorStoreId) return creatorStoreId;
    const creatorLegacyStoreId = toId(product?.createdBy?.medicineId);
    if (creatorLegacyStoreId) return creatorLegacyStoreId;
    const creatorId = toId(product?.createdBy) || toId(product?.userId);
    if (creatorId) return resolveStoreIdByUserId(creatorId);
    const companyStoreId = toId(product?.companyId?.medicalStoreId);
    if (companyStoreId) return companyStoreId;
    const companyOwnerId = toId(product?.companyId?.userId);
    if (companyOwnerId) return resolveStoreIdByUserId(companyOwnerId);
    const companyRefId = toId(product?.companyId);
    if (companyRefId) {
      const mappedStoreId = companyMedicalStoreIdByCompanyId.get(companyRefId);
      if (mappedStoreId) return mappedStoreId;
    }
    return "";
  };

  const getCategoryMedicalStoreId = (category: any) => {
    const directStoreId = toId(category?.medicalStoreId);
    if (directStoreId) return directStoreId;
    const creatorStoreId = toId(category?.createdBy?.medicalStoreId);
    if (creatorStoreId) return creatorStoreId;
    const creatorId = toId(category?.createdBy);
    if (!creatorId) return "";
    return resolveStoreIdByUserId(creatorId);
  };

  const companiesRaw = companiesQuery.data?.companies ?? [];
  const productsRaw = productsQuery.data?.products ?? [];
  const categoriesRaw = categoriesQuery.data?.categories ?? [];
  const billsRaw = billsQuery.data?.data ?? [];
  const companyMedicalStoreIdByCompanyId = new Map<string, string>(
    companiesRaw
      .map((company: any) => [toId(company?._id), getCompanyMedicalStoreId(company)] as const)
      .filter(([companyId, storeId]) => !!companyId && !!storeId)
  );
  const getBillResolvedMedicalStoreId = (bill: any) => {
    const directStoreId = getBillMedicalStoreId(bill);
    if (directStoreId) return directStoreId;
    const creatorId = toId(bill?.userId) || toId(bill?.createdBy);
    if (!creatorId) return "";
    return resolveStoreIdByUserId(creatorId);
  };

  const filteredCompanies = hasEffectiveMedicalStoreFilter
    ? companiesRaw.filter((company: any) => getCompanyMedicalStoreId(company) === effectiveMedicalStoreId)
    : companiesRaw;
  const filteredProducts = hasEffectiveMedicalStoreFilter
    ? productsRaw.filter((product: any) => getProductMedicalStoreId(product) === effectiveMedicalStoreId)
    : productsRaw;
  const filteredCategories = hasEffectiveMedicalStoreFilter
    ? categoriesRaw.filter((category: any) => getCategoryMedicalStoreId(category) === effectiveMedicalStoreId)
    : categoriesRaw;
  const filteredUsers = hasEffectiveMedicalStoreFilter
    ? usersRaw.filter((targetUser: any) => getUserMedicalStoreId(targetUser) === effectiveMedicalStoreId)
    : usersRaw;
  const filteredBillsForStore = hasEffectiveMedicalStoreFilter
    ? billsRaw.filter((bill: any) => getBillResolvedMedicalStoreId(bill) === effectiveMedicalStoreId)
    : billsRaw;

  const totalCompanies = hasEffectiveMedicalStoreFilter
    ? filteredCompanies.length
    : companiesQuery.data?.pagination?.total ?? 0;
  const totalProducts = hasEffectiveMedicalStoreFilter
    ? filteredProducts.length
    : productsQuery.data?.pagination?.total ?? 0;
  const totalCategories = hasEffectiveMedicalStoreFilter
    ? filteredCategories.length
    : categoriesQuery.data?.pagination?.total ?? 0;
  const totalBills = hasEffectiveMedicalStoreFilter
    ? filteredBillsForStore.length
    : billsQuery.data?.pagination?.total ?? 0;
  const totalUsers = isAdmin
    ? hasEffectiveMedicalStoreFilter
      ? filteredUsers.length
      : usersQuery.data?.pagination?.total ?? 0
    : 0;
  const totalMedicalStores = isAdmin
    ? medicalStoreFilter
      ? 1
      : medicalStoresQuery.data?.pagination?.total ?? 0
    : 0;
  const totalBillAmount = filteredBillsForStore.reduce(
    (sum: number, bill: any) => sum + Number(bill?.grandTotal || 0),
    0
  );

  const recentBills = sortBillsByCreatedAt(
    filterBills(filteredBillsForStore, {
      isAdmin,
      dateFilter,
      customRange,
    }),
    sortOrder
  ).slice(0, 5);

  const getBillMedicalStoreLabel = (bill: any) => {
    const directName = getBillMedicalStoreName(bill);
    if (directName !== "-") return directName;
    const storeId = getBillResolvedMedicalStoreId(bill);
    if (!storeId) return "-";
    return medicalStoreNameById.get(storeId) || storeId;
  };

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
    },
    {
      title: "Company",
      key: "company",
      sorter: createNameSorter((row: any) => getBillCompanyName(row)),
      render: (_: any, record: any) => getBillCompanyName(record),
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store",
            key: "medicalStore",
            sorter: createNameSorter((row: any) => getBillMedicalStoreLabel(row)),
            render: (_: any, record: any) => getBillMedicalStoreLabel(record),
          },
        ]
      : []),
    {
      title: "Date (Created Date, Updated Date)",
      key: "createdUpdatedAt",
      sorter: createDateSorter((row: any) => getBillDateValue(row, "updated")),
      render: (_: any, record: any) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(getBillDateValue(record, "created"))}
          <br />
          {formatDateTime(getBillDateValue(record, "updated"))}
        </span>
      ),
    },
    {
      title: "Total",
      key: "total",
      align: "right" as const,
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
        { title: "Total Medical Stores", value: totalMedicalStores },
        { title: "Total Medicines", value: totalProducts },
        { title: "Total Companies", value: totalCompanies },
        { title: "Total Categories", value: totalCategories },
        { title: "Total Users", value: totalUsers },
        { title: "Total Bills", value: totalBills },
        { title: "Total Bill Amount", value: totalBillAmount, isCurrency: true },
      ]
    : [
        { title: "My Companies", value: totalCompanies },
        { title: "My Categories", value: totalCategories },
        { title: "My Bills", value: totalBills },
        { title: "My Bill Amount", value: totalBillAmount, isCurrency: true },
      ];

  const getCardIcon = (title: string) => {
    const iconStyle = { fontSize: 24, color: isDark ? "#9CC6E6" : "#88B5D8" };

    if (title.includes("Medical Store")) return <ShopOutlined style={iconStyle} />;
    if (title.includes("Medicines") || title.includes("Product")) return <MedicineBoxOutlined style={iconStyle} />;
    if (title.includes("Companies")) return <BankOutlined style={iconStyle} />;
    if (title.includes("Categories")) return <AppstoreOutlined style={iconStyle} />;
    if (title.includes("Users")) return <TeamOutlined style={iconStyle} />;
    if (title.includes("Bill Amount")) return <DollarCircleOutlined style={iconStyle} />;
    return <FileTextOutlined style={iconStyle} />;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Dashboard
          </Typography.Title>
            <Typography.Text type="secondary">
              {isAdmin
                ? `Scope: ${medicalStoreFilter ? (medicalStoreNameById.get(medicalStoreFilter) || medicalStoreFilter) : "All Medical Stores"}`
                : `Medical Store: ${currentUserMedicalStoreName}`}
            </Typography.Text>
          </div>
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
      </div>

      <Row gutter={[16, 16]}>
        {cards.map((card, idx) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              styles={{ body: { padding: isMobile ? 14 : 18 } }}
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
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: isDark ? "rgba(156, 198, 230, 0.12)" : "rgba(136, 181, 216, 0.16)",
                  }}
                >
                  {getCardIcon(card.title)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Statistic
                    title={card.title}
                    value={card.value}
                    prefix={card.isCurrency ? "Rs " : undefined}
                    precision={card.isCurrency ? 2 : 0}
                    valueStyle={{
                      color: isDark ? "#E2E8F0" : "#102A43",
                      lineHeight: 1.1,
                      fontWeight: 500,
                    }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{ marginTop: 16 }}
        title="Recent Bills"
        extra={
          <Space wrap>
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
          loading={billsQuery.isLoading}
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
