import { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { StudentFeeInvoice, StudentProfile } from '@/types/student';
import { getInvoiceNumber } from '@/types/student';

// =========================================================================
// CLEAN & PROFESSIONAL VECTOR PDF GENERATOR (A4 PORTRAIT)
// Minimalist, Executive Financial Layout:
//   - Clean whitespace and 20mm margins
//   - Slate 900 typography (#0F172A) & Slate 500 metadata (#64748B)
//   - Subtle borders (#E2E8F0) and elegant dividers
//   - Perfectly balanced non-overlapping columns
// =========================================================================

export function generateInvoicePdf(invoice: StudentFeeInvoice, profile: StudentProfile) {
  const hostel = profile.hostelInfo;
  const invNumber = getInvoiceNumber(invoice);
  const isPaid = invoice.status === 'PAID';
  const isOverdue = invoice.status === 'OVERDUE';
  const isPartiallyPaid = invoice.status === 'PARTIALLY_PAID';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 20;
  const rightMargin = 190;
  const contentWidth = rightMargin - leftMargin; // 170mm

  let y = 24;

  // 1. Header (Left: Property / Issuer, Right: Invoice & Status)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  const propNameLines = doc.splitTextToSize(hostel.name || 'Grand Skyline Premier Hostel', 92);
  doc.text(propNameLines, leftMargin, y);

  let propTextY = y + propNameLines.length * 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate 500

  const fullAddress = `${hostel.address || 'Hostel Campus'}${hostel.city ? ', ' + hostel.city : ''}${hostel.state ? ', ' + hostel.state : ''}${hostel.pincode ? ' - ' + hostel.pincode : ''}`;
  const addressLines = doc.splitTextToSize(fullAddress, 92);
  doc.text(addressLines, leftMargin, propTextY);
  propTextY += addressLines.length * 3.8;

  doc.text(`${hostel.contactEmail || 'contact@hostelos.local'}   •   ${hostel.contactPhone || '+91 98201 12345'}`, leftMargin, propTextY);
  propTextY += 4;

  // Right Header: INVOICE title & Reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('INVOICE', rightMargin, y + 1, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`# ${invNumber}`, rightMargin, y + 7.5, { align: 'right' });

  // Status Badge Pill (Right)
  const statusW = 34;
  const statusH = 6;
  const statusX = rightMargin - statusW;
  const statusY = y + 11.5;

  if (isPaid) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(statusX, statusY, statusW, statusH, 1.5, 1.5, 'FD');
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAID', statusX + statusW / 2, statusY + 4.2, { align: 'center' });
  } else if (isOverdue) {
    doc.setFillColor(254, 242, 242); // Rose 50
    doc.setDrawColor(254, 202, 202); // Rose 200
    doc.roundedRect(statusX, statusY, statusW, statusH, 1.5, 1.5, 'FD');
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('OVERDUE', statusX + statusW / 2, statusY + 4.2, { align: 'center' });
  } else if (isPartiallyPaid) {
    doc.setFillColor(255, 251, 235); // Amber 50
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.roundedRect(statusX, statusY, statusW, statusH, 1.5, 1.5, 'FD');
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PARTIAL', statusX + statusW / 2, statusY + 4.2, { align: 'center' });
  } else {
    doc.setFillColor(255, 251, 235); // Amber 50
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.roundedRect(statusX, statusY, statusW, statusH, 1.5, 1.5, 'FD');
    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('UNPAID', statusX + statusW / 2, statusY + 4.2, { align: 'center' });
  }

  y = Math.max(propTextY, statusY + statusH) + 6;

  // Subtle Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;

  // 2. Metadata 4-Column Strip
  const colW = contentWidth / 4; // 42.5mm
  const issueDate = invoice.issueDate || invoice.createdAt || new Date().toISOString().split('T')[0];

  const metaCols = [
    { label: 'INVOICE DATE', value: issueDate },
    { label: 'DUE DATE', value: invoice.dueDate },
    { label: 'BILLING PERIOD', value: invoice.billingPeriod || 'Current Month' },
    { label: 'PAYMENT TERMS', value: 'Due on Receipt' },
  ];

  metaCols.forEach((col, idx) => {
    const cX = leftMargin + idx * colW;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(col.label, cX, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text(col.value, cX, y + 4.5);
  });

  y += 10;
  doc.setDrawColor(226, 232, 240);
  doc.line(leftMargin, y, rightMargin, y);
  y += 7;

  // 3. Billed To & Accommodation Columns
  const halfW = (contentWidth - 10) / 2; // 80mm each
  const c1X = leftMargin;
  const c2X = leftMargin + halfW + 10;

  // Left: Billed To (Student)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('BILLED TO', c1X, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(profile.name, c1X, y + 5);

  let c1Y = y + 9.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Student ID: ${profile.studentCode}`, c1X, c1Y);
  c1Y += 4;
  doc.text(profile.email, c1X, c1Y);
  c1Y += 4;
  doc.text(profile.phone, c1X, c1Y);

  // Right: Accommodation Allotment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('ACCOMMODATION ALLOTMENT', c2X, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Room ${profile.roomDetails.roomNumber} (${profile.roomDetails.bedNumber || 'Bed A'})`, c2X, y + 5);

  let c2Y = y + 9.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Floor ${profile.roomDetails.floor} • ${profile.roomDetails.wing || 'Main Wing'}`, c2X, c2Y);
  c2Y += 4;
  doc.text(`Type: ${profile.roomDetails.roomType || 'Standard Sharing'}`, c2X, c2Y);
  c2Y += 4;
  doc.text(`Property: ${hostel.name}`, c2X, c2Y);

  y = Math.max(c1Y, c2Y) + 8;

  // 4. Line Items Table (Minimalist, Professional Table)
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.4);
  doc.line(leftMargin, y, rightMargin, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DESCRIPTION', leftMargin, y);
  doc.text('CATEGORY', leftMargin + 90, y);
  doc.text('PERIOD', leftMargin + 122, y);
  doc.text('AMOUNT (INR)', rightMargin, y, { align: 'right' });

  y += 2.5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;

  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [
        {
          description: invoice.title || 'Hostel Accommodation Charges',
          category: invoice.feeCategory,
          billingPeriod: invoice.billingPeriod || 'Current Month',
          amount: invoice.totalAmount,
        },
      ];

  items.forEach((item) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const descLines = doc.splitTextToSize(item.description, 85);
    doc.text(descLines, leftMargin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.category} Fee`, leftMargin + 90, y);
    doc.text(item.billingPeriod, leftMargin + 122, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`INR ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightMargin, y, { align: 'right' });

    y += Math.max(descLines.length * 4.2, 7);
    doc.setDrawColor(241, 245, 249);
    doc.line(leftMargin, y, rightMargin, y);
    y += 4;
  });

  y += 2;

  // 5. Financial Summary (Right-aligned)
  const sumW = 75;
  const sumX = rightMargin - sumW;
  const subtotal = invoice.subtotal || invoice.totalAmount;
  const additional = invoice.additionalCharges || 0;
  const discounts = invoice.discounts || 0;

  const renderRow = (label: string, val: string, isBold = false, color: number[] = [15, 23, 42]) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(label, sumX, y);

    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(val, rightMargin, y, { align: 'right' });
    y += 5;
  };

  renderRow('Subtotal', `INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  if (additional > 0) renderRow('Additional Charges', `INR ${additional.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  if (discounts > 0) renderRow('Discount Applied', `- INR ${discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, false, [5, 150, 105]);

  doc.setDrawColor(226, 232, 240);
  doc.line(sumX, y, rightMargin, y);
  y += 3;

  renderRow('Total Amount', `INR ${invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true, [15, 23, 42]);
  renderRow('Amount Paid', `INR ${invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, false, [5, 150, 105]);

  // Balance Due Card
  y += 1;
  const balBoxH = 9;
  if (invoice.remainingBalance > 0) {
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.roundedRect(sumX, y, sumW, balBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14);
    doc.text('Balance Due:', sumX + 3, y + 5.8);
    doc.setFontSize(8.8);
    doc.text(`INR ${invoice.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightMargin - 3, y + 5.8, { align: 'right' });
  } else {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(167, 243, 208);
    doc.roundedRect(sumX, y, sumW, balBoxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70);
    doc.text('Balance Due:', sumX + 3, y + 5.8);
    doc.setFontSize(8.8);
    doc.text('INR 0.00 (Paid)', rightMargin - 3, y + 5.8, { align: 'right' });
  }

  y += balBoxH + 10;

  // 6. Payment History (Clean & Minimalist)
  const payments = invoice.paymentHistory || [];
  if (payments.length > 0 || invoice.paidAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('PAYMENT TRANSACTIONS', leftMargin, y);
    y += 2.5;

    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, y, rightMargin, y);
    y += 4.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('REFERENCE', leftMargin, y);
    doc.text('TRANSACTION ID', leftMargin + 38, y);
    doc.text('DATE', leftMargin + 85, y);
    doc.text('METHOD', leftMargin + 115, y);
    doc.text('STATUS', leftMargin + 140, y);
    doc.text('AMOUNT', rightMargin, y, { align: 'right' });
    y += 2.5;

    doc.setDrawColor(241, 245, 249);
    doc.line(leftMargin, y, rightMargin, y);
    y += 4;

    const txns = payments.length > 0
      ? payments
      : [
          {
            paymentReference: 'PAY-DIRECT',
            transactionRef: `TXN-${invNumber}`,
            paymentDate: issueDate,
            paymentMode: 'Online UPI',
            status: 'SUCCESS',
            amount: invoice.paidAmount,
          },
        ];

    txns.forEach((p) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(p.paymentReference || 'N/A', leftMargin, y);
      doc.text(p.transactionRef || 'N/A', leftMargin + 38, y);
      doc.text(p.paymentDate || 'N/A', leftMargin + 85, y);
      doc.text(p.paymentMode || 'UPI', leftMargin + 115, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(p.status || 'SUCCESS', leftMargin + 140, y);

      doc.setTextColor(15, 23, 42);
      doc.text(`INR ${p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightMargin, y, { align: 'right' });
      y += 5;
    });
  }

  // 7. Footer
  const footerY = 278;
  doc.setDrawColor(226, 232, 240);
  doc.line(leftMargin, footerY, rightMargin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Thank you for staying with ${hostel.name}. For billing inquiries, contact ${hostel.contactEmail} or ${hostel.contactPhone}.`, leftMargin, footerY + 5);
  doc.text(`Invoice # ${invNumber}  •  Page 1 of 1`, rightMargin, footerY + 5, { align: 'right' });

  // Download with required exact filename
  doc.save(`HostelOS_${invNumber}.pdf`);
}

// =========================================================================
// CLEAN & PROFESSIONAL ON-SCREEN INVOICE MODAL
// =========================================================================

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
  const [copiedInvoiceNumber, setCopiedInvoiceNumber] = useState(false);

  if (!invoice || !profile) return null;

  const hostel = profile.hostelInfo;
  const invNumber = getInvoiceNumber(invoice);
  const isPaid = invoice.status === 'PAID';
  const isPartiallyPaid = invoice.status === 'PARTIALLY_PAID';
  const isOverdue = invoice.status === 'OVERDUE';
  const issueDate = invoice.issueDate || invoice.createdAt || new Date().toISOString().split('T')[0];

  const subtotal = invoice.subtotal || invoice.totalAmount;
  const additional = invoice.additionalCharges || 0;
  const discounts = invoice.discounts || 0;
  const payments = invoice.paymentHistory || [];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(invNumber);
    setCopiedInvoiceNumber(true);
    setTimeout(() => setCopiedInvoiceNumber(false), 2000);
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Details"
      description={`Official resident billing statement • #${invNumber}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Document Sheet */}
        <div
          ref={printRef}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-[#0F172A]"
        >
          {/* 1. Header (Property Left, Invoice Title Right) */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {hostel.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {hostel.address}, {hostel.city}{hostel.state ? `, ${hostel.state}` : ''}{hostel.pincode ? ` - ${hostel.pincode}` : ''}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                {hostel.contactEmail} • {hostel.contactPhone}
              </p>
            </div>

            <div className="sm:text-right space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                INVOICE
              </h2>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                  #{invNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer transition-colors"
                  title="Copy invoice number"
                >
                  {copiedInvoiceNumber ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="pt-1">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    <span>PAID</span>
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    <span>OVERDUE</span>
                  </span>
                ) : isPartiallyPaid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                    <span>PARTIAL</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                    <span>UNPAID</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Invoice Date
              </span>
              <span className="mt-0.5 block font-medium text-slate-800 dark:text-slate-200">
                {issueDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Due Date
              </span>
              <span className="mt-0.5 block font-medium text-slate-800 dark:text-slate-200">
                {invoice.dueDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Billing Cycle
              </span>
              <span className="mt-0.5 block font-medium text-slate-800 dark:text-slate-200">
                {invoice.billingPeriod || 'Current Month'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Terms
              </span>
              <span className="mt-0.5 block font-medium text-slate-800 dark:text-slate-200">
                Due on Receipt
              </span>
            </div>
          </div>

          {/* 3. Billed To & Accommodation (2 Open Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Billed To
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Student ID: <span className="font-mono font-medium">{profile.studentCode}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
              <p className="text-slate-600 dark:text-slate-400">{profile.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Accommodation Allotment
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Room {profile.roomDetails.roomNumber} ({profile.roomDetails.bedNumber || 'Bed A'})
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Floor {profile.roomDetails.floor} • {profile.roomDetails.wing || 'Main Wing'}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Type: {profile.roomDetails.roomType || 'Standard Sharing'}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Hostel: {hostel.name}
              </p>
            </div>
          </div>

          {/* 4. Line Items Table */}
          <div className="py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 pb-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:border-slate-700">
                    <th className="pb-3 font-semibold whitespace-nowrap">Description</th>
                    <th className="pb-3 font-semibold whitespace-nowrap">Category</th>
                    <th className="pb-3 font-semibold whitespace-nowrap">Period</th>
                    <th className="pb-3 font-semibold text-right whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(invoice.items && invoice.items.length > 0
                    ? invoice.items
                    : [
                        {
                          description: invoice.title || 'Hostel Accommodation Charges',
                          category: invoice.feeCategory,
                          billingPeriod: invoice.billingPeriod || 'Current Month',
                          amount: invoice.totalAmount,
                        },
                      ]
                  ).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3.5 pr-4 font-medium text-slate-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.category} Fee
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {item.billingPeriod}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Summary Totals */}
          <div className="flex justify-end pt-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {additional > 0 && (
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Additional Charges</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    ₹{additional.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {discounts > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount Applied</span>
                  <span className="font-medium">
                    - ₹{discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm">Total Amount</span>
                <span className="text-base">
                  ₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Amount Paid</span>
                <span>₹{invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div
                className={`flex justify-between items-center rounded-lg p-2.5 font-bold ${
                  invoice.remainingBalance > 0
                    ? 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50'
                }`}
              >
                <span>Balance Due</span>
                <span className="text-sm">
                  {invoice.remainingBalance > 0
                    ? `₹${invoice.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    : '₹0.00 (Paid)'}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Payment History (Clean List) */}
          {(payments.length > 0 || invoice.paidAmount > 0) && (
            <div className="py-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Payment Transactions
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 pb-2 text-[10px] uppercase font-bold text-slate-400 dark:border-slate-700">
                      <th className="pb-2 font-semibold whitespace-nowrap">Reference</th>
                      <th className="pb-2 font-semibold whitespace-nowrap">Transaction ID</th>
                      <th className="pb-2 font-semibold whitespace-nowrap">Date</th>
                      <th className="pb-2 font-semibold whitespace-nowrap">Method</th>
                      <th className="pb-2 font-semibold whitespace-nowrap">Status</th>
                      <th className="pb-2 font-semibold text-right whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.length > 0 ? (
                      payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {p.paymentReference}
                          </td>
                          <td className="py-2.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {p.transactionRef}
                          </td>
                          <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {p.paymentDate}
                          </td>
                          <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {p.paymentMode}
                          </td>
                          <td className="py-2.5 whitespace-nowrap">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-2.5 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          PAY-DIRECT
                        </td>
                        <td className="py-2.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          TXN-{invNumber}
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {issueDate}
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          Online UPI
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            SUCCESS
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          ₹{invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. Footer */}
          <div className="pt-6 text-center text-xs text-slate-400 space-y-1">
            <p>Thank you for staying with {hostel.name}.</p>
            <p className="text-[11px]">
              For any billing inquiries, please contact {hostel.contactEmail} or call {hostel.contactPhone}.
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" onClick={handlePrint} title="Print invoice">
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
            <Button
              variant="primary"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Downloading...
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

export default InvoiceModal;