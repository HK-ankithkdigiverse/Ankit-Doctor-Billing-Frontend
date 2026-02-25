import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Pagination,
  Select,
  Space,
  Table,
  Typography,
  App,
} from "antd";
import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useDeleteProduct, useProducts } from "../../hooks/useProducts";
import { useUsers } from "../../hooks/useUsers";
import { ROLE, ROUTES } from "../../constants";
import type { Product } from "../../types/product";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { sortNumber, sortText } from "../../utils/tableSort";

const ProductsList = () => {
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
  const hasAdminFilter = isAdmin && !!filters.createdBy;
  const queryPage = hasAdminFilter ? 1 : filters.page;
  const queryLimit = hasAdminFilter ? 1000 : filters.limit;

  const { data, isPending, isFetching } = useProducts(queryPage, queryLimit, debouncedSearch);
  const { data: usersFilterData } = useUsers(1, 1000, "", "all");
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteProduct, isPending: deletePending } = useDeleteProduct();
  const confirmDialog = useConfirmDialog();
  const productsRaw: Product[] = data?.products ?? [];
  const getCreatedById = (product: Product) =>
    typeof product.createdBy === "object" ? product.createdBy?._id : (product.createdBy as unknown as string);
  const matchesAdminFilters = (product: Product) => {
    const userOk = !filters.createdBy || getCreatedById(product) === filters.createdBy;
    return userOk;
  };
  const filteredProducts: Product[] = isAdmin ? productsRaw.filter(matchesAdminFilters) : productsRaw;
  const products: Product[] = hasAdminFilter
    ? filteredProducts.slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
    : filteredProducts;
  const pagination = data?.pagination;
  const totalRecords = hasAdminFilter ? filteredProducts.length : pagination?.total || 0;
  const pageSizeSelectOptions = [
    { label: "10 / page", value: 10 },
    { label: "30 / page", value: 30 },
    { label: "50 / page", value: 50 },
    { label: "100 / page", value: 100 },
    ...(totalRecords > 0 ? [{ label: "All / page", value: totalRecords }] : []),
  ].filter((option, index, arr) => arr.findIndex((x) => x.value === option.value) === index);
  const userOptions =
    usersFilterData?.users?.map((user) => ({
      value: user._id,
      label: user.name || user.email,
    })) ?? [];
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success("Product deleted");
    } catch {
      message.error("Failed to delete product");
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: any, __: Product, index: number) => (filters.page - 1) * filters.limit + index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Product, b: Product) => sortText(a.name, b.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a: Product, b: Product) => sortText(a.category, b.category),
    },
    {
      title: "Type",
      dataIndex: "productType",
      key: "productType",
      sorter: (a: Product, b: Product) => sortText(a.productType, b.productType),
    },
    {
      title: "Company",
      key: "company",
      sorter: (a: Product, b: Product) =>
        sortText(
          (a.companyId as any)?.companyName || (a.companyId as any)?.name || "",
          (b.companyId as any)?.companyName || (b.companyId as any)?.name || ""
        ),
      render: (_: any, product: Product) =>
        (product.companyId as any)?.companyName || (product.companyId as any)?.name || "-",
    },
    ...(isAdmin
      ? [
          {
            title: "Created By",
            key: "createdBy",
            sorter: (a: Product, b: Product) =>
              sortText(
                typeof a.createdBy === "object" ? a.createdBy?.name || a.createdBy?.email : "",
                typeof b.createdBy === "object" ? b.createdBy?.name || b.createdBy?.email : ""
              ),
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
      sorter: (a: Product, b: Product) => sortNumber(a.stock, b.stock),
      render: (_: any, product: Product) => product.stock ?? 0,
    },
    {
      title: "MRP",
      key: "mrp",
      align: "right" as const,
      sorter: (a: Product, b: Product) => sortNumber(a.mrp, b.mrp),
      render: (_: any, product: Product) => `Rs ${Number(product.mrp || 0).toFixed(2)}`,
    },
    {
      title: "GST %",
      key: "tax",
      align: "right" as const,
      sorter: (a: Product, b: Product) => sortNumber(a.taxPercent, b.taxPercent),
      render: (_: any, product: Product) => `${Number(product.taxPercent || 0)}%`,
    },
    {
      title: "Price",
      key: "price",
      align: "right" as const,
      sorter: (a: Product, b: Product) => sortNumber(a.price, b.price),
      render: (_: any, product: Product) => `Rs ${Number(product.price || 0).toFixed(2)}`,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, product: Product) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            title="Edit"
            aria-label="Edit"
            onClick={() => navigate(`${ROUTES.PRODUCTS}/${product._id}/edit`)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deletePending}
            title="Delete"
            aria-label="Delete"
            onClick={() =>
              confirmDialog({
                title: "Confirm Deletion",
                message: "This action cannot be undone. Are you sure you want to delete this product?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => handleDelete(product._id),
              })
            }
          />
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
        <Space wrap>
          <Input
            placeholder="Search by name, category or type..."
            allowClear
            prefix={<SearchOutlined />}
            suffix={searchLoading ? <LoadingOutlined spin /> : null}
            value={filters.search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFilters((prev) => ({ ...prev, page: 1, search: e.target.value }));
            }}
            style={{ width: 360, maxWidth: "100%" }}
          />
          {isAdmin && (
            <>
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
            </>
          )}
        </Space>
      </div>

      <Table
        rowKey="_id"
        loading={isPending || searchLoading}
        columns={columns}
        dataSource={products}
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
    </Card>
  );
};

export default ProductsList;
