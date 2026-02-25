import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  App,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { ROLE, ROUTES } from "../../constants";
import { useCompanies, useDeleteCompany } from "../../hooks/useCompanies";
import { useUsers } from "../../hooks/useUsers";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { Company } from "../../types/company";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { getCompanyDisplayName } from "../../utils/company";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";

const CompaniesList = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    createdBy: "",
  });
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const hasAdminUserFilter = isAdmin && !!filters.createdBy;
  const queryPage = hasAdminUserFilter ? 1 : filters.page;
  const queryLimit = hasAdminUserFilter ? 1000 : filters.limit;

  const { data, isLoading, isFetching } = useCompanies(queryPage, queryLimit, debouncedSearch);
  const { data: usersFilterData } = useUsers(1, 1000, "", "all");
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteCompany, isPending } = useDeleteCompany();
  const confirmDialog = useConfirmDialog();
  const companiesRaw: Company[] = data?.companies ?? [];
  const getOwnerId = (company: Company) =>
    typeof company.userId === "object" ? company.userId?._id : company.userId;
  const filteredCompanies = isAdmin
    ? companiesRaw.filter((company) => !filters.createdBy || getOwnerId(company) === filters.createdBy)
    : companiesRaw;
  const companies = hasAdminUserFilter
    ? filteredCompanies.slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
    : filteredCompanies;
  const pagination = data?.pagination;
  const totalRecords = hasAdminUserFilter ? filteredCompanies.length : pagination?.total || 0;
  const pageSizeSelectOptions = [
    { label: "10 / page", value: 10 },
    { label: "30 / page", value: 30 },
    { label: "50 / page", value: 50 },
    { label: "100 / page", value: 100 },
    ...(totalRecords > 0 ? [{ label: "All / page", value: totalRecords }] : []),
  ].filter((option, index, arr) => arr.findIndex((x) => x.value === option.value) === index);
  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : "-";
  const oneLineCell = (value?: string) => (
    <span style={{ whiteSpace: "nowrap" }} title={value || "-"}>
      {value || "-"}
    </span>
  );
  const userOptions =
    usersFilterData?.users?.map((user) => ({
      value: user._id,
      label: user.name || user.email,
    })) ?? [];

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
        (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: "Company",
      key: "companyName",
      render: (_: unknown, company: Company) => oneLineCell(getCompanyDisplayName(company)),
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
            render: (_: unknown, company: Company) => {
              const owner = company.userId;
              if (!owner || typeof owner === "string") return "-";
              return oneLineCell(owner.name || owner.email || "-");
            },
          },
        ]
      : []),
    {
      title: "Created Date",
      key: "createdAt",
      render: (_: unknown, company: Company) => oneLineCell(formatDate((company as any).createdAt)),
    },
    ...(isAdmin
      ? [
          {
            title: "Updated Date",
            key: "updatedAt",
            render: (_: unknown, company: Company) => oneLineCell(formatDate((company as any).updatedAt)),
          },
        ]
      : []),
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
                message: "This action cannot be undone. Are you sure you want to delete this company?",
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
            className="!border-0 !bg-hero-gradient"
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
              value={filters.search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFilters((prev) => ({ ...prev, page: 1, search: e.target.value }));
              }}
              style={{ width: 360, maxWidth: "100%", borderRadius: 10 }}
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
          </Space>
        </div>

        <Table
          rowKey="_id"
          loading={isLoading || searchLoading}
          columns={columns}
          dataSource={companies}
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
      </SectionCard>
    </PageShell>
  );
};

export default CompaniesList;
