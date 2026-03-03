import { useMemo, useState, type ChangeEvent } from "react";
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
import { useMedicalStores } from "../../hooks/useMedicalStores";
import { ROLE, ROUTES } from "../../constants";
import type { Product } from "../../types/product";
import { useMe } from "../../hooks/useMe";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { createDateSorter, createNameSorter } from "../../utils/tableSort";

export default function ProductsList() {
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
  const hasAdminFilter = isAdmin && !!filters.medicalStoreId;
  const queryPage = hasAdminFilter ? 1 : filters.page;
  const queryLimit = hasAdminFilter ? 1000 : filters.limit;

  const { data, isPending, isFetching } = useProducts(queryPage, queryLimit, debouncedSearch);
  const { data: medicalStoresData } = useMedicalStores(1, 1000, "", {
    enabled: isAdmin,
  });
  const searchLoading = filters.search !== debouncedSearch || isFetching;
  const { mutateAsync: deleteProduct, isPending: deletePending } = useDeleteProduct();
  const confirmDialog = useConfirmDialog();
  const productsRaw: Product[] = data?.products ?? [];
  const getProductMedicalStoreId = (product: Product) => {
    if (typeof product.medicalStoreId === "string") return product.medicalStoreId;
    if (typeof product.medicalStoreId === "object" && product.medicalStoreId?._id) {
      return product.medicalStoreId._id;
    }
    if (typeof product.createdBy?.medicalStoreId === "string") {
      return product.createdBy.medicalStoreId;
    }
    if (
      typeof product.createdBy?.medicalStoreId === "object" &&
      product.createdBy.medicalStoreId?._id
    ) {
      return product.createdBy.medicalStoreId._id;
    }
    return "";
  };
  const medicalStoreNameById = useMemo(() => {
    const map = new Map<string, string>();
    (medicalStoresData?.medicalStores ?? []).forEach((store) => {
      const storeId = store?._id ? String(store._id) : "";
      const storeName = store?.name ? String(store.name).trim() : "";
      if (storeId && storeName) {
        map.set(storeId, storeName);
      }
    });
    return map;
  }, [medicalStoresData?.medicalStores]);
  const getProductMedicalStoreName = (product: Product) => {
    if (typeof product.medicalStoreId === "object") {
      const storeName = product.medicalStoreId?.name?.trim();
      if (storeName) return storeName;
    }
    const medicalStoreId = getProductMedicalStoreId(product);
    if (!medicalStoreId) return "-";
    return medicalStoreNameById.get(medicalStoreId) || "-";
  };
  const matchesAdminFilters = (product: Product) => {
    const storeId = getProductMedicalStoreId(product);
    return !filters.medicalStoreId || storeId === filters.medicalStoreId;
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
  const medicalStoreOptions =
    (medicalStoresData?.medicalStores ?? []).map((store) => ({
      value: store._id,
      label: store.name || store._id,
    })) ?? [];
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      message.success("Product deleted");
    } catch {
      message.error("Failed to delete product");
    }
  };
  const objectIdToDate = (id?: string): Date | null => {
    if (!id || id.length < 8) return null;
    const epochSeconds = Number.parseInt(id.slice(0, 8), 16);
    if (!Number.isFinite(epochSeconds)) return null;
    const parsed = new Date(epochSeconds * 1000);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const pickProductDate = (product: Product, field: "created" | "updated"): string | Date | null => {
    const fallbackFromId = objectIdToDate(product._id);
    const candidates =
      field === "created"
        ? [product.createdAt, (product as any).createdDate, (product as any).date, fallbackFromId]
        : [
            product.updatedAt,
            (product as any).updatedDate,
            product.createdAt,
            (product as any).createdDate,
            fallbackFromId,
          ];
    const value = candidates.find((candidate) => {
      if (candidate instanceof Date) return !Number.isNaN(candidate.getTime());
      return candidate !== undefined && candidate !== null && String(candidate).trim() !== "";
    });
    return (value as string | Date | undefined) ?? null;
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
      sorter: createNameSorter((row: Product) => row.name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Type",
      dataIndex: "productType",
      key: "productType",
    },
    {
      title: "Company",
      key: "company",
      sorter: createNameSorter(
        (row: Product) => (row.companyId as any)?.companyName || (row.companyId as any)?.name || ""
      ),
      render: (_: any, product: Product) =>
        (product.companyId as any)?.companyName || (product.companyId as any)?.name || "-",
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store",
            key: "medicalStore",
            sorter: createNameSorter((row: Product) => getProductMedicalStoreName(row)),
            render: (_: any, product: Product) => getProductMedicalStoreName(product),
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
      title: "Price",
      key: "price",
      align: "right" as const,
      render: (_: any, product: Product) => `Rs ${Number(product.price || 0).toFixed(2)}`,
    },
    {
      title: "Date (Created Date, Updated Date)",
      key: "createdUpdatedAt",
      sorter: createDateSorter((row: Product) => pickProductDate(row, "updated")),
      render: (_: any, product: Product) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(pickProductDate(product, "created"))}
          <br />
          {formatDateTime(pickProductDate(product, "updated"))}
        </span>
      ),
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
            placeholder="Search by name, category, type..."
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
              style={{ width: 240 }}
            />
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
}

