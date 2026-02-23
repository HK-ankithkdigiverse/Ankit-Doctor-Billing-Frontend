import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Pagination,
  Space,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useBills, useDeleteBill } from "../../hooks/useBills";
import { ROLE, ROUTES } from "../../constants";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConfirmDialog } from "../../utils/confirmDialog";

const BillList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, search: "" });
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const limit = 10;

  const { data, isLoading, isFetching } = useBills(filters.page, limit, debouncedSearch);
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteBill } = useDeleteBill();
  const { data: me } = useMe();
  const confirmDialog = useConfirmDialog();
  const isAdmin = me?.role === ROLE.ADMIN;

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const getCompanyName = (bill: any) =>
    bill?.companyId?.companyName || bill?.companyId?.name || "-";
  const getUserLabel = (bill: any) => {
    const userName = bill?.userId?.name || bill?.createdBy?.name || "";
    const userEmail = bill?.userId?.email || bill?.createdBy?.email || "";
    if (!userName) return "-";
    return userEmail ? `${userName} (${userEmail})` : userName;
  };

  const columns = [
    { title: "Bill No", dataIndex: "billNo", key: "billNo" },
    {
      title: "Company",
      key: "company",
      render: (_: any, bill: any) => getCompanyName(bill),
    },
    ...(isAdmin
      ? [
          {
            title: "Added By",
            key: "addedBy",
            render: (_: any, bill: any) => getUserLabel(bill),
          },
        ]
      : []),
    {
      title: "Total",
      key: "total",
      align: "right" as const,
      render: (_: any, bill: any) => `Rs ${Number(bill.grandTotal || 0).toFixed(2)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, bill: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`${ROUTES.BILLING}/${bill._id}`)}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(ROUTES.BILL_EDIT.replace(":id", bill._id))}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              confirmDialog({
                title: "Confirm Deletion",
                message: "This action cannot be undone. Are you sure you want to delete this bill?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => deleteBill(bill._id),
              })
            }
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>Billing</Typography.Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_BILL)}
        >
          New Bill
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search bill number"
          allowClear
          prefix={<SearchOutlined />}
          suffix={searchLoading ? <LoadingOutlined spin /> : null}
          value={filters.search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setFilters({ page: 1, search: e.target.value });
          }}
          style={{ maxWidth: 360 }}
        />
      </div>

      <Table
        rowKey="_id"
        loading={isLoading || searchLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
      />

      <div style={{ marginTop: 16, display: "flex", justifyContent: "end" }}>
        <Pagination
          current={filters.page}
          pageSize={limit}
          total={pagination?.total || 0}
          onChange={(p: number) =>
            setFilters((prev) => ({ ...prev, page: p }))
          }
          showSizeChanger={false}
        />
      </div>
    </Card>
  );
};

export default BillList;
