import { type ClipboardEvent, type FocusEvent, type KeyboardEvent, useEffect, useMemo, useState } from "react";
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
import { useAllProducts } from "../../hooks/useProducts";
import type { BillFormItem, BillFormRow, BillPayload, BillTaxMode, BillUserOption } from "../../types/bill";
import { useAllMedicalStores } from "../../hooks/useMedicalStores";
import { useMe } from "../../hooks/useMe";
import {
  getBillSummary,
  normalizeBillFormRows,
  toBillFormRow,
  toBillPayloadItems,
  validateBillForm,
} from "../../utils/billing";
import { createNameSorter } from "../../utils/tableSort";
import { normalizePercent, resolveBillTaxMode, resolveStoreGstPercent, toBackendTaxType } from "../../utils/tax";

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
  autoApplyStoreGstPercent?: boolean;
  onSubmit: (payload: BillPayload) => Promise<void>;
  onCancel: () => void;
};

const normalizeWholePercent = (value: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  const clamped = Math.min(100, Math.max(0, numeric));
  return Math.floor(clamped);
};

const parseWholePercentInput = (input: string | undefined) => {
  const digitsOnly = String(input ?? "").replace(/[^\d]/g, "");
  return normalizeWholePercent(digitsOnly === "" ? 0 : Number(digitsOnly));
};
const PERCENT_CONTROL_KEYS = new Set(["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Enter"]);
const hasInvalidPercentText = (input: string | undefined) => {
  const trimmed = String(input ?? "").trim();
  if (!trimmed) return false;
  return /[^0-9]/.test(trimmed);
};
const getCompanyMedicalStoreId = (company: any) =>
  typeof company?.medicalStoreId === "object" ? company?.medicalStoreId?._id : company?.medicalStoreId;
