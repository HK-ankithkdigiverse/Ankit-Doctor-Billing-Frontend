import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Grid, Space, Typography } from "antd";
import { EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useBill } from "../../hooks/useBills";
import { getCompanyDisplayName, getCompanyLogoUrl, getUploadFileUrl } from "../../utils/company";
import DotLoading from "../../components/ui/dotLoading";
import {
  formatBillCurrency,
  getBillInvoiceBreakdown,
  getBillUserProfile,
} from "../../utils/billing";
import { formatDateTime } from "../../utils/dateTime";

const INVOICE_COLORS = {
  accent: "#0f172a",
  surfaceBg: "#ffffff",
  darkPrimary: "#0b1120",
  darkSecondary: "#111827",
  darkAccent: "#0f172a",
  textStrong: "#0f172a",
  textBody: "#1f2937",
  textMuted: "#4b5563",
  border: "#e5e7eb",
  success: "#16a34a",
  danger: "#dc2626",
  white: "#fff",
} as const;

export default function BillView() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const { id } = useParams();
  const isValidBillId = !!id && /^[a-fA-F0-9]{24}$/.test(id);
  const { data, isLoading, isError, error } = useBill(id, {
    enabled: isValidBillId,
  });
  const printRef = useRef<HTMLDivElement>(null);
  const autoDownloadTriggered = useRef(false);
  const bill = data?.bill;
  const items = data?.items ?? [];
  const companyName = getCompanyDisplayName(bill?.companyId) || "Company";
  const companyGst = bill?.companyId?.gstNumber || (bill?.companyId as any)?.gstNo || "-";
  const companyAddress = bill?.companyId?.address || "-";
  const companyPhone = bill?.companyId?.phone || "-";
  const companyEmail = bill?.companyId?.email || "-";
  const userProfile = getBillUserProfile(bill);
  const userMedicalName = userProfile.medicalName || companyName || "-";
  const userPhone = userProfile.phone;
  const userAddress = userProfile.address;
  const userSignature = userProfile.signature || (bill as any)?.signature || "";
  const userGstNumber = userProfile.gstNumber;
  const userPanCardNumber = userProfile.panCardNumber;
  const companyLogoAsset = useMemo(() => {
    const company = bill?.companyId as any;
    return (
      company?.logo ||
      company?.logoUrl ||
      company?.image ||
      company?.companyLogo ||
      (bill as any)?.logo ||
      ""
    );
  }, [bill]);
  const logoUrl = useMemo(
    () => getCompanyLogoUrl(companyLogoAsset),
    [companyLogoAsset]
  );
  const signatureUrl = useMemo(() => getUploadFileUrl(userSignature), [userSignature]);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const [isSignatureVisible, setIsSignatureVisible] = useState(true);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const shouldShowLogo = !!logoUrl && isLogoVisible;
  const shouldShowSignature = !!signatureUrl && isSignatureVisible;
  const compactPreview = !screens.md && !isPreparingPdf;
  const totals = (data as any)?.totals || (bill as any)?.totals || {};
  const {
    subTotal,
    gstPercent,
    taxType,
    igstTotal,
    cgstTotal,
    sgstTotal,
    discountPercent,
    totalBeforeDiscount,
    discountAmount,
    grandTotal,
  } = getBillInvoiceBreakdown(bill, items, totals);
  const summaryRows = [
    { label: "SUB TOTAL", value: formatBillCurrency(subTotal) },
    { label: "GST (%)", value: `${gstPercent}%` },
    ...(taxType === "IGST"
      ? [{ label: "IGST", value: formatBillCurrency(igstTotal) }]
      : [
          { label: "CGST", value: formatBillCurrency(cgstTotal) },
          { label: "SGST", value: formatBillCurrency(sgstTotal) },
        ]),
    { label: "TOTAL AMOUNT", value: formatBillCurrency(totalBeforeDiscount) },
    { label: "DISCOUNT (%)", value: `${discountPercent}%` },
    { label: "DISCOUNT AMOUNT", value: formatBillCurrency(discountAmount) },
  ];

  useEffect(() => {
    setIsLogoVisible(true);
  }, [logoUrl]);

  useEffect(() => {
    setIsSignatureVisible(true);
  }, [signatureUrl]);

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current || !bill) return;
    const html2pdf = (await import("html2pdf.js")).default;
    setIsPreparingPdf(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `${bill.billNo || "invoice"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css"] },
        } as any)
        .from(printRef.current)
        .save();
    } finally {
      setIsPreparingPdf(false);
    }
  }, [bill]);

  useEffect(() => {
    const shouldAutoDownload =
      new URLSearchParams(location.search).get("download") === "1";

    if (!shouldAutoDownload || !data || autoDownloadTriggered.current) {
      return;
    }

    autoDownloadTriggered.current = true;
    void handleDownloadPdf();
  }, [location.search, data, handleDownloadPdf]);

  if (!isValidBillId) {
    return (
      <Card>
        <Typography.Text type="danger">Invalid bill link. Please open the bill from billing list.</Typography.Text>
      </Card>
    );
  }

  if (isLoading) return <DotLoading text="Loading invoice details..." fullHeight={320} />;
  if (isError) {
    const errorMessage =
      (error as any)?.response?.data?.message ||
      (error as any)?.message ||
      "Failed to load bill details.";
    return (
      <Card>
        <Typography.Text type="danger">{errorMessage}</Typography.Text>
      </Card>
    );
  }
  if (!data || !bill) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: INVOICE_COLORS.textStrong, fontWeight: 700 }}>
            Invoice Details
          </Typography.Title>
          <Typography.Text type="secondary">Professional bill view for medical billing records</Typography.Text>
        </div>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => id && navigate(ROUTES.BILL_EDIT.replace(":id", id))}
          >
            Edit Bill
          </Button>
          <Button type="primary" icon={<FilePdfOutlined />} onClick={handleDownloadPdf}>
            Download PDF
          </Button>
        </Space>
      </div>

      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: 0, overflow: "hidden" } }}>
        <div
          ref={printRef}
          style={{
            width: isPreparingPdf ? "209mm" : "100%",
            maxWidth: isPreparingPdf ? "209mm" : 980,
            minHeight: isPreparingPdf ? "296mm" : undefined,
            height: isPreparingPdf ? "296mm" : "auto",
            margin: "0 auto",
            boxSizing: "border-box",
            fontFamily: "Inter, Poppins, Roboto, 'Segoe UI', sans-serif",
            lineHeight: 1.5,
            letterSpacing: 0.2,
            color: INVOICE_COLORS.textBody,
            background: INVOICE_COLORS.surfaceBg,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: compactPreview ? 12 : 18,
                background: INVOICE_COLORS.accent,
              }}
            />

            <div
              style={{
                padding: compactPreview ? "16px 12px 0 20px" : "24px 24px 0 34px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: compactPreview ? "1fr" : "minmax(0, 1.15fr) minmax(0, 0.85fr)",
                  gap: compactPreview ? 14 : 24,
                  alignItems: "start",
                }}
              >
              <div style={{ minWidth: 0 }}>
                <Typography.Text style={{ display: "block", fontWeight: 700, fontSize: 24, color: INVOICE_COLORS.textStrong }}>
                  INVOICE
                </Typography.Text>
                <div
                  style={{
                    width: 180,
                    height: 2,
                    background: INVOICE_COLORS.accent,
                    margin: "6px 0 14px",
                  }}
                />
                <Typography.Text style={{ display: "block", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                  INVOICE TO:
                </Typography.Text>
                <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textStrong, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {userMedicalName}
                </Typography.Text>
                <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted }}>Phone: {userPhone}</Typography.Text>
                <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted }}>Address: {userAddress}</Typography.Text>
                <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted }}>GST Number: {userGstNumber}</Typography.Text>
                <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted }}>PAN Card Number: {userPanCardNumber}</Typography.Text>
              </div>

                <div style={{ width: "100%", minWidth: 0 }}>
                  <div
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: INVOICE_COLORS.accent,
                      color: INVOICE_COLORS.white,
                      border: "none",
                      borderRadius: 8,
                      boxShadow: "0 10px 20px rgba(15, 23, 42, 0.2)",
                      padding: "11px 12px",
                      marginBottom: 12,
                    }}
                  >
                    <Typography.Text style={{ display: "block", color: INVOICE_COLORS.white, fontSize: 12, fontWeight: 600 }}>
                      {companyPhone}
                    </Typography.Text>
                    <Typography.Text style={{ display: "block", color: "rgba(255,255,255,0.95)", fontSize: 12, marginTop: 2 }}>
                    {companyEmail}
                  </Typography.Text>
                    <Typography.Text style={{ display: "block", color: "rgba(255,255,255,0.92)", fontSize: 12, marginTop: 2 }}>
                    {companyAddress}
                  </Typography.Text>
                </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    {shouldShowLogo && (
                        <img
                        src={logoUrl}
                      alt="Company Logo"
                      style={{ width: 84, height: 84, objectFit: "contain", background: INVOICE_COLORS.white, padding: 6, border: `1px solid ${INVOICE_COLORS.border}` }}
                      onError={() => setIsLogoVisible(false)}
                    />
                  )}
                  <div>
                    <Typography.Text style={{ display: "block", fontWeight: 700, color: INVOICE_COLORS.textStrong }}>{companyName}</Typography.Text>
                    <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted, fontSize: 12 }}>
                      GST: {companyGst}
                    </Typography.Text>
                    <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted, fontSize: 12 }}>
                      Bill No: {bill.billNo || "-"}
                    </Typography.Text>
                    <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted, fontSize: 12 }}>
                      Date & Time: {formatDateTime(bill.createdAt)}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24, overflowX: compactPreview ? "auto" : "visible" }}>
              <table
                style={{
                  width: "100%",
                  minWidth: compactPreview ? 620 : "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                  border: `1px solid ${INVOICE_COLORS.border}`,
                }}
              >
                <thead>
                  <tr style={{ background: INVOICE_COLORS.accent }}>
                    <th style={{ color: INVOICE_COLORS.white, textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>DESCRIPTION</th>
                    <th style={{ color: INVOICE_COLORS.white, textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>QTY</th>
                    <th style={{ color: INVOICE_COLORS.white, textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>UNIT PRICE</th>
                    <th style={{ color: INVOICE_COLORS.white, textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>LINE TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => {
                    const category =
                      String(item?.category || (typeof item?.productId === "object" ? item?.productId?.category : "") || "").trim();

                    return (
                      <tr
                          key={item._id || index}
                          style={{
                            borderBottom: `1px solid ${INVOICE_COLORS.border}`,
                            background: index % 2 === 0 ? INVOICE_COLORS.white : "#f8fafc",
                          }}
                        >
                        <td style={{ padding: "11px 12px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span>{item.productName || "-"}</span>
                            {category ? <span style={{ color: INVOICE_COLORS.textMuted, fontSize: 11 }}>Category: {category}</span> : null}
                          </div>
                        </td>
                        <td style={{ padding: "11px 12px", textAlign: "right" }}>{Number(item.qty || 0)}</td>
                        <td style={{ padding: "11px 12px", textAlign: "right" }}>
                          {formatBillCurrency(Number(item.rate || 0))}
                        </td>
                        <td style={{ padding: "11px 12px", textAlign: "right", fontWeight: 600 }}>
                          {formatBillCurrency(Number(item.rate || 0) * Number(item.qty || 0))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: "auto",
                paddingTop: 16,
                display: "grid",
                gridTemplateColumns: compactPreview ? "1fr" : "1fr 280px",
                gap: compactPreview ? 14 : 22,
                minHeight: 120,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <Typography.Text style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
                  TERMS AND CONDITIONS
                </Typography.Text>
                <Typography.Text style={{ display: "block", color: INVOICE_COLORS.textMuted, fontSize: 12 }}>
                  Goods once sold will not be taken back. Keep this invoice for claim and audit.
                </Typography.Text>
              </div>

              <div>
                <div
                  style={{
                    background: INVOICE_COLORS.accent,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  {summaryRows.map((row, index, arr) => (
                    <div
                      key={row.label}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.15fr 1fr",
                          borderBottom: index < arr.length - 1 ? "1px solid rgba(255,255,255,0.18)" : "none",
                        }}
                      >
                      <div
                        style={{
                          color: INVOICE_COLORS.white,
                          padding: "10px 12px",
                          fontSize: 12,
                          minHeight: 42,
                          display: "flex",
                          alignItems: "center",
                          letterSpacing: 0.2,
                        }}
                      >
                        {row.label}
                      </div>
                      <div
                        style={{
                          color: INVOICE_COLORS.white,
                          padding: "10px 12px",
                          fontSize: 12,
                          minHeight: 42,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                          borderLeft: "1px solid rgba(255,255,255,0.18)",
                        }}
                      >
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, borderTop: `1px solid ${INVOICE_COLORS.border}`, paddingTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography.Text style={{ fontWeight: 700, fontSize: 13, color: INVOICE_COLORS.textStrong }}>GRAND TOTAL</Typography.Text>
                    <Typography.Text style={{ fontWeight: 800, fontSize: 16, color: INVOICE_COLORS.accent }}>
                      {formatBillCurrency(grandTotal)}
                    </Typography.Text>
                  </div>
                </div>

                <div style={{ marginTop: compactPreview ? 16 : 30, textAlign: "center" }}>
                  {shouldShowSignature ? (
                    <img
                      src={signatureUrl}
                      alt="Signature"
                      style={{ maxHeight: 58, maxWidth: "75%", objectFit: "contain", marginBottom: 6 }}
                      onError={() => setIsSignatureVisible(false)}
                    />
                  ) : null}
                  <div style={{ borderTop: `1px solid ${INVOICE_COLORS.border}`, width: "80%", margin: "0 auto 10px" }} />
                  <Typography.Text style={{ color: INVOICE_COLORS.textMuted, fontSize: 12 }}>SIGNATURE</Typography.Text>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 8,
              background: INVOICE_COLORS.accent,
              color: INVOICE_COLORS.white,
              padding: compactPreview ? "10px 12px 10px 20px" : "12px 24px 12px 34px",
            }}
          >
            <Typography.Text style={{ display: "block", color: INVOICE_COLORS.white, fontWeight: 600 }}>
              Thank you for your business.
            </Typography.Text>
            <Typography.Text style={{ color: "rgba(255,255,255,0.88)", fontSize: 12 }}>
              This is a computer generated medical invoice.
            </Typography.Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
