import type { ChangeEvent } from "react";
import type { Company } from "../../types/company";
import { useNavigate } from "react-router-dom";
import { App, Button, Input, Pagination, Select, Space, Table } from "antd";
import {DeleteOutlined,EditOutlined,EyeOutlined,LoadingOutlined,PlusOutlined,SearchOutlined} from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCompaniesListData } from "../../hooks/useCompaniesListData";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { getCompanyDisplayName } from "../../utils/company";
import { formatDateTime } from "../../utils/dateTime";
import { getSerialNumber } from "../../utils/pagination";
import {
  getColumnSortOrder,
  resolveTableSort,
} from "../../utils/tableSort";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";

export default function CompaniesList() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const confirmDialog = useConfirmDialog();
  const {isAdmin,page,limit,search,medicalStoreId,sortState,companies,totalRecords,pageSizeSelectOptions,medicalStoreOptions,searchLoading,isLoading,isPending,setPagination,setSearch,setMedicalStoreId,setSort,getCreatedByStoreLabel,deleteCompany,} = useCompaniesListData();

  const oneLineCell = (value?: string) => (
    <span style={{ whiteSpace: "nowrap" }} title={value || "-"}>
      {value || "-"}
    </span>
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteCompany(id);
      message.success("Company deleted");
    } catch {
      message.error("Failed to delete company");
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: unknown, __: Company, index: number) =>
        getSerialNumber(page, limit, index),
    },
    {
      title: "Company",
      key: "companyName",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "companyName"),
      render: (_: unknown, company: Company) =>
        oneLineCell(getCompanyDisplayName(company)),
    },
    {
      title: "GST",
      dataIndex: "gstNumber",
      key: "gstNumber",
      render: (v: string) => oneLineCell(v),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v: string) => oneLineCell(v),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (v: string) => oneLineCell(v),
    },
    ...(isAdmin
      ? [
          {
            title: "Created By",
            key: "createdBy",
            sorter: true,
            sortOrder: getColumnSortOrder(sortState, "createdBy"),
            render: (_: unknown, company: Company) =>
              oneLineCell(getCreatedByStoreLabel(company)),
          },
        ]
      : []),
    {
      title: "Created / Updated",
      key: "createdUpdatedAt",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "createdUpdatedAt"),
      render: (_: unknown, company: Company) => {
        const created = formatDateTime((company as any).createdAt);
        const updated = formatDateTime((company as any).updatedAt);
        return (
          <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
            {`Created: ${created}`}
            <br />
            {`Updated: ${updated}`}
          </span>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, company: Company) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            title="View"
            aria-label="View"
            onClick={() => navigate(`${ROUTES.COMPANIES}/${company._id}`)}
          />
          <Button
            icon={<EditOutlined />}
            title="Edit"
            aria-label="Edit"
            onClick={() => navigate(`${ROUTES.COMPANIES}/${company._id}/edit`)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={isPending}
            title="Delete"
            aria-label="Delete"
            onClick={() =>
              confirmDialog({
                title: "Confirm Deletion",
                message:
                  "This action cannot be undone. Are you sure you want to delete this company?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => handleDelete(company._id),
              })
            }
          />
        </Space>
      ),
    },
  ];

  return (
    <PageShell>
      <SectionCard
        title={<SectionTitle>Companies</SectionTitle>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(ROUTES.CREATE_COMPANY)}
            className="border-0! bg-hero-gradient!"
          >
            Add Company
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Input
              placeholder="Search company..."
              allowClear
              prefix={<SearchOutlined />}
              suffix={searchLoading ? <LoadingOutlined spin /> : null}
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearch(e.target.value);
              }}
              style={{ width: 360, maxWidth: "100%", borderRadius: 10 }}
            />
            {isAdmin && (
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Filter by medical store"
                value={medicalStoreId || undefined}
                options={medicalStoreOptions}
                onChange={(value) => setMedicalStoreId(value || "")}
                style={{ width: 220 }}
              />
            )}
          </Space>
        </div>

        <Table
          rowKey="_id"
          loading={isLoading || searchLoading}
          columns={columns}
          dataSource={companies}
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
      </SectionCard>
    </PageShell>
  );
}