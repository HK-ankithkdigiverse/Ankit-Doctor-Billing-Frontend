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
  App,
} from "antd";
import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useDeleteProduct, useProducts } from "../../hooks/useProducts";
import { ROLE, ROUTES } from "../../constants";
import type { Product } from "../../types/product";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConfirmDialog } from "../../utils/confirmDialog";

const ProductsList = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ page: 1, search: "" });
  const debouncedSearch = useDebouncedValue(filters.search, 500);
  const limit = 10;

  const { data, isPending, isFetching } = useProducts(filters.page, limit, debouncedSearch);
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteProduct, isPending: deletePending } = useDeleteProduct();
  const { data: me } = useMe();
  const confirmDialog = useConfirmDialog();
  const isAdmin = me?.role === ROLE.ADMIN;
  const products: Product[] = data?.products ?? [];
  const pagination = data?.pagination;

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success("Product deleted");
    } catch {
      message.error("Failed to delete product");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Type", dataIndex: "productType", key: "productType" },
    {
      title: "Company",
      key: "company",
      render: (_: any, product: Product) => product.companyId?.companyName || "-",
    },
    ...(isAdmin
      ? [
          {
            title: "Created By",
            key: "createdBy",
            render: (_: any, product: Product) => {
              const createdBy = product.createdBy;
              return createdBy?.name || createdBy?.email || "-";
            },
          },
        ]
      : []),
    {
      title: "Stock",
      key: "stock",
      align: "right" as const,
      render: (_: any, product: Product) => product.stock ?? 0,
    },
    {
      title: "MRP",
      key: "mrp",
      align: "right" as const,
      render: (_: any, product: Product) => `Rs ${Number(product.mrp || 0).toFixed(2)}`,
    },
    {
      title: "GST %",
      key: "tax",
      align: "right" as const,
      render: (_: any, product: Product) => `${Number(product.taxPercent || 0)}%`,
    },
    {
      title: "Price",
      key: "price",
      align: "right" as const,
      render: (_: any, product: Product) => `Rs ${Number(product.price || 0).toFixed(2)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, product: Product) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`${ROUTES.PRODUCTS}/${product._id}/edit`)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletePending}
            onClick={() =>
              confirmDialog({
                title: "Confirm Deletion",
                message: "This action cannot be undone. Are you sure you want to delete this product?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => handleDelete(product._id),
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
      title={<Typography.Title level={4} style={{ margin: 0 }}>Products</Typography.Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_PRODUCT)}
        >
          Add Product
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by name, category or type..."
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
        loading={isPending || searchLoading}
        columns={columns}
        dataSource={products}
        pagination={false}
        scroll={{ x: 1200 }}
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

export default ProductsList;
