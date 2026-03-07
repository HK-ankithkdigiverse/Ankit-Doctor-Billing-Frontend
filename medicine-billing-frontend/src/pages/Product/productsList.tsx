import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {App,Button,Card,Input,Pagination,Select,Space,Table,Typography,} from "antd";
import { DeleteOutlined,EditOutlined,LoadingOutlined,PlusOutlined,SearchOutlined} from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useProductsListData } from "../../hooks/useProductsListData";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { getSerialNumber } from "../../utils/pagination";
import { getColumnSortOrder, resolveTableSort } from "../../utils/tableSort";
import type { Product } from "../../types/product";

export default function ProductsList() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const confirmDialog = useConfirmDialog();
  const {isAdmin,page,limit,search,medicalStoreId,sortState,products,totalRecords,pageSizeSelectOptions,medicalStoreOptions,requestMedicalStoreOptions,searchLoading,isPending,deletePending,setPagination,setSearch,setMedicalStoreId,setSort,getProductMedicalStoreName,pickProductDate,deleteProduct,} = useProductsListData();

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
      render: (_: any, __: Product, index: number) => getSerialNumber(page, limit, index),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "name"),
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
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "company"),
      render: (_: any, product: Product) =>
        (product.companyId as any)?.companyName || (product.companyId as any)?.name || "-",
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store",
            key: "medicalStore",
            sorter: true,
            sortOrder: getColumnSortOrder(sortState, "medicalStore"),
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
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "createdUpdatedAt"),
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
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
            }}
            style={{ width: 360, maxWidth: "100%" }}
          />
          {isAdmin && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Filter by medical store"
              value={medicalStoreId || undefined}
              options={medicalStoreOptions}
              onOpenChange={(open) => {
                if (open) requestMedicalStoreOptions();
              }}
              onChange={(value) => setMedicalStoreId(value || "")}
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
    </Card>
  );
}
