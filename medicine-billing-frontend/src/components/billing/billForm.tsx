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
import type { BillFormItem, BillFormRow, BillPayload, BillTaxMode, BillUserOption } from "../../types/bill";
import { useMedicalStores } from "../../hooks/useMedicalStores";
import { useMe } from "../../hooks/useMe";
import {
  getBillSummary,
  normalizeBillFormRows,
  toBillFormRow,
  toBillPayloadItems,
  validateBillForm,
} from "../../utils/billing";
import { createNameSorter } from "../../common/helpers/tableSort";

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
  initialGstPercent?: number;
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
  initialGstPercent = 0,
  initialItems,
  onSubmit,
  onCancel,
}: BillFormProps) {
  const { message } = App.useApp();
  const [userId, setUserId] = useState(initialUserId);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [discountPercent, setDiscountPercent] = useState(initialDiscount);
  const [gstPercent, setGstPercent] = useState(initialGstPercent);
  const [items, setItems] = useState<BillFormRow[]>(normalizeBillFormRows(initialItems));
  const { data: me } = useMe();
  const { data: medicalStoresData } = useMedicalStores(1, 1000, "");

  const { data: productData, isLoading: productsLoading } = useProducts(1, 1000, "", {
    companyId: companyId || undefined,
    enabled: !!companyId,
  });
  const products = productData?.products ?? [];

  useEffect(() => {
    setUserId(initialUserId || "");
    setCompanyId(initialCompanyId || "");
    setDiscountPercent(Number(initialDiscount || 0));
    setGstPercent(Number(initialGstPercent || 0));
    setItems(normalizeBillFormRows(initialItems));
  }, [initialUserId, initialCompanyId, initialDiscount, initialGstPercent, initialItems]);

  const companyOptions = useMemo(() => {
    const selectedUserStoreId = users.find((option) => option.value === userId)?.medicalStoreId || "";

    const isVisibleForSelectedUser = (company: any) => {
      if (!isAdmin) return true;
      if (!userId || !selectedUserStoreId) return false;
      const companyStoreId =
        typeof company?.medicalStoreId === "object"
          ? company?.medicalStoreId?._id
          : company?.medicalStoreId;
      return String(companyStoreId || "") === String(selectedUserStoreId);
    };

    const options = companies.filter(isVisibleForSelectedUser).map((company: any) => ({
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
  }, [companies, initialCompanyId, initialCompanyName, isAdmin, userId, users]);

  const getProduct = (id: string) => products.find((product: any) => product._id === id);
  const getProductName = (id: string) => getProduct(id)?.name || "";
  const selectedUserOption = users.find((option) => option.value === userId);

  const meMedicalStoreId =
    typeof me?.medicalStoreId === "string"
      ? me.medicalStoreId
      : me?.medicalStoreId?._id || me?.medicineId || "";
  const selectedUserMedicalStoreId = selectedUserOption?.medicalStoreId || "";
  const selectedMedicalStoreId = isAdmin ? selectedUserMedicalStoreId : meMedicalStoreId;

  const selectedMedicalStore = useMemo(() => {
    const stores = medicalStoresData?.medicalStores ?? [];
    const fromList = stores.find((store) => String(store._id) === String(selectedMedicalStoreId));
    if (fromList) return fromList as any;

    if (typeof me?.medicalStoreId === "object" && me?.medicalStoreId?._id === selectedMedicalStoreId) {
      return me.medicalStoreId as any;
    }

    return null;
  }, [medicalStoresData?.medicalStores, me?.medicalStoreId, selectedMedicalStoreId]);

  const resolvedTaxMode: BillTaxMode =
    (selectedMedicalStore as any)?.gstType === "IGST" ||
    (selectedMedicalStore as any)?.taxType === "INTER"
      ? "IGST"
      : "CGST_SGST";
  const resolvedStoreState =
    (selectedMedicalStore as any)?.state ||
    selectedUserOption?.medicalStoreState ||
    (typeof me?.state === "string" ? me.state : "") ||
    (typeof me?.medicalStoreId === "object" ? (me.medicalStoreId as any)?.state || "" : "");

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
          }
        }

        return nextRow;
      })
    );
  };

  const addRow = () => setItems((prev) => [...prev, toBillFormRow()]);
  const removeRow = (rowId: string) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.rowId !== rowId)));

  const {
    subTotal,
    totalTax,
    totalCgst,
    totalSgst,
    totalIgst,
    totalBeforeDiscount,
    discountAmount,
    grandTotal,
  } = useMemo(
    () =>
      getBillSummary(items, discountPercent, {
        taxMode: resolvedTaxMode,
        gstPercent,
      }),
    [discountPercent, gstPercent, items, resolvedTaxMode]
  );

  const submit = async () => {
    const validationMessage = validateBillForm({
      isAdmin,
      userId,
      companyId,
      gstPercent,
      discount: discountPercent,
      items,
    });

    if (validationMessage) {
      message.error(validationMessage);
      return;
    }

    await onSubmit({
      userId: isAdmin ? userId : undefined,
      companyId,
      // Backend currently persists `discount` as amount.
      discount: discountAmount,
      gstPercent,
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
      sorter: createNameSorter((row: BillFormRow) => getProductName(row.productId)),
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
      render: (_: unknown, item: BillFormRow) => Number(item.rate || 0).toFixed(2),
    },
    {
      title: "MRP",
      key: "mrp",
      render: (_: unknown, item: BillFormRow) => Number(item.mrp || 0).toFixed(2),
    },
    {
      title: "Line Total",
      key: "total",
      render: (_: unknown, item: BillFormRow) =>
        `Rs ${(Number(item.rate || 0) * Number(item.qty || 0)).toFixed(2)}`,
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
        <Typography.Text type="secondary">
          GST Type:{" "}
          {resolvedTaxMode === "IGST" ? "IGST" : "CGST & SGST"}
        </Typography.Text>
        <br />
        <Typography.Text type="secondary">
          Store State: {resolvedStoreState || "-"}
        </Typography.Text>
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
            <Typography.Text className="bill-summary-label">GST (%)</Typography.Text>
            <InputNumber
              min={0}
              max={100}
              value={gstPercent}
              onChange={(value: number | null) => setGstPercent(value || 0)}
              addonAfter="%"
            />
          </div>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">GST Amount</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {totalTax.toFixed(2)}</Typography.Text>
          </div>
          {resolvedTaxMode === "IGST" ? (
            <div className="bill-summary-row">
              <Typography.Text className="bill-summary-label">IGST</Typography.Text>
              <Typography.Text className="bill-summary-value">Rs {totalIgst.toFixed(2)}</Typography.Text>
            </div>
          ) : (
            <>
              <div className="bill-summary-row">
                <Typography.Text className="bill-summary-label">CGST</Typography.Text>
                <Typography.Text className="bill-summary-value">Rs {totalCgst.toFixed(2)}</Typography.Text>
              </div>
              <div className="bill-summary-row">
                <Typography.Text className="bill-summary-label">SGST</Typography.Text>
                <Typography.Text className="bill-summary-value">Rs {totalSgst.toFixed(2)}</Typography.Text>
              </div>
            </>
          )}
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Total Amount</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {totalBeforeDiscount.toFixed(2)}</Typography.Text>
          </div>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Discount (%)</Typography.Text>
            <InputNumber
              min={0}
              max={100}
              value={discountPercent}
              onChange={(value: number | null) => setDiscountPercent(value || 0)}
              addonAfter="%"
            />
          </div>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Discount Amount</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {discountAmount.toFixed(2)}</Typography.Text>
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
