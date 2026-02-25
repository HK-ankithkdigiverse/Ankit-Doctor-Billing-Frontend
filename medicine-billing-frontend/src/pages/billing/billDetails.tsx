import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Space, Typography } from "antd";
import { EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import { ROUTES } from "../../constants";
import { useBill } from "../../hooks/useBills";
import { getCompanyDisplayName, getCompanyLogoUrl } from "../../utils/company";
import { formatDateTime } from "../../utils/dateTime";

const INVOICE_ACCENT = "#2f3f46";

const BillView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isValidBillId = !!id && /^[a-fA-F0-9]{24}$/.test(id);
  const { data, isLoading } = useBill(id!);
  const printRef = useRef<HTMLDivElement>(null);
  const autoDownloadTriggered = useRef(false);
  const bill = data?.bill;
  const items = data?.items ?? [];
  const companyName = getCompanyDisplayName(bill?.companyId) || "Company";
  const companyGst = bill?.companyId?.gstNumber || (bill?.companyId as any)?.gstNo || "-";
  const companyAddress = bill?.companyId?.address || "-";
  const companyPhone = bill?.companyId?.phone || "-";
  const companyEmail = bill?.companyId?.email || "-";
  const userName = bill?.userId?.name || (bill as any)?.createdBy?.name || "-";
  const userMedicalName =
    bill?.userId?.medicalName ||
    (bill as any)?.createdBy?.medicalName ||
    companyName ||
    userName ||
    "-";
  const userEmail = bill?.userId?.email || (bill as any)?.createdBy?.email || "-";
  const userPhone = bill?.userId?.phone || (bill as any)?.createdBy?.phone || "-";
  const userAddress = bill?.userId?.address || (bill as any)?.createdBy?.address || "-";
  const userGstNumber = bill?.userId?.gstNumber || (bill as any)?.createdBy?.gstNumber || "-";
  const userPanCardNumber = bill?.userId?.panCardNumber || (bill as any)?.createdBy?.panCardNumber || "-";
  const logoUrl = useMemo(
    () => getCompanyLogoUrl((bill?.companyId as any)?.logo || (bill?.companyId as any)?.logoUrl || (bill?.companyId as any)?.image),
    [bill?.companyId]
  );
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const shouldShowLogo = !!logoUrl && isLogoVisible;
  const subTotal = Number(bill?.subTotal || 0);
  const totalTax = Number(bill?.totalTax || 0);
  const discountAmount = Number(bill?.discount || 0);
  const totalBeforeDiscount = subTotal + totalTax;
  const grandTotal = Math.max(0, totalBeforeDiscount - discountAmount);

  useEffect(() => {
    setIsLogoVisible(true);
  }, [logoUrl]);

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current || !bill) return;
    const html2pdf = (await import("html2pdf.js")).default;

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

  if (isLoading) return <p>Loading...</p>;
  if (!data || !bill) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0, color: "#102A43", fontWeight: 700 }}>
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

      <Card style={{ borderRadius: 14 }} bodyStyle={{ padding: 0, overflow: "hidden" }}>
        <div
          ref={printRef}
          style={{
            width: "209mm",
            height: "296mm",
            margin: "0 auto",
            boxSizing: "border-box",
            fontFamily: "Inter, Poppins, Roboto, 'Segoe UI', sans-serif",
            lineHeight: 1.5,
            letterSpacing: 0.2,
            color: "#1f2937",
            background: "#f8f8f5",
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
              width: 18,
              background: INVOICE_ACCENT,
            }}
          />

          <div style={{ padding: "24px 24px 0 34px", flex: 1, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
                gap: 24,
                alignItems: "start",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Typography.Text style={{ display: "block", fontWeight: 700, fontSize: 24, color: "#1f2a30" }}>
                  INVOICE
                </Typography.Text>
                <div style={{ width: 180, height: 2, background: INVOICE_ACCENT, margin: "6px 0 14px" }} />
                <Typography.Text style={{ display: "block", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                  INVOICE TO:
                </Typography.Text>
                <Typography.Text style={{ display: "block", color: "#1f2a30", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {userMedicalName}
                </Typography.Text>
                <Typography.Text style={{ display: "block", color: "#4b5563" }}>Name: {userName}</Typography.Text>
                <Typography.Text style={{ display: "block", color: "#4b5563" }}>Email: {userEmail}</Typography.Text>
                <Typography.Text style={{ display: "block", color: "#4b5563" }}>Phone: {userPhone}</Typography.Text>
                <Typography.Text style={{ display: "block", color: "#4b5563" }}>Address: {userAddress}</Typography.Text>
                <Typography.Text style={{ display: "block", color: "#4b5563" }}>GST Number: {userGstNumber}</Typography.Text>
                <Typography.Text style={{ display: "block", color: "#4b5563" }}>PAN Card Number: {userPanCardNumber}</Typography.Text>
              </div>

              <div style={{ width: "100%" }}>
                <div style={{ background: INVOICE_ACCENT, color: "#fff", padding: "10px 12px", marginBottom: 12 }}>
                  <Typography.Text style={{ display: "block", color: "#fff", fontSize: 12 }}>
                    {companyPhone}
                  </Typography.Text>
                  <Typography.Text style={{ display: "block", color: "#fff", fontSize: 12 }}>
                    {companyEmail}
                  </Typography.Text>
                  <Typography.Text style={{ display: "block", color: "#fff", fontSize: 12 }}>
                    {companyAddress}
                  </Typography.Text>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {shouldShowLogo && (
                    <img
                      src={logoUrl}
                      alt="Company Logo"
                      style={{ width: 84, height: 84, objectFit: "contain", background: "#fff", padding: 6 }}
                      onError={() => setIsLogoVisible(false)}
                    />
                  )}
                  <div>
                    <Typography.Text style={{ display: "block", fontWeight: 700 }}>{companyName}</Typography.Text>
                    <Typography.Text style={{ display: "block", color: "#4b5563", fontSize: 12 }}>
                      GST: {companyGst}
                    </Typography.Text>
                    <Typography.Text style={{ display: "block", color: "#4b5563", fontSize: 12 }}>
                      Bill No: {bill.billNo || "-"}
                    </Typography.Text>
                    <Typography.Text style={{ display: "block", color: "#4b5563", fontSize: 12 }}>
                      Date & Time: {formatDateTime(bill.createdAt)}
                    </Typography.Text>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: INVOICE_ACCENT }}>
                    <th style={{ color: "#fff", textAlign: "left", padding: "10px 12px", fontWeight: 600 }}>DESCRIPTION</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>QTY</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>UNIT PRICE</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>GST %</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>GST AMOUNT</th>
                    <th style={{ color: "#fff", textAlign: "right", padding: "10px 12px", fontWeight: 600 }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => (
                    <tr key={item._id || index} style={{ borderBottom: "1px solid #d1d5db" }}>
                      <td style={{ padding: "11px 12px" }}>{item.productName || "-"}</td>
                      <td style={{ padding: "11px 12px", textAlign: "right" }}>{Number(item.qty || 0)}</td>
                      <td style={{ padding: "11px 12px", textAlign: "right" }}>Rs {Number(item.rate || 0).toFixed(2)}</td>
                      <td style={{ padding: "11px 12px", textAlign: "right" }}>{Number(item.taxPercent || 0).toFixed(2)}%</td>
                      <td style={{ padding: "11px 12px", textAlign: "right" }}>
                        Rs {Number((item.cgst || 0) + (item.sgst || 0)).toFixed(2)}
                      </td>
                      <td style={{ padding: "11px 12px", textAlign: "right", fontWeight: 600 }}>
                        Rs {Number(item.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "auto", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 280px", gap: 22, minHeight: 120 }}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <Typography.Text style={{ display: "block", fontWeight: 700, marginBottom: 6 }}>
                  TERMS AND CONDITIONS
                </Typography.Text>
                <Typography.Text style={{ display: "block", color: "#6b7280", fontSize: 12 }}>
                  Goods once sold will not be taken back. Keep this invoice for claim and audit.
                </Typography.Text>
              </div>

              <div>
                <div
                  style={{
                    background: INVOICE_ACCENT,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  {[
                    { label: "SUB TOTAL", value: `Rs ${Number(bill.subTotal || 0).toFixed(2)}` },
                    { label: "TAX", value: `Rs ${totalTax.toFixed(2)}` },
                    { label: "TOTAL BEFORE DISCOUNT", value: `Rs ${totalBeforeDiscount.toFixed(2)}` },
                    { label: "DISCOUNT AMOUNT", value: `- Rs ${discountAmount.toFixed(2)}` },
                  ].map((row, index, arr) => (
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
                          color: "#fff",
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
                          color: "#fff",
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

                <div style={{ marginTop: 12, borderTop: "1px solid #9ca3af", paddingTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography.Text style={{ fontWeight: 700, fontSize: 13 }}>GRAND TOTAL</Typography.Text>
                    <Typography.Text style={{ fontWeight: 800, fontSize: 16, color: "#111827" }}>
                      Rs {grandTotal.toFixed(2)}
                    </Typography.Text>
                  </div>
                </div>

                <div style={{ marginTop: 30, textAlign: "center" }}>
                  <div style={{ borderTop: "1px solid #9ca3af", width: "80%", margin: "0 auto 6px" }} />
                  <Typography.Text style={{ color: "#6b7280", fontSize: 12 }}>SIGNATURE</Typography.Text>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8, background: INVOICE_ACCENT, color: "#fff", padding: "12px 24px 12px 34px" }}>
            <Typography.Text style={{ display: "block", color: "#fff", fontWeight: 600 }}>
              Thank you for your business.
            </Typography.Text>
            <Typography.Text style={{ color: "#d1d5db", fontSize: 12 }}>
              This is a computer generated medical invoice.
            </Typography.Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BillView;
