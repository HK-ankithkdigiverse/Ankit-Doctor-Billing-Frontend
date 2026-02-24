import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputNumber,
  Select,
  Space,
  Table,
  Typography,
  App,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useProducts } from "../../hooks/useProducts";

type BillFormItem = {
  productId: string;
  qty: number;
  freeQty: number;
  rate: number;
  mrp: number;
  taxPercent: number;
  discount: number;
};

type BillFormProps = {
  title: string;
  submitText: string;
  submitLoading?: boolean;
  companies: any[];
  initialCompanyId?: string;
  initialCompanyName?: string;
  initialDiscount?: number;
  initialItems?: BillFormItem[];
  onSubmit: (payload: {
    companyId: string;
    discount: number;
    items: BillFormItem[];
  }) => Promise<void>;
  onCancel: () => void;
};

const emptyItem: BillFormItem = {
  productId: "",
  qty: 1,
  freeQty: 0,
  rate: 0,
  mrp: 0,
  taxPercent: 0,
  discount: 0,
};

const normalizeItems = (items?: BillFormItem[]) =>
  items && items.length ? items.map((item) => ({ ...emptyItem, ...item })) : [{ ...emptyItem }];

const BillForm = ({
  title,
  submitText,
  submitLoading,
  companies,
  initialCompanyId = "",
  initialCompanyName = "",
  initialDiscount = 0,
  initialItems,
  onSubmit,
  onCancel,
}: BillFormProps) => {
  const { message } = App.useApp();
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [discount, setDiscount] = useState(initialDiscount);
  const [items, setItems] = useState<BillFormItem[]>(normalizeItems(initialItems));
  const { data: productData, isLoading: productsLoading } = useProducts(1, 1000, "", {
    companyId: companyId || undefined,
    enabled: !!companyId,
  });
  const products = productData?.products ?? [];

  useEffect(() => {
    setCompanyId(initialCompanyId || "");
    setDiscount(Number(initialDiscount || 0));
    setItems(normalizeItems(initialItems));
  }, [initialCompanyId, initialDiscount, initialItems]);

  const companyOptions = useMemo(() => {
    const options = companies.map((c: any) => ({
      value: c._id,
      label: c.companyName || c.name || c.email || c._id,
    }));

    if (
      initialCompanyId &&
      initialCompanyName &&
      !options.some((opt: any) => opt.value === initialCompanyId)
    ) {
      options.push({ value: initialCompanyId, label: initialCompanyName });
    }

    return options;
  }, [companies, initialCompanyId, initialCompanyName]);

  const getProduct = (id: string) => products.find((p: any) => p._id === id);

  const handleCompanyChange = (value: string) => {
    setCompanyId(value);
    setItems([{ ...emptyItem }]);
  };

  const updateItem = (index: number, key: keyof BillFormItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };

      if (key === "productId") {
        const product = getProduct(value);
        if (product) {
          copy[index].rate = Number(product.price || 0);
          copy[index].mrp = Number(product.mrp || 0);
          copy[index].taxPercent = Number(product.taxPercent || 0);
        }
      }

      return copy;
    });
  };

  const addRow = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeRow = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const rowTotals = useMemo(
    () =>
      items.map((item) => {
        const amount = Number(item.rate || 0) * Number(item.qty || 0);
        const discAmt = (amount * Number(item.discount || 0)) / 100;
        const taxable = amount - discAmt;
        const cgst = (taxable * Number(item.taxPercent || 0)) / 200;
        const sgst = (taxable * Number(item.taxPercent || 0)) / 200;
        return { taxable, tax: cgst + sgst, total: taxable + cgst + sgst };
      }),
    [items]
  );

  const subTotal = rowTotals.reduce((sum, row) => sum + row.taxable, 0);
  const totalTax = rowTotals.reduce((sum, row) => sum + row.tax, 0);
  const totalBeforeDiscount = subTotal + totalTax;
  const discountAmount = Math.max(0, Number(discount || 0));
  const grandTotal = Math.max(0, totalBeforeDiscount - discountAmount);

  const submit = async () => {
    if (!companyId) {
      message.error("Company is required");
      return;
    }

    if (discount < 0) {
      message.error("Bill discount cannot be negative");
      return;
    }

    if (Number(discount || 0) > totalBeforeDiscount) {
      message.error("Discount amount cannot be greater than total bill amount.");
      return;
    }

    if (!items.length) {
      message.error("At least one bill item is required");
      return;
    }

    const invalidItemIndex = items.findIndex((it) => {
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const tax = Number(it.taxPercent || 0);
      const lineDiscount = Number(it.discount || 0);

      return (
        !it.productId ||
        qty <= 0 ||
        rate <= 0 ||
        tax < 0 ||
        tax > 100 ||
        lineDiscount < 0 ||
        lineDiscount > 100
      );
    });

    if (invalidItemIndex >= 0) {
      message.error(`Please fix item #${invalidItemIndex + 1} (product/qty/rate/gst/discount).`);
      return;
    }

    await onSubmit({
      companyId,
      discount: discountAmount,
      items: items.map((it) => ({
        ...it,
        qty: Number(it.qty || 0),
        freeQty: Number(it.freeQty || 0),
        rate: Number(it.rate || 0),
        mrp: Number(it.mrp || 0),
        taxPercent: Number(it.taxPercent || 0),
        discount: Number(it.discount || 0),
      })),
    });
  };

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (_: unknown, __: BillFormItem, index: number) => index + 1,
    },
    {
      title: "Product",
      key: "product",
      render: (_: unknown, item: BillFormItem, index: number) => (
        <Select
          value={item.productId || undefined}
          style={{ width: 220 }}
          placeholder={companyId ? "Select product" : "Select company first"}
          onChange={(value: string) => updateItem(index, "productId", value)}
          options={products.map((p: any) => ({ value: p._id, label: p.name }))}
          disabled={!companyId}
          loading={productsLoading}
        />
      ),
    },
    {
      title: "Qty",
      key: "qty",
      render: (_: unknown, item: BillFormItem, index: number) => (
        <InputNumber
          min={1}
          value={item.qty}
          onChange={(value: number | null) => updateItem(index, "qty", value || 1)}
        />
      ),
    },
    {
      title: "Free",
      key: "freeQty",
      render: (_: unknown, item: BillFormItem, index: number) => (
        <InputNumber
          min={0}
          value={item.freeQty}
          onChange={(value: number | null) => updateItem(index, "freeQty", value || 0)}
        />
      ),
    },
    {
      title: "Rate",
      key: "rate",
      render: (_: unknown, item: BillFormItem) => Number(item.rate || 0).toFixed(2),
    },
    {
      title: "MRP",
      key: "mrp",
      render: (_: unknown, item: BillFormItem) => Number(item.mrp || 0).toFixed(2),
    },
    {
      title: "GST %",
      key: "tax",
      render: (_: unknown, item: BillFormItem) => Number(item.taxPercent || 0),
    },
    {
      title: "Disc %",
      key: "discount",
      render: (_: unknown, item: BillFormItem, index: number) => (
        <InputNumber
          min={0}
          max={100}
          value={item.discount}
          onChange={(value: number | null) => updateItem(index, "discount", value || 0)}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      render: (_: unknown, __: BillFormItem, index: number) =>
        `Rs ${rowTotals[index]?.total.toFixed(2) || "0.00"}`,
    },
    {
      title: "",
      key: "remove",
      render: (_: unknown, __: BillFormItem, index: number) => (
        <Button
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => removeRow(index)}
          disabled={items.length === 1}
        />
      ),
    },
  ];

  return (
    <Card className="bill-form-card">
      <Typography.Title level={4} style={{ marginBottom: 20 }}>{title}</Typography.Title>

      <Form layout="vertical">
        <Form.Item label="Company" required>
          <Select
            value={companyId || undefined}
            placeholder="Select company"
            onChange={handleCompanyChange}
            options={companyOptions}
            className="bill-company-select"
          />
        </Form.Item>
      </Form>

      <Table
        className="bill-items-table"
        rowKey={(_: BillFormItem, index?: number) => String(index ?? 0)}
        columns={columns}
        dataSource={items}
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
};

export default BillForm;