const DEFAULT_BILL_GST_PERCENT = 18;
const formatTaxPercent = (value: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  const rounded = Math.round(numeric * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(2).replace(/\.?0+$/, "");
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
  initialGstPercent = DEFAULT_BILL_GST_PERCENT,
  initialItems,
  autoApplyStoreGstPercent = true,
  onSubmit,
  onCancel,
}: BillFormProps) {
  const { message } = App.useApp();
  const [userId, setUserId] = useState(initialUserId);
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [discountPercent, setDiscountPercent] = useState(normalizeWholePercent(initialDiscount));
  const [gstPercent, setGstPercent] = useState(normalizeWholePercent(initialGstPercent));
  const [items, setItems] = useState<BillFormRow[]>(normalizeBillFormRows(initialItems));
  const { data: me } = useMe();
  // Ensure medical stores are loaded so we can resolve GST data
  // even when the current user is not an admin (me.medicalStoreId may be an ID string).
  const { data: medicalStoresData } = useAllMedicalStores({ enabled: true });

  const { data: productData, isLoading: productsLoading } = useAllProducts({
    companyId: companyId || undefined,
    enabled: !!companyId,
  });
  const products = productData?.products ?? [];

  useEffect(() => {
    setUserId(initialUserId || "");
    setCompanyId(initialCompanyId || "");
    setDiscountPercent(normalizeWholePercent(initialDiscount));
    setGstPercent(normalizeWholePercent(initialGstPercent));
    setItems(normalizeBillFormRows(initialItems));
  }, [initialUserId, initialCompanyId, initialDiscount, initialGstPercent, initialItems]);

  const storeNameById = useMemo(() => {
    const storeMap = new Map<string, string>();
    (medicalStoresData?.medicalStores ?? []).forEach((store: any) => {
      const storeId = String(store?._id || "").trim();
      const storeName = String(store?.name || "").trim();
      if (!storeId || !storeName) return;
      storeMap.set(storeId, storeName);
    });
    return storeMap;
  }, [medicalStoresData?.medicalStores]);

  const storeOptions = useMemo(
    () => {
      const optionsByStoreId = new Map<string, BillUserOption>();
      users.forEach((option) => {
        const storeId = String(option.medicalStoreId || "").trim();
        if (!storeId) return;
        const resolvedStoreName =
          option.medicalStoreName?.trim() || (storeId ? storeNameById.get(storeId) : "") || "";
        if (optionsByStoreId.has(storeId)) return;
        optionsByStoreId.set(storeId, {
          ...option,
          medicalStoreId: storeId,
          medicalStoreName: resolvedStoreName || option.medicalStoreName,
          label: resolvedStoreName || option.label,
        });
      });
      return Array.from(optionsByStoreId.values());
    },
    [storeNameById, users]
  );

  useEffect(() => {
    if (!isAdmin || !userId) return;
    const selectedUser = users.find((option) => option.value === userId);
    const selectedStoreId = String(selectedUser?.medicalStoreId || "").trim();
    if (!selectedStoreId) return;
    const canonicalStoreOption = storeOptions.find(
      (option) => String(option.medicalStoreId || "").trim() === selectedStoreId
    );
    if (canonicalStoreOption && canonicalStoreOption.value !== userId) {
      setUserId(canonicalStoreOption.value);
    }
  }, [isAdmin, storeOptions, userId, users]);

  const meMedicalStoreId =
    typeof me?.medicalStoreId === "string"
      ? me.medicalStoreId
      : me?.medicalStoreId?._id || me?.medicineId || "";
  const companyOptions = useMemo(() => {
    const selectedUserStoreId = storeOptions.find((option) => option.value === userId)?.medicalStoreId || "";
    const targetMedicalStoreId = isAdmin ? selectedUserStoreId : meMedicalStoreId;

    const isVisibleForSelectedUser = (company: any) => {
      if (!targetMedicalStoreId) return false;
      const companyStoreId = getCompanyMedicalStoreId(company);
      return String(companyStoreId || "") === String(targetMedicalStoreId);
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
  }, [companies, initialCompanyId, initialCompanyName, isAdmin, meMedicalStoreId, storeOptions, userId]);

  const getProduct = (id: string) => products.find((product: any) => product._id === id);
  const getProductName = (id: string) => getProduct(id)?.name || "";
  const getProductCategory = (id: string) => getProduct(id)?.category || "";
  const selectedUserOption = storeOptions.find((option) => option.value === userId);
  const selectedUserMedicalStoreId = selectedUserOption?.medicalStoreId || "";
  const selectedMedicalStoreId = isAdmin ? selectedUserMedicalStoreId : meMedicalStoreId;

  const selectedMedicalStore = useMemo(() => {
    const stores = medicalStoresData?.medicalStores ?? [];
    const fromList = stores.find((store) => String(store._id) === String(selectedMedicalStoreId));
    if (fromList) return fromList as any;

    if (typeof me?.medicalStoreId === "object" && me?.medicalStoreId?._id === selectedMedicalStoreId) {
      return me.medicalStoreId as any;
    }

    if (typeof (me as any)?.medicalStore === "object" && (me as any)?.medicalStore?._id === selectedMedicalStoreId) {
      return (me as any).medicalStore;
    }

    return null;
  }, [medicalStoresData?.medicalStores, me?.medicalStore, me?.medicalStoreId, selectedMedicalStoreId]);

  const resolvedTaxMode: BillTaxMode = resolveBillTaxMode(selectedMedicalStore as any);
  const selectedStoreGstPercent = resolveStoreGstPercent(selectedMedicalStore as any);
  const resolvedStoreState =
    (selectedMedicalStore as any)?.state ||
    selectedUserOption?.medicalStoreState ||
    (typeof me?.state === "string" ? me.state : "") ||
    (typeof me?.medicalStoreId === "object" ? (me.medicalStoreId as any)?.state || "" : "");
    useEffect(() => {
  console.log("Selected Store ID", selectedMedicalStoreId);
  console.log("Selected Store Data", selectedMedicalStore);
}, [selectedMedicalStoreId, selectedMedicalStore]);

  const handleCompanyChange = (value: string) => {
    setCompanyId(value);
    setItems([toBillFormRow()]);
  };

  const handleUserChange = (value: string) => {
    setUserId(value);
    setCompanyId("");
    setItems([toBillFormRow()]);
  };

  useEffect(() => {
    if (!autoApplyStoreGstPercent) return;
    const nextGstPercent =
      selectedStoreGstPercent > 0 ? selectedStoreGstPercent : DEFAULT_BILL_GST_PERCENT;
    setGstPercent(normalizePercent(nextGstPercent));
  }, [autoApplyStoreGstPercent, selectedStoreGstPercent, selectedMedicalStoreId]);

  useEffect(() => {
    if (!products.length) return;
    setItems((prev) => {
      let hasChanges = false;
      const next = prev.map((row) => {
        if (!row.productId) return row;
        const product = products.find((entry: any) => String(entry?._id) === String(row.productId));
        if (!product) return row;

        const currentRate = Number(row.rate || 0);
        const currentMrp = Number(row.mrp || 0);
        const resolvedRate = currentRate > 0 ? currentRate : Number(product.price || 0);
        const resolvedMrp = currentMrp > 0 ? currentMrp : Number(product.mrp || 0);

        if (resolvedRate === currentRate && resolvedMrp === currentMrp) return row;
        hasChanges = true;
        return {
          ...row,
          rate: resolvedRate,
          mrp: resolvedMrp,
        };
      });
      return hasChanges ? next : prev;
    });
  }, [products]);

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

  const handlePercentBlur = (
    label: "GST" | "Discount",
    setValue: (next: number) => void
  ) => (event: FocusEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (hasInvalidPercentText(rawValue)) {
      message.error(`${label} % accepts only numbers`);
    }
    setValue(parseWholePercentInput(rawValue));
  };

  const handlePercentKeyDown = (label: "GST" | "Discount") => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (/^\d$/.test(event.key) || PERCENT_CONTROL_KEYS.has(event.key)) return;
    event.preventDefault();
    message.error(`${label} % accepts only numbers`);
  };

  const handlePercentPaste = (label: "GST" | "Discount") => (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = event.clipboardData.getData("text");
    if (!hasInvalidPercentText(pastedText)) return;
    event.preventDefault();
    message.error(`${label} % accepts only numbers`);
  };
  const effectiveGstPercent = Number(gstPercent) > 0 ? Number(gstPercent) : Number(selectedStoreGstPercent || 0);

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
        gstPercent: effectiveGstPercent,
      }),
    [discountPercent, effectiveGstPercent, items, resolvedTaxMode]
  );
  const displayGstPercent = effectiveGstPercent;
  const splitDisplayGstPercent = displayGstPercent / 2;

  const submit = async () => {
    if (isAdmin && userId && !selectedUserMedicalStoreId) {
      message.error("Selected store is invalid");
      return;
    }

    // Debug info to trace why GST might be missing
    // Logs: selectedMedicalStoreId, selectedMedicalStore object, resolvedTaxMode, selectedStoreGstPercent
    // and currently computed gstPercent before submit.
    // This will help identify if store data is not loaded or lacks GST fields.
    // eslint-disable-next-line no-console
    console.log("Bill submit debug", {
      selectedMedicalStoreId,
      selectedMedicalStore,
      resolvedTaxMode,
      selectedStoreGstPercent,
      gstPercent,
      companyId,
      company: companies.find((c: any) => String(c._id) === String(companyId)),
    });

    if (isAdmin && userId && selectedUserMedicalStoreId && companyId) {
      const selectedCompany = companies.find((company: any) => String(company?._id || "") === String(companyId));
      const selectedCompanyStoreId = getCompanyMedicalStoreId(selectedCompany);
      if (selectedCompany && String(selectedCompanyStoreId || "") !== String(selectedUserMedicalStoreId)) {
        message.error("Selected company must belong to selected store");
        return;
      }
    }

    // derive payload GST values: prefer user-edited `gstPercent`, else store's configured percent
    const payloadGstPercent = effectiveGstPercent;
    const payloadGstType: BillTaxMode = resolvedTaxMode || (selectedMedicalStore as any)?.gstType || "CGST_SGST";

    const validationMessage = validateBillForm({
      isAdmin,
      userId,
      companyId,
      gstPercent: payloadGstPercent,
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
      gstType: payloadGstType,
      taxType: toBackendTaxType(payloadGstType),
      gstPercent: payloadGstPercent,
      items: toBillPayloadItems(items),
      ...(selectedMedicalStoreId ? { medicalStoreId: selectedMedicalStoreId } : {}),
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
          options={products.map((product: any) => ({
            value: product._id,
            label: product.category ? `${product.name} (${product.category})` : product.name,
          }))}
          disabled={!companyId}
          loading={productsLoading}
        />
      ),
    },
    {
      title: "Category",
      key: "category",
      sorter: createNameSorter((row: BillFormRow) => getProductCategory(row.productId)),
      render: (_: unknown, item: BillFormRow) => getProductCategory(item.productId) || "-",
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
          <Form.Item label="Store" required>
            <Select
              value={userId || undefined}
              placeholder="Select store"
              onChange={handleUserChange}
              options={storeOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        )}
        <Form.Item label="Company" required>
          <Select
            value={companyId || undefined}
            placeholder={isAdmin && !userId ? "Select store first" : "Select company"}
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
          <div className="bill-summary-row bill-summary-row-gst">
            <Typography.Text className="bill-summary-label">GST (%)</Typography.Text>
            <InputNumber
              className="bill-summary-input app-percent-input"
              min={0}
              max={100}
              value={gstPercent}
              disabled
              onChange={(value: number | null) => setGstPercent(normalizeWholePercent(value || 0))}
              onBlur={handlePercentBlur("GST", setGstPercent)}
              onKeyDown={handlePercentKeyDown("GST")}
              onPaste={handlePercentPaste("GST")}
              parser={parseWholePercentInput}
              step={1}
              precision={0}
              addonAfter="%"
            />
            <div className="bill-summary-note" style={{ marginTop: 6 }}>
              {selectedStoreGstPercent > 0 && gstPercent === 0 ? (
                <Typography.Text type="secondary">Store GST available: {selectedStoreGstPercent}% — it will be applied automatically.</Typography.Text>
              ) : null}
              {selectedStoreGstPercent === 0 && subTotal === 0 ? (
                <Typography.Text type="secondary">GST is 0 because there are no priced items yet.</Typography.Text>
              ) : null}
              {selectedStoreGstPercent === 0 && subTotal > 0 && gstPercent === 0 ? (
                <Typography.Text type="secondary">Selected store has no GST configured.</Typography.Text>
              ) : null}
            </div>
          </div>
          {resolvedTaxMode === "IGST" ? (
            <div className="bill-summary-row">
              <Typography.Text className="bill-summary-label">IGST ({formatTaxPercent(displayGstPercent)}%)</Typography.Text>
              <Typography.Text className="bill-summary-value">Rs {totalIgst.toFixed(2)}</Typography.Text>
            </div>
          ) : (
            <div className="bill-summary-row">
              <Typography.Text className="bill-summary-label">
                CGST/SGST ({formatTaxPercent(splitDisplayGstPercent)}% + {formatTaxPercent(splitDisplayGstPercent)}%)
              </Typography.Text>
              <Typography.Text className="bill-summary-value">
                Rs {totalCgst.toFixed(2)} + Rs {totalSgst.toFixed(2)}
              </Typography.Text>
            </div>
          )}
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Total GST ({formatTaxPercent(displayGstPercent)}%)</Typography.Text>

            <Typography.Text className="bill-summary-value">Rs {totalTax.toFixed(2)}</Typography.Text>
          </div>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Total Amount</Typography.Text>
            <Typography.Text className="bill-summary-value">Rs {totalBeforeDiscount.toFixed(2)}</Typography.Text>
          </div>
          <div className="bill-summary-row">
            <Typography.Text className="bill-summary-label">Discount (%)</Typography.Text>
            <InputNumber
              className="bill-summary-input app-percent-input"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(value: number | null) => setDiscountPercent(normalizeWholePercent(value || 0))}
              onBlur={handlePercentBlur("Discount", setDiscountPercent)}
              onKeyDown={handlePercentKeyDown("Discount")}
              onPaste={handlePercentPaste("Discount")}
              parser={parseWholePercentInput}
              step={1}
              precision={0}
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
