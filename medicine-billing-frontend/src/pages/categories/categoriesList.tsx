import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {App,Button,Card,Input,Pagination,Space,Table,Typography} from "antd";
import {DeleteOutlined,EditOutlined,LoadingOutlined,PlusOutlined,SearchOutlined,} from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useCategoriesListData } from "../../hooks/useCategoriesListData";
import type { Category } from "../../types/category";
import { useConfirmDialog } from "../../utils/confirmDialog";
import { formatDateTime } from "../../utils/dateTime";
import { getSerialNumber, resolvePaginationPageSize } from "../../utils/pagination";
import { getColumnSortOrder, resolveTableSort } from "../../utils/tableSort";

export default function CategoriesList() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const confirmDialog = useConfirmDialog();
  const {isAdmin, page,limit,search,sortState,sortedCategories,totalRecords,pageSizeSelectOptions,searchLoading,isLoading,isPending,error,setPagination,setSearch,setSort,getMedicalStoreName,deleteCategory,} = useCategoriesListData();

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success("Category deleted");
    } catch {
      message.error("Failed to delete category");
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: unknown, __: Category, index: number) =>
        getSerialNumber(page, limit, index),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "name"),
    },
    ...(isAdmin
      ? [
          {
            title: "Medical Store",
            key: "medicalStore",
            sorter: true,
            sortOrder: getColumnSortOrder(sortState, "medicalStore"),
            render: (_: unknown, category: Category) => getMedicalStoreName(category),
          },
        ]
      : []),
    {
      title: "Created At",
      key: "createdUpdatedAt",
      sorter: true,
      sortOrder: getColumnSortOrder(sortState, "createdUpdatedAt"),
      render: (_: unknown, category: Category) => (
        <span style={{ whiteSpace: "normal", lineHeight: 1.2 }}>
          {formatDateTime(category.createdAt)}
          <br />
          {formatDateTime(category.updatedAt)}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, category: Category) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            title="Edit"
            aria-label="Edit"
            onClick={() => navigate(ROUTES.CATEGORY_EDIT.replace(":id", category._id))}
          />
          <Button
            danger
            loading={isPending}
            icon={<DeleteOutlined />}
            title="Delete"
            aria-label="Delete"
            onClick={() =>
              confirmDialog({
                title: "Confirm Deletion",
                message:
                  "This action cannot be undone. Are you sure you want to delete this category?",
                confirmText: "Delete",
                danger: true,
                onConfirm: () => handleDelete(category._id),
              })
            }
          />
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <Typography.Text type="danger">Failed to load categories.</Typography.Text>
      </Card>
    );
  }

  return (
    <Card
      title={<Typography.Title level={4} style={{ margin: 0 }}>Categories</Typography.Title>}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTES.CREATE_CATEGORY)}
        >
          Add Category
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Search category..."
            allowClear
            prefix={<SearchOutlined />}
            suffix={searchLoading ? <LoadingOutlined spin /> : null}
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
            }}
            style={{ width: 360, maxWidth: "100%" }}
          />
        </Space>
      </div>

      <Table
        rowKey="_id"
        loading={isLoading || searchLoading}
        columns={columns}
        dataSource={sortedCategories}
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
          pageSize={resolvePaginationPageSize(limit, totalRecords)}
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
