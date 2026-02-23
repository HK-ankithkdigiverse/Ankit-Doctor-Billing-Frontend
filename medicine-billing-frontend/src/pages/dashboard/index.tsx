import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Grid, Row, Space, Statistic, Table, Typography } from "antd";
import { EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import { ROLE } from "../../constants";
import { ROUTES } from "../../constants";
import { useMe } from "../../hooks/useMe";
import { useBills } from "../../hooks/useBills";
import { useCategories } from "../../hooks/useCategories";
import { useCompanies } from "../../hooks/useCompanies";
import { useProducts } from "../../hooks/useProducts";
import { useUsers } from "../../hooks/useUsers";

const Dashboard = () => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const { data: user, isLoading } = useMe();
  const isAdmin = user?.role === ROLE.ADMIN;

  const companiesQuery = useCompanies(1, 1, "");
  const productsQuery = useProducts(1, 1, "");
  const categoriesQuery = useCategories(1, 1, "");
  const billsQuery = useBills(1, 5, "");
  const usersQuery = useUsers(1, 1, "");

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const totalCompanies = companiesQuery.data?.pagination?.total ?? 0;
  const totalProducts = productsQuery.data?.pagination?.total ?? 0;
  const totalCategories = categoriesQuery.data?.pagination?.total ?? 0;
  const totalBills = billsQuery.data?.pagination?.total ?? 0;
  const totalUsers = usersQuery.data?.pagination?.total ?? 0;
  const recentBills = billsQuery.data?.data ?? [];

  const billColumns = [
    { title: "Bill No", dataIndex: "billNo", key: "billNo" },
    {
      title: "Company",
      key: "company",
      render: (_: any, record: any) => record.companyId?.companyName || "-",
    },
    ...(isAdmin
      ? [
          {
            title: "Created By",
            key: "createdBy",
            render: (_: any, record: any) => record.userId?.name || "-",
          },
        ]
      : []),
    {
      title: "Date",
      key: "date",
      render: (_: any, record: any) =>
        record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "-",
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
            onClick={() => navigate(ROUTES.BILL_DETAILS(record._id))}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => navigate(`${ROUTES.BILL_DETAILS(record._id)}?download=1`)}
          >
            Download
          </Button>
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
                  idx % 2 === 0
                    ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
                    : "linear-gradient(135deg, #f8fffc 0%, #edf7f4 100%)",
              }}
            >
              <Statistic title={card.title} value={card.value} valueStyle={{ color: "#102A43" }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card style={{ marginTop: 16 }} title="Recent Bills">
        <Table
          rowKey="_id"
          columns={billColumns}
          dataSource={recentBills}
          size={isMobile ? "small" : "middle"}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
