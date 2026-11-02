import { useRef, useState } from 'react';
import {
  Download,
  Printer,
  CheckCircle2,
  Building2,
  Calendar,
  User,
  CreditCard,
  ShieldCheck,
  FileText,
  Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { StudentFeeInvoice, StudentProfile } from '@/types/student';

export function generateInvoicePdf(invoice: StudentFeeInvoice, profile: StudentProfile) {
  const hostel = profile.hostelInfo;
  const isPaid = invoice.status === 'PAID';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Top header banner
  doc.setFillColor(30, 58, 138); // Deep Navy (#1E3A8A)
  doc.rect(0, 0, 210, 26, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text((hostel.name || 'HOSTEL OS RESIDENCE').toUpperCase(), 15, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  doc.text('HOSTEL OS • OFFICIAL STUDENT RESIDENTIAL FEE INVOICE', 15, 18);

  // Right banner info (Invoice Ref & Status)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.invoiceReference, 195, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(224, 231, 255);
  doc.text(`Status: ${invoice.status}`, 195, 18, { align: 'right' });

  // Subheader: Hostel Contact & Dates
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${hostel.address || 'Hostel Campus'}, ${hostel.city || ''}`, 15, 33);
  doc.text(`Helpline: ${hostel.contactPhone || 'N/A'}   |   Email: ${hostel.contactEmail || 'N/A'}`, 15, 38);

  doc.text(
    `Issue Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}   |   Due Date: ${invoice.dueDate}`,
    195,
    33,
    { align: 'right' }
  );

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 43, 195, 43);

  // Two Blocks: Resident Details & Accommodation
  // Left Box - Billed To
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 47, 86, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 47, 86, 38, 2, 2, 'S');

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO (RESIDENT)', 19, 53);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.name, 19, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student Code: ${profile.studentCode}`, 19, 66);
  doc.text(`Phone: ${profile.phone}`, 19, 72);
  doc.text(`Email: ${profile.email}`, 19, 78);

  // Right Box - Accommodation
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(109, 47, 86, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(109, 47, 86, 38, 2, 2, 'S');

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOMMODATION DETAILS', 113, 53);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Room ${profile.roomDetails.roomNumber} (${profile.roomDetails.bedNumber})`, 113, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Floor: ${profile.roomDetails.floor}   |   Wing: ${profile.roomDetails.wing || 'Main Wing'}`, 113, 66);
  doc.text(`Room Type: ${profile.roomDetails.roomType}`, 113, 72);
  doc.text(`Warden Desk: ${hostel.wardenName || 'Chief Warden'}`, 113, 78);

  // Line Item Table
  const tableY = 93;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, tableY, 180, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(15, tableY + 8, 195, tableY + 8);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 19, tableY + 5.5);
  doc.text('CATEGORY', 88, tableY + 5.5);
  doc.text('BILLING PERIOD', 128, tableY + 5.5);
  doc.text('AMOUNT (INR)', 191, tableY + 5.5, { align: 'right' });

  // Table Row Content
  const rowY = tableY + 16;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Hostel Accommodation & Resident Facilities', 19, rowY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(37, 99, 235);
  doc.text(`${invoice.feeCategory} Fee`, 88, rowY);

  doc.setTextColor(71, 85, 105);
  doc.text(invoice.billingPeriod, 128, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${invoice.totalAmount.toLocaleString('en-IN')}`, 191, rowY, { align: 'right' });

  doc.setDrawColor(241, 245, 249);
  doc.line(15, rowY + 6, 195, rowY + 6);

  // Status Badge on Left
  const badgeY = 124;
  if (isPaid) {
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(15, badgeY, 54, 20, 2, 2, 'F');
    doc.setDrawColor(134, 239, 172);
    doc.roundedRect(15, badgeY, 54, 20, 2, 2, 'S');
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS: PAID', 42, badgeY + 8, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Confirmed', 42, badgeY + 14, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(15, badgeY, 54, 20, 2, 2, 'F');
    doc.setDrawColor(251, 191, 36);
    doc.roundedRect(15, badgeY, 54, 20, 2, 2, 'S');
    doc.setTextColor(180, 83, 9);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`STATUS: ${invoice.status}`, 42, badgeY + 8, { align: 'center' });
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Due: ${invoice.dueDate}`, 42, badgeY + 14, { align: 'center' });
  }

  // Totals Box on Right
  const totalsY = 124;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', 125, totalsY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Rs. ${invoice.totalAmount.toLocaleString('en-IN')}`, 191, totalsY + 4, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 163, 74);
  doc.text('Amount Paid:', 125, totalsY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${invoice.paidAmount.toLocaleString('en-IN')}`, 191, totalsY + 10, { align: 'right' });

  doc.setDrawColor(203, 213, 225);
  doc.line(125, totalsY + 14, 195, totalsY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(
    invoice.remainingBalance > 0 ? 217 : 22,
    invoice.remainingBalance > 0 ? 119 : 163,
    invoice.remainingBalance > 0 ? 6 : 74
  );
  doc.text('Remaining Due:', 125, totalsY + 20);
  doc.text(`Rs. ${invoice.remainingBalance.toLocaleString('en-IN')}`, 191, totalsY + 20, {
    align: 'right',
  });

  // Security Verification Footer
  const footerY = 168;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, footerY, 195, footerY);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'This is an authentic computer-generated official student fee invoice issued securely through Hostel OS.',
    105,
    footerY + 6,
    { align: 'center' }
  );
  doc.text(
    `For billing questions or adjustment requests, email ${hostel.contactEmail}.`,
    105,
    footerY + 11,
    { align: 'center' }
  );
  doc.text(
    `Generated on: ${new Date().toLocaleString('en-IN')}   •   Hostel OS Cloud SaaS Platform`,
    105,
    footerY + 16,
    { align: 'center' }
  );

  doc.save(`Invoice-${invoice.invoiceReference}.pdf`);
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: StudentFeeInvoice | null;
  profile: StudentProfile | null;
}

export function InvoiceModal({
  isOpen,
  onClose,
  invoice,
  profile,
}: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!invoice || !profile) return null;

  const hostel = profile.hostelInfo;
  const isPaid = invoice.status === 'PAID';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      generateInvoicePdf(invoice, profile);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.invoiceReference}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .brand h1 { margin: 0; font-size: 24px; color: #1e3a8a; }
    .brand p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
    .inv-details { text-align: right; }
    .inv-details h2 { margin: 0; font-size: 20px; color: #0f172a; }
    .inv-details p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; margin-top: 6px; }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-unpaid { background: #fef3c7; color: #b45309; }
    .meta-grid { display: flex; justify-content: space-between; margin: 30px 0; background: #f8fafc; padding: 20px; border-radius: 12px; }
    .meta-col h4 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; color: #94a3b8; }
    .meta-col p { margin: 3px 0; font-size: 13px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 12px; color: #475569; text-transform: uppercase; }
    td { padding: 14px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .totals { margin-top: 20px; margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .totals-grand { font-size: 16px; font-weight: bold; border-top: 2px solid #cbd5e1; padding-top: 10px; margin-top: 6px; }
    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>${hostel.name}</h1>
      <p>${hostel.address}, ${hostel.city}</p>
      <p>Phone: ${hostel.contactPhone} | Email: ${hostel.contactEmail}</p>
    </div>
    <div class="inv-details">
      <h2>FEE INVOICE</h2>
      <p>Ref: <strong>${invoice.invoiceReference}</strong></p>
      <p>Due Date: <strong>${invoice.dueDate}</strong></p>
      <span class="badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}">${invoice.status}</span>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <h4>Billed To (Resident):</h4>
      <p><strong>${profile.name}</strong></p>
      <p>Student Code: ${profile.studentCode}</p>
      <p>Room: ${profile.roomDetails.roomNumber} (${profile.roomDetails.bedNumber})</p>
      <p>Contact: ${profile.phone}</p>
    </div>
    <div class="meta-col">
      <h4>Accommodation Details:</h4>
      <p>Wing: ${profile.roomDetails.wing || 'East Wing'}</p>
      <p>Building: ${profile.roomDetails.building || 'Block Alpha'}</p>
      <p>Floor: ${profile.roomDetails.floor}</p>
      <p>Room Type: ${profile.roomDetails.roomType}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Fee Category</th>
        <th>Billing Description / Period</th>
        <th>Due Date</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>${invoice.feeCategory} FEE</strong></td>
        <td>Accommodation charges for ${invoice.billingPeriod}</td>
        <td>${invoice.dueDate}</td>
        <td style="text-align: right;">₹${invoice.totalAmount.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>₹${invoice.totalAmount.toLocaleString('en-IN')}</span>
    </div>
    <div class="totals-row">
      <span>Amount Paid:</span>
      <span style="color: #16a34a; font-weight: bold;">₹${invoice.paidAmount.toLocaleString('en-IN')}</span>
    </div>
    <div class="totals-row totals-grand">
      <span>Remaining Balance:</span>
      <span style="color: ${invoice.remainingBalance > 0 ? '#d97706' : '#16a34a'};">
        ₹${invoice.remainingBalance.toLocaleString('en-IN')}
      </span>
    </div>
  </div>

  <div class="footer">
    <p>This is a computer-generated fee invoice issued through Hostel OS.</p>
    <p>For inquiries, please contact ${hostel.contactEmail} or the chief warden's desk.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-${invoice.invoiceReference}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hostel Resident Fee Invoice"
      description={`Official digital invoice & receipt for ${invoice.invoiceReference}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Printable Invoice Paper Frame */}
        <div
          ref={printRef}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D131F] text-xs space-y-6"
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {hostel.name}
                </h3>
              </div>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {hostel.address}, {hostel.city}
              </p>
              <p className="text-[11px] text-slate-400">
                Helpline: {hostel.contactPhone} • Email: {hostel.contactEmail}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Official Document
              </span>
              <h4 className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {invoice.invoiceReference}
              </h4>
              <p className="text-[11px] text-slate-400">Due: {invoice.dueDate}</p>
              <span
                className={`mt-1.5 inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                  isPaid
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Resident Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50/70 p-4 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Billed To (Resident):
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {profile.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Student ID: <span className="font-mono font-semibold">{profile.studentCode}</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400">Phone: {profile.phone}</p>
              <p className="text-slate-500 dark:text-slate-400">Email: {profile.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Accommodation Specification:
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Room {profile.roomDetails.roomNumber} ({profile.roomDetails.bedNumber})
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Floor: {profile.roomDetails.floor} • {profile.roomDetails.wing || 'East Wing'}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Room Type: {profile.roomDetails.roomType}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Hostel Admin: {hostel.wardenName || 'Chief Warden'}
              </p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2">Fee Description</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Billing Period</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                    Hostel Accommodation & Resident Facilities
                  </td>
                  <td className="py-3 font-bold text-blue-600 dark:text-blue-400">
                    {invoice.feeCategory}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {invoice.billingPeriod}
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                    ₹{invoice.totalAmount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Totals Calculation */}
          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Invoice Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ₹{invoice.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Amount Paid:</span>
                <span className="font-bold">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Remaining Due:</span>
                <span
                  className={
                    invoice.remainingBalance > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }
                >
                  ₹{invoice.remainingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p>This is a certified digital fee invoice document generated by Hostel OS.</p>
            <p>Contact hostel management at {hostel.contactEmail} for any billing adjustments.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handlePrint} title="Print or preview via browser print dialog">
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadHtml} title="Save offline HTML copy">
              <FileText className="h-4 w-4 mr-1.5" />
              Save HTML
            </Button>
            <Button
              variant="primary"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1.5" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

