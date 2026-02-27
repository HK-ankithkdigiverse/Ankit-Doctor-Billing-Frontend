import { useEffect, useMemo, useState } from "react";
import {
  App,
  Button,
  Card,
  Form,
  InputNumber,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useProducts } from "../../hooks/useProducts";
import type { BillFormItem, BillFormRow, BillPayload, BillUserOption } from "../../types/bill";
import {
  getBillSummary,
  normalizeBillFormRows,
  toBillFormRow,
  toBillPayloadItems,
  validateBillForm,
} from "../../utils/billing";
import { sortNumber, sortText } from "../../utils/tableSort";

type BillFormProps = {
  title: string;
  submitText: string;
  submitLoading?: boolean;
  isAdmin?: boolean;
  users?: BillUserOption[];
  initialUserId?: string;
  companies: any[];
  initialCompanyId?: string;
  initialCompanyName?: string;
  initialDiscount?: number;
  initialItems?: BillFormItem[];
  onSubmit: (payload: BillPayload) => Promise<void>;
  onCancel: () => void;
};

export default function BillForm({
  title,
  submitText,
  submitLoading,
  isAdmin = false,
  users = [],
  initialUserId = "",
  companies,
  initialCompanyId = "",
  initialCompanyName = "",
  initialDiscount = 0,
  initialItems,
  onSubmit,
  onCancel,
}: BillFormProps) {
  const { message } = App.useApp();
  const [userId, setUserId] = useState(initialUserId);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [discount, setDiscount] = useState(initialDiscount);
  const [items, setItems] = useState<BillFormRow[]>(normalizeBillFormRows(initialItems));

  const { data: productData, isLoading: productsLoading } = useProducts(1, 1000, "", {
    companyId: companyId || undefined,
    enabled: !!companyId,
  });
  const products = productData?.products ?? [];

  useEffect(() => {
    setUserId(initialUserId || "");
    setCompanyId(initialCompanyId || "");
    setDiscount(Number(initialDiscount || 0));
    setItems(normalizeBillFormRows(initialItems));
  }, [initialUserId, initialCompanyId, initialDiscount, initialItems]);

  const companyOptions = useMemo(() => {
    const isOwnedBySelectedUser = (company: any) => {
      if (!isAdmin) return true;
      if (!userId) return false;
      const ownerId = typeof company?.userId === "object" ? company?.userId?._id : company?.userId;
      return String(ownerId || "") === String(userId);
    };

    const options = companies.filter(isOwnedBySelectedUser).map((company: any) => ({
      value: company._id,
      label: company.companyName || company.name || company.email || company._id,
    }));

    if (
      initialCompanyId &&
      initialCompanyName &&
      !options.some((option: { value: string }) => option.value === initialCompanyId)
    ) {
      options.push({ value: initialCompanyId, label: initialCompanyName });
    }

    return options;
  }, [companies, initialCompanyId, initialCompanyName, isAdmin, userId]);

  const getProduct = (id: string) => products.find((product: any) => product._id === id);
  const getProductName = (id: string) => getProduct(id)?.name || "";

  const handleCompanyChange = (value: string) => {
    setCompanyId(value);
    setItems([toBillFormRow()]);
  };

  const handleUserChange = (value: string) => {
    setUserId(value);
    setCompanyId("");
    setItems([toBillFormRow()]);
  };

  const updateItem = (rowId: string, key: keyof BillFormItem, value: string | number) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        const nextRow: BillFormRow = { ...row, [key]: value };

        if (key === "productId") {
          const product = getProduct(String(value));
          if (product) {
            nextRow.rate = Number(product.price || 0);
            nextRow.mrp = Number(product.mrp || 0);
            nextRow.taxPercent = Number(product.taxPercent || 0);
          }
        }

        return nextRow;
      })
    );
  };

  const addRow = () => setItems((prev) => [...prev, toBillFormRow()]);
  const removeRow = (rowId: string) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.rowId !== rowId)));

  const { rowTotals, subTotal, totalTax, totalBeforeDiscount, discountAmount, grandTotal } = useMemo(
    () => getBillSummary(items, discount),
    [items, discount]
  );

  const submit = async () => {
    const validationMessage = validateBillForm({
      isAdmin,
      userId,
      companyId,
      discount,
      totalBeforeDiscount,
      items,
    });

    if (validationMessage) {
      message.error(validationMessage);
      return;
    }

    await onSubmit({
      userId: isAdmin ? userId : undefined,
      companyId,
      discount: discountAmount,
      items: toBillPayloadItems(items),
    });
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: unknown, __: BillFormRow, index: number) => index + 1,
    },
    {
      title: "Product",
      key: "product",
      sorter: (a: BillFormRow, b: BillFormRow) => sortText(getProductName(a.productId), getProductName(b.productId)),
      render: (_: unknown, item: BillFormRow) => (
        <Select
          value={item.productId || undefined}
          style={{ width: 220 }}
          placeholder={companyId ? "Select product" : "Select company first"}
          onChange={(value: string) => updateItem(item.rowId, "productId", value)}
          options={products.map((product: any) => ({ value: product._id, label: product.name }))}
          disabled={!companyId}
          loading={productsLoading}
        />
      ),
    },
    {
      title: "Qty",
      key: "qty",
      sorter: (a: BillFormRow, b: BillFormRow) => sortNumber(a.qty, b.qty),
      render: (_: unknown, item: BillFormRow) => (
        <InputNumber
          min={1}
          value={item.qty}
          onChange={(value: number | null) => updateItem(item.rowId, "qty", value || 1)}
        />
      ),
    },
    {
      title: "Free",
      key: "freeQty",
      sorter: (a: BillFormRow, b: BillFormRow) => sortNumber(a.freeQty, b.freeQty),
      render: (_: unknown, item: BillFormRow) => (
        <InputNumber
          min={0}
          value={item.freeQty}
          onChange={(value: number | null) => updateItem(item.rowId, "freeQty", value || 0)}
        />
      ),
    },
    {
      title: "Rate",
      key: "rate",
      sorter: (a: BillFormRow, b: BillFormRow) => sortNumber(a.rate, b.rate),
      render: (_: unknown, item: BillFormRow) => Number(item.rate || 0).toFixed(2),
    },
    {
      title: "MRP",
      key: "mrp",
      sorter: (a: BillFormRow, b: BillFormRow) => sortNumber(a.mrp, b.mrp),
      render: (_: unknown, item: BillFormRow) => Number(item.mrp || 0).toFixed(2),
    },
    {
      title: "GST %",
      key: "tax",
      sorter: (a: BillFormRow, b: BillFormRow) => sortNumber(a.taxPercent, b.taxPercent),
      render: (_: unknown, item: BillFormRow) => Number(item.taxPercent || 0),
    },
    {
      title: "Disc %",
      key: "discount",
      sorter: (a: BillFormRow, b: BillFormRow) => sortNumber(a.discount, b.discount),
      render: (_: unknown, item: BillFormRow) => (
        <InputNumber
          min={0}
          max={100}
          value={item.discount}
          onChange={(value: number | null) => updateItem(item.rowId, "discount", value || 0)}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      sorter: (a: BillFormRow, b: BillFormRow) => sortNumber(rowTotals[a.rowId]?.total, rowTotals[b.rowId]?.total),
      render: (_: unknown, item: BillFormRow) => `Rs ${(rowTotals[item.rowId]?.total || 0).toFixed(2)}`,
    },
    {
      title: "",
      key: "remove",
      render: (_: unknown, item: BillFormRow) => (
        <Button
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => removeRow(item.rowId)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  return (
    <Card className="bill-form-card">
      <Typography.Title level={4} style={{ marginBottom: 20 }}>{title}</Typography.Title>

      <Form layout="vertical">
        {isAdmin && (
          <Form.Item label="User" required>
            <Select
              value={userId || undefined}
              placeholder="Select user"
              onChange={handleUserChange}
              options={users}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        )}
        <Form.Item label="Company" required>
          <Select
            value={companyId || undefined}
            placeholder={isAdmin && !userId ? "Select user first" : "Select company"}
            onChange={handleCompanyChange}
            options={companyOptions}
            className="bill-company-select"
            disabled={isAdmin && !userId}
          />
        </Form.Item>
      </Form>

      <Table
        className="bill-items-table"
        rowKey="rowId"
        columns={columns}
        dataSource={items}
        sortDirections={["ascend", "descend"]}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <Space style={{ marginTop: 16 }}>
        <Button className="bill-add-btn" icon={<PlusOutlined />} onClick={addRow} disabled={!companyId}>
          Add Item
        </Button>
      </Space>

      <Card className="bill-summary-card" size="small" style={{ marginTop: 16, maxWidth: 380, marginLeft: "auto" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Sub Total</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {subTotal.toFixed(2)}</Typography.Text>
          </div>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Tax</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {totalTax.toFixed(2)}</Typography.Text>
          </div>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Total Before Discount</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {totalBeforeDiscount.toFixed(2)}</Typography.Text>
          </div>
          <InputNumber
            style={{ width: "100%" }}
            value={discount}
            min={0}
            max={Number(totalBeforeDiscount.toFixed(2))}
            onChange={(value: number | null) => setDiscount(value || 0)}
            addonBefore="Bill Discount"
          />
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Discount Amount</Typography.Text>
            <Typography.Text className="bill-summary-value">- Rs {discountAmount.toFixed(2)}</Typography.Text>
          </div>
          <div className="bill-summary-row bill-summary-row-grand">
            <Typography.Text className="bill-summary-label">Grand Total</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {grandTotal.toFixed(2)}</Typography.Text>
          </div>
        </Space>
      </Card>

      <Space style={{ marginTop: 20 }}>
        <Button className="bill-cancel-btn" onClick={onCancel}>Cancel</Button>
        <Button type="primary" loading={submitLoading} onClick={submit}>
          {submitText}
        </Button>
      </Space>
    </Card>
  );
}
