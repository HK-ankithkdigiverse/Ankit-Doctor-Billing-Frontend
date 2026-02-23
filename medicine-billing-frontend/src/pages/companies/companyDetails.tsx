import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Col, Descriptions, Row, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCompanies } from "../../hooks/useCompanies";

const CompanyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useCompanies(1, 100, "");

  if (isLoading) return <p>Loading...</p>;
  const company = data?.companies.find((c) => c._id === id);
  if (!company) return <p>Company not found</p>;

  const logoUrl = company.logo
    ? `${import.meta.env.VITE_API_URL || "https://ankit-doctor-billing-backend.vercel.app/api"}/uploads/${company.logo}`
    : "";

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>Company Details</Typography.Title>}
      extra={
        <Button
          icon={<EditOutlined />}
          onClick={() => navigate(`${ROUTES.COMPANIES}/${company._id}/edit`)}
        >
          Edit
        </Button>
      }
    >
      <Row gutter={16} align="middle">
        <Col xs={24} md={6}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Company Logo"
              style={{ width: 120, height: 120, objectFit: "contain", borderRadius: 8 }}
            />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: 8, background: "#f1f5f9" }} />
          )}
        </Col>
        <Col xs={24} md={18}>
          <Descriptions column={2} size="middle">
            <Descriptions.Item label="Company">{company.companyName}</Descriptions.Item>
            <Descriptions.Item label="GST">{company.gstNumber}</Descriptions.Item>
            <Descriptions.Item label="Email">{company.email || "-"}</Descriptions.Item>
            <Descriptions.Item label="Phone">{company.phone || "-"}</Descriptions.Item>
            <Descriptions.Item label="State">{company.state || "-"}</Descriptions.Item>
            <Descriptions.Item label="Address">{company.address || "-"}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default CompanyDetails;
