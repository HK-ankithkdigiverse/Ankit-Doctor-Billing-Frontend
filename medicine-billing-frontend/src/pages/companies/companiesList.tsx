import { useMemo, useState, type ChangeEvent } from "react";
import type { MedicalStore, User } from "../../types";
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
import { useMedicalStores } from "../../hooks/useMedicalStores";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { Company } from "../../types/company";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { getCompanyDisplayName } from "../../utils/company";
import { formatDateTime } from "../../common/helpers/dateTime";
import { createDateSorter, createNameSorter } from "../../common/helpers/tableSort";
import PageShell from "../../components/ui/PageShell";
import SectionCard from "../../components/ui/SectionCard";
import SectionTitle from "../../components/ui/SectionTitle";

export default function CompaniesList() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    medicalStoreId: "",
  });
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const { data: me } = useMe();
  const isAdmin = me?.role === ROLE.ADMIN;
  const hasAdminStoreFilter = isAdmin && !!filters.medicalStoreId;
  const queryPage = hasAdminStoreFilter ? 1 : filters.page;
  const queryLimit = hasAdminStoreFilter ? 1000 : filters.limit;

  const { data, isLoading, isFetching } = useCompanies(queryPage, queryLimit, debouncedSearch);
  const { data: usersFilterData } = useUsers(1, 1000, "", "all");
  const { data: medicalStoresData } = useMedicalStores(1, 1000, "", { enabled: isAdmin });
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteCompany, isPending } = useDeleteCompany();
  const confirmDialog = useConfirmDialog();
  const companiesRaw: Company[] = data?.companies ?? [];
  const getUserMedicalStoreId = (user: User) => {
    const storeId = user.medicalStoreId;
    if (!storeId) return "";
    return typeof storeId === "string" ? storeId : storeId?._id || "";
  };
  const getOwnerId = (company: Company) =>
    typeof company.userId === "object" ? company.userId?._id : company.userId;
  const userStoreIdById = new Map<string, string>(
    (usersFilterData?.users ?? [])
      .map((user: User) => [user._id, getUserMedicalStoreId(user)] as const)
      .filter(([, storeId]: readonly [string, string]) => !!storeId)
  );
  const getCompanyMedicalStoreId = (company: Company) => {
    const companyStore = company.medicalStoreId;
    if (typeof companyStore === "string") return companyStore;
    if (companyStore && typeof companyStore === "object") return companyStore._id || "";
    const ownerId = getOwnerId(company);
    if (!ownerId) return "";
    return userStoreIdById.get(ownerId) || "";
  };
  const medicalStoreNameById = new Map<string, string>(
    (medicalStoresData?.medicalStores ?? [])
      .map((store: MedicalStore) => [store._id, store.name?.trim() || store._id] as const)
      .filter(([storeId]) => !!storeId)
  );
  const filteredCompanies = isAdmin
    ? companiesRaw.filter(
        (company) =>
          !filters.medicalStoreId || getCompanyMedicalStoreId(company) === filters.medicalStoreId
      )
    : companiesRaw;
  const companies = hasAdminStoreFilter
    ? filteredCompanies.slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
    : filteredCompanies;
  const pagination = data?.pagination;
  const totalRecords = hasAdminStoreFilter ? filteredCompanies.length : pagination?.total || 0;
  const pageSizeSelectOptions = [
    { label: "10 / page", value: 10 },
    { label: "30 / page", value: 30 },
    { label: "50 / page", value: 50 },
    { label: "100 / page", value: 100 },
    ...(totalRecords > 0 ? [{ label: "All / page", value: totalRecords }] : []),
  ].filter((option, index, arr) => arr.findIndex((x) => x.value === option.value) === index);
  const oneLineCell = (value?: string) => (
    <span style={{ whiteSpace: "nowrap" }} title={value || "-"}>
      {value || "-"}
    </span>
  );
  const medicalStoreOptions = useMemo<{ label: string; value: string }[]>(
    () => {
      const optionMap = new Map<string, string>();

      (medicalStoresData?.medicalStores ?? []).forEach((store: MedicalStore) => {
        if (!store?._id || store.isActive === false) return;
        optionMap.set(store._id, store.name?.trim() || store._id);
      });

      // Keep filterable ids visible even if a store record is not in the current response.
      companiesRaw.forEach((company: Company) => {
        const storeId = getCompanyMedicalStoreId(company);
        if (!storeId || optionMap.has(storeId)) return;
        optionMap.set(storeId, storeId);
      });

      return [...optionMap.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a: { label: string; value: string }, b: { label: string; value: string }) =>
          a.label.localeCompare(b.label)
        );
    },
    [companiesRaw, medicalStoresData?.medicalStores]
  );
  const getCreatedByStoreLabel = (company: Company) => {
    const storeId = getCompanyMedicalStoreId(company);
    if (!storeId) return "-";
    return medicalStoreNameById.get(storeId) || storeId;
  };

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
      sorter: createNameSorter((row: Company) => getCompanyDisplayName(row)),
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
            sorter: createNameSorter((row: Company) => getCreatedByStoreLabel(row)),
            render: (_: unknown, company: Company) => oneLineCell(getCreatedByStoreLabel(company)),
          },
        ]
      : []),
    {
      title: "Created / Updated",
      key: "createdUpdatedAt",
      sorter: createDateSorter((row: Company) => (row as any).updatedAt || (row as any).createdAt),
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
                placeholder="Filter by medical store"
                value={filters.medicalStoreId || undefined}
                options={medicalStoreOptions}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, page: 1, medicalStoreId: value || "" }))
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
          sortDirections={["ascend", "descend"]}
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
}
