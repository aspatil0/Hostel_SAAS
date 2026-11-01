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
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  Receipt,
  GraduationCap,
  Sparkles,
  BedDouble,
  Copy,
  Check,
  HelpCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { StudentFeeInvoice, StudentProfile, PaymentReceipt } from '@/types/student';
import { getInvoiceNumber } from '@/types/student';

// =========================================================================
// EXECUTIVE VECTOR PDF GENERATOR (A4 PORTRAIT)
// Aligned with Hostel OS Theme:
//   - Deep Midnight Navy: #0D1F36 (RGB 13, 31, 54)
//   - Charcoal Navy Typography: #172B45 (RGB 23, 43, 69)
//   - Electric Royal Blue Accent: #2563EB (RGB 37, 99, 235)
//   - Slate Card Surface: #F8FAFC (RGB 248, 250, 252)
//   - Crisp Slate Borders: #E2E8F0 (RGB 226, 232, 240)
// =========================================================================

export function generateInvoicePdf(invoice: StudentFeeInvoice, profile: StudentProfile) {
  const hostel = profile.hostelInfo;
  const invNumber = getInvoiceNumber(invoice);
  const isPaid = invoice.status === 'PAID';
  const isPartiallyPaid = invoice.status === 'PARTIALLY_PAID';
  const isOverdue = invoice.status === 'OVERDUE';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 15;
  const rightMargin = 195;
  const contentWidth = rightMargin - leftMargin; // 180mm

  // 1. Signature Top Brand Band (Deep Midnight Navy with Royal Blue Stripe)
  doc.setFillColor(13, 31, 54); // #0D1F36 Deep Midnight Navy
  doc.rect(0, 0, pageWidth, 5.5, 'F');
  doc.setFillColor(37, 99, 235); // #2563EB Royal Blue Accent Stripe
  doc.rect(0, 5.5, pageWidth, 1.2, 'F');

  let y = 14;

  // 2. Header Brand Crest & Property Identity (Left)
  // High-contrast Corporate Emblem Box
  doc.setFillColor(13, 31, 54);
  doc.roundedRect(leftMargin, y, 12, 12, 2.5, 2.5, 'F');

  // Emblem inner decorative accent
  doc.setFillColor(37, 99, 235);
  doc.rect(leftMargin + 2, y + 2, 8, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('HOS', leftMargin + 2.2, y + 8.5);

  // Platform Brand Title
  doc.setTextColor(13, 31, 54); // Deep Navy
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Hostel OS', leftMargin + 15, y + 5.5);

  doc.setTextColor(37, 99, 235); // Royal Blue
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('ENTERPRISE RESIDENCE & PROPERTY SUITE', leftMargin + 15, y + 9.8);

  // 3. Document Title & Invoice Number Box (Right)
  doc.setTextColor(13, 31, 54);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('FEE INVOICE', rightMargin, y + 6, { align: 'right' });

  doc.setTextColor(100, 116, 139); // Slate 500
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('OFFICIAL RESIDENT BILLING STATEMENT', rightMargin, y + 10.5, { align: 'right' });

  // Dedicated Invoice Number Badge (Right)
  const invBoxWidth = 64;
  const invBoxX = rightMargin - invBoxWidth;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(invBoxX, y + 13, invBoxWidth, 6.8, 1.8, 1.8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(23, 43, 69); // Charcoal Navy
  doc.text(`INVOICE NO: ${invNumber}`, invBoxX + invBoxWidth / 2, y + 17.5, { align: 'center' });

  // Status Badge Pill (Right, below invoice number box)
  const statusWidth = 46;
  const statusX = rightMargin - statusWidth;
  const statusY = y + 21.5;

  if (isPaid) {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(statusX, statusY, statusWidth, 5.8, 2.9, 2.9, 'FD');
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('● PAID IN FULL', statusX + statusWidth / 2, statusY + 4.2, { align: 'center' });
  } else if (isOverdue) {
    doc.setFillColor(254, 242, 242); // Rose 50
    doc.setDrawColor(254, 202, 202); // Rose 200
    doc.roundedRect(statusX, statusY, statusWidth, 5.8, 2.9, 2.9, 'FD');
    doc.setTextColor(220, 38, 38); // Rose 600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('● OVERDUE', statusX + statusWidth / 2, statusY + 4.2, { align: 'center' });
  } else if (isPartiallyPaid) {
    doc.setFillColor(255, 251, 235); // Amber 50
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.roundedRect(statusX, statusY, statusWidth, 5.8, 2.9, 2.9, 'FD');
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('● PARTIALLY PAID', statusX + statusWidth / 2, statusY + 4.2, { align: 'center' });
  } else {
    doc.setFillColor(255, 251, 235); // Amber 50
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.roundedRect(statusX, statusY, statusWidth, 5.8, 2.9, 2.9, 'FD');
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('● PAYMENT PENDING', statusX + statusWidth / 2, statusY + 4.2, { align: 'center' });
  }

  // Property Details (Left, below brand)
  let propY = y + 16.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(23, 43, 69);
  const propNameLines = doc.splitTextToSize(hostel.name || 'Grand Skyline Premier Hostel', 94);
  doc.text(propNameLines, leftMargin, propY);

  propY += propNameLines.length * 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(100, 116, 139);

  const fullAddress = `${hostel.address || 'Opp. University Gate'}${hostel.city ? ', ' + hostel.city : ''}${hostel.state ? ', ' + hostel.state : ''}${hostel.pincode ? ' - ' + hostel.pincode : ''}`;
  const addressLines = doc.splitTextToSize(fullAddress, 94);
  doc.text(addressLines, leftMargin, propY);
  propY += addressLines.length * 3.6;

  doc.text(`Helpline: ${hostel.contactPhone || '+91 98201 12345'}   •   Email: ${hostel.contactEmail || 'contact@hostelos.local'}`, leftMargin, propY);
  propY += 4.5;

  y = Math.max(propY, statusY + 9);

  // 4. Structured 4-Column Metadata Banner
  const metaBarY = y;
  const metaHeight = 12.5;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(leftMargin, metaBarY, contentWidth, metaHeight, 2, 2, 'FD');

  const colW = contentWidth / 4; // 45mm each
  const issueDate = invoice.issueDate || invoice.createdAt || new Date().toISOString().split('T')[0];

  const metaColumns = [
    { label: 'DATE OF ISSUE', value: issueDate },
    { label: 'PAYMENT DUE DATE', value: invoice.dueDate },
    { label: 'BILLING CYCLE', value: invoice.billingPeriod || 'Current Month' },
    { label: 'CURRENCY & JURISDICTION', value: 'INR (Indian Rupee)' },
  ];

  metaColumns.forEach((col, idx) => {
    const colX = leftMargin + idx * colW;
    // Draw vertical divider between columns
    if (idx > 0) {
      doc.setDrawColor(226, 232, 240);
      doc.line(colX, metaBarY + 1.5, colX, metaBarY + metaHeight - 1.5);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(col.label, colX + 4, metaBarY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(23, 43, 69); // Charcoal Navy
    doc.text(col.value, colX + 4, metaBarY + 9.5);
  });

  y = metaBarY + metaHeight + 6;

  // 5. Resident & Accommodation Allocation Side-by-Side Cards
  const cardW = (contentWidth - 6) / 2; // 87mm each
  const cardH = 32;
  const card1X = leftMargin;
  const card2X = leftMargin + cardW + 6;

  // Card 1: Billed To (Student Resident)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card1X, y, cardW, cardH, 2, 2, 'FD');

  // Royal Blue Left Accent Stripe
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(card1X, y, 1.8, cardH, 0.9, 0.9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (STUDENT RESIDENT)', card1X + 6, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(23, 43, 69);
  const nameLines = doc.splitTextToSize(profile.name, cardW - 10);
  doc.text(nameLines, card1X + 6, y + 10.5);

  let c1TextY = y + 10.5 + nameLines.length * 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Student Code: ${profile.studentCode}`, card1X + 6, c1TextY);
  c1TextY += 3.8;
  doc.text(`Registered Email: ${profile.email}`, card1X + 6, c1TextY);
  c1TextY += 3.8;
  doc.text(`Contact Phone: ${profile.phone}`, card1X + 6, c1TextY);

  // Card 2: Accommodation Allocation
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card2X, y, cardW, cardH, 2, 2, 'FD');

  // Brand Indigo Left Accent Stripe
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(card2X, y, 1.8, cardH, 0.9, 0.9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text('ACCOMMODATION ALLOTMENT', card2X + 6, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(23, 43, 69);
  doc.text(`Room ${profile.roomDetails.roomNumber} (${profile.roomDetails.bedNumber || 'Bed A'})`, card2X + 6, y + 10.5);

  let c2TextY = y + 15.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Room Specification: ${profile.roomDetails.roomType || 'Standard Sharing'}`, card2X + 6, c2TextY);
  c2TextY += 3.8;
  doc.text(`Location: Floor ${profile.roomDetails.floor} • Wing: ${profile.roomDetails.wing || 'Main Wing'}`, card2X + 6, c2TextY);
  c2TextY += 3.8;
  const shortPropName = hostel.name ? (hostel.name.length > 34 ? hostel.name.substring(0, 34) + '...' : hostel.name) : 'Campus Residence';
  doc.text(`Hostel Property: ${shortPropName}`, card2X + 6, c2TextY);

  y += cardH + 7;

  // 6. Itemized Fee Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 31, 54);
  doc.text('FEE LINE ITEMS BREAKDOWN', leftMargin, y);

  y += 3;

  // Table Header (Deep Midnight Navy #0D1F36 with crisp white typography)
  const thY = y;
  const thHeight = 7.5;
  doc.setFillColor(13, 31, 54); // Website Sidebar Midnight Navy
  doc.roundedRect(leftMargin, thY, contentWidth, thHeight, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(255, 255, 255);
  doc.text('#', leftMargin + 4, thY + 5);
  doc.text('DESCRIPTION & SPECIFICATION', leftMargin + 14, thY + 5);
  doc.text('CATEGORY', leftMargin + 96, thY + 5);
  doc.text('PERIOD', leftMargin + 128, thY + 5);
  doc.text('AMOUNT (INR)', rightMargin - 4, thY + 5, { align: 'right' });

  y = thY + thHeight;

  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [
        {
          description: invoice.title || `Hostel Accommodation & Resident Facility Charges (${profile.roomDetails.roomType})`,
          category: invoice.feeCategory,
          billingPeriod: invoice.billingPeriod || 'Current Month',
          amount: invoice.totalAmount,
        },
      ];

  items.forEach((item, idx) => {
    const isOdd = idx % 2 === 1;
    if (isOdd) {
      doc.setFillColor(248, 250, 252);
      doc.rect(leftMargin, y, contentWidth, 8, 'F');
    }

    const rowY = y + 5.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text(String(idx + 1).padStart(2, '0'), leftMargin + 4, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 43, 69);
    const descLines = doc.splitTextToSize(item.description, 78);
    doc.text(descLines, leftMargin + 14, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(37, 99, 235);
    doc.text(`${item.category} FEE`, leftMargin + 96, rowY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(71, 85, 105);
    doc.text(item.billingPeriod, leftMargin + 128, rowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(23, 43, 69);
    doc.text(`INR ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightMargin - 4, rowY, { align: 'right' });

    const calculatedHeight = Math.max(descLines.length * 4.2, 7.5);
    y += calculatedHeight + 1.2;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, y, rightMargin, y);
  });

  y += 5;

  // 7. Summary Totals Box (Right) & Institutional Policy / Verification (Left)
  const sumBoxW = 86;
  const sumBoxX = rightMargin - sumBoxW;
  const noteBoxW = contentWidth - sumBoxW - 6;

  // Left Policy & Verification Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, y, noteBoxW, 35, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(13, 31, 54);
  doc.text('PAYMENT POLICY & RESIDENT TERMS', leftMargin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  const policyText = doc.splitTextToSize(
    'Fees must be settled before the due date to ensure uninterrupted room allotment and services. Payments recorded in the digital portal immediately update property accounts.',
    noteBoxW - 10
  );
  doc.text(policyText, leftMargin + 5, y + 10.5);

  // Digital Security Stamp Box
  const stampY = y + 21;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(leftMargin + 5, stampY, noteBoxW - 10, 9, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(13, 31, 54);
  doc.text(`HOSTEL OS AUDITED DIGITAL LEDGER • ID: ${invNumber}`, leftMargin + 8, stampY + 4.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Cryptographically Verified Cloud Record • Valid Without Physical Seal', leftMargin + 8, stampY + 7.4);

  // Right Summary Rows
  let rSumY = y + 2;
  const subtotal = invoice.subtotal || invoice.totalAmount;
  const additional = invoice.additionalCharges || 0;
  const discounts = invoice.discounts || 0;

  const renderSummaryRow = (lbl: string, val: string, isBold = false, color: number[] | null = null) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text(lbl, sumBoxX + 2, rSumY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    if (color) doc.setTextColor(color[0], color[1], color[2]);
    else doc.setTextColor(23, 43, 69);
    doc.text(val, rightMargin - 2, rSumY, { align: 'right' });
    rSumY += 4.8;
  };

  renderSummaryRow('Subtotal Charges:', `INR ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  if (additional > 0) renderSummaryRow('Utility / Maintenance:', `INR ${additional.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  if (discounts > 0) renderSummaryRow('Concession Applied:', `- INR ${discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, false, [5, 150, 105]);

  doc.setDrawColor(226, 232, 240);
  doc.line(sumBoxX + 2, rSumY, rightMargin - 2, rSumY);
  rSumY += 2.5;

  renderSummaryRow('Total Invoice Amount:', `INR ${invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, true);
  renderSummaryRow('Amount Paid:', `INR ${invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, false, [5, 150, 105]);

  // Outstanding Balance Due Card
  rSumY += 1.5;
  const balHeight = 10;
  if (invoice.remainingBalance > 0) {
    doc.setFillColor(255, 251, 235); // Amber 50
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.roundedRect(sumBoxX, rSumY, sumBoxW, balHeight, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // Amber 800
    doc.text('OUTSTANDING DUE:', sumBoxX + 4, rSumY + 6.4);
    doc.setFontSize(9.5);
    doc.text(`INR ${invoice.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightMargin - 4, rSumY + 6.4, { align: 'right' });
  } else {
    doc.setFillColor(236, 253, 245); // Emerald 50
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.roundedRect(sumBoxX, rSumY, sumBoxW, balHeight, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(6, 95, 70); // Emerald 800
    doc.text('BALANCE SETTLED:', sumBoxX + 4, rSumY + 6.4);
    doc.setFontSize(9.5);
    doc.text('INR 0.00', rightMargin - 4, rSumY + 6.4, { align: 'right' });
  }

  y += 39;

  // 8. Verified Transactions Ledger (if payments exist)
  const payments = invoice.paymentHistory || [];
  if (payments.length > 0 || invoice.paidAmount > 0) {
    // Check if we need a page break before transaction records
    if (y > 235) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(13, 31, 54);
    doc.text('RECORDED TRANSACTION LEDGER', leftMargin, y);
    y += 2.8;

    doc.setFillColor(241, 245, 249);
    doc.rect(leftMargin, y, contentWidth, 5.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(leftMargin, y + 5.5, rightMargin, y + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('PAYMENT REFERENCE', leftMargin + 3, y + 3.8);
    doc.text('TRANSACTION ID', leftMargin + 50, y + 3.8);
    doc.text('DATE', leftMargin + 100, y + 3.8);
    doc.text('METHOD', leftMargin + 130, y + 3.8);
    doc.text('STATUS', leftMargin + 154, y + 3.8);
    doc.text('AMOUNT PAID', rightMargin - 4, y + 3.8, { align: 'right' });
    y += 5.5;

    if (payments.length > 0) {
      payments.forEach((p) => {
        const rowY = y + 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(23, 43, 69);
        doc.text(p.paymentReference || 'N/A', leftMargin + 3, rowY);
        doc.text(p.transactionRef || 'N/A', leftMargin + 50, rowY);
        doc.text(p.paymentDate || 'N/A', leftMargin + 100, rowY);
        doc.text(p.paymentMode || 'UPI', leftMargin + 130, rowY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(p.status || 'SUCCESS', leftMargin + 154, rowY);

        doc.setTextColor(23, 43, 69);
        doc.text(`INR ${p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightMargin - 4, rowY, { align: 'right' });
        y += 5.5;
      });
    } else {
      const rowY = y + 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(23, 43, 69);
      doc.text('PAY-DIRECT-RECORD', leftMargin + 3, rowY);
      doc.text(`TXN-INV-${invNumber}`, leftMargin + 50, rowY);
      doc.text(issueDate, leftMargin + 100, rowY);
      doc.text('Online Portal', leftMargin + 130, rowY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text('SUCCESS', leftMargin + 154, rowY);

      doc.setTextColor(23, 43, 69);
      doc.text(`INR ${invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightMargin - 4, rowY, { align: 'right' });
      y += 5.5;
    }
  }

  // 9. Modern Corporate Footer
  const footerY = 278;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(leftMargin, footerY, rightMargin, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(13, 31, 54);
  doc.text(`Thank you for being a valued resident of ${hostel.name || 'Hostel OS Residence'}.`, leftMargin, footerY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Official computer-generated fee invoice issued through Hostel OS Cloud Platform. Queries: ${hostel.contactEmail || 'contact@hostelos.local'} | ${hostel.contactPhone || '+91 98201 12345'}`,
    leftMargin,
    footerY + 8.5
  );

  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document Reference: ${invNumber}  •  Page 1 of 1`,
    rightMargin,
    footerY + 8.5,
    { align: 'right' }
  );

  // Trigger download with required exact filename
  doc.save(`HostelOS_${invNumber}.pdf`);
}

// =========================================================================
// ON-SCREEN INVOICE MODAL (EXACT WEBSITE THEME)
// Matches Hostel OS:
//   - Background: bg-[#F4F6F9] dark:bg-[#0A0D14]
//   - Sheet: White card with #E2E8F0 borders
//   - Accent Brand: Deep Midnight Navy #0D1F36 & Royal Blue #2563EB
//   - Status Badges & High-Contrast Financial Ledger
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
      title="Hostel Resident Fee Invoice"
      description={`Official digital invoice & resident ledger record • Reference: ${invNumber}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Document Presentation Canvas */}
        <div
          ref={printRef}
          className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-[#121824]"
        >
          {/* 1. Signature Brand Bar at Top of Invoice (Deep Midnight Navy with Royal Blue Accent) */}
          <div className="w-full">
            <div className="h-2 bg-[#0D1F36] w-full" />
            <div className="h-0.5 bg-blue-600 w-full" />
          </div>

          {/* 2. Document Header */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-slate-100 pb-6 dark:border-slate-800/80">
              {/* Brand & Property Info (Left) */}
              <div className="space-y-3 max-w-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D1F36] text-white shadow-sm border border-slate-700">
                    <GraduationCap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold tracking-tight text-[#0D1F36] dark:text-white">
                        Hostel OS
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9.5px] font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                        PMS & Living
                      </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Student Resident Portal
                    </p>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-1 pt-1">
                  <h3 className="text-lg font-bold text-[#172B45] dark:text-white leading-tight">
                    {hostel.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>
                      {hostel.address}, {hostel.city}
                      {hostel.state ? `, ${hostel.state}` : ''}
                      {hostel.pincode ? ` - ${hostel.pincode}` : ''}
                    </span>
                  </p>
                  <p className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {hostel.contactPhone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {hostel.contactEmail}
                    </span>
                  </p>
                </div>
              </div>

              {/* Invoice Title & Identification (Right) */}
              <div className="flex flex-col md:items-end space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                  Official Statement
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0D1F36] dark:text-white">
                  TAX / FEE INVOICE
                </h2>

                {/* Actual Invoice Number Pill */}
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-mono font-bold text-[#172B45] dark:text-white">
                    {invNumber}
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

                {/* Status Badge */}
                <div className="pt-1">
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      <span>PAID IN FULL</span>
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                      <span>OVERDUE</span>
                    </span>
                  ) : isPartiallyPaid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      <span>PARTIALLY PAID</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      <span>PAYMENT PENDING</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. 4-Column Metadata Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Date of Issue
                </span>
                <span className="mt-0.5 block font-bold text-[#172B45] dark:text-white">
                  {issueDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Payment Due Date
                </span>
                <span className="mt-0.5 block font-bold text-[#172B45] dark:text-white">
                  {invoice.dueDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Billing Cycle
                </span>
                <span className="mt-0.5 block font-bold text-[#172B45] dark:text-white">
                  {invoice.billingPeriod || 'Current Month'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Currency & Legal
                </span>
                <span className="mt-0.5 block font-bold text-[#172B45] dark:text-white">
                  INR (₹) • Resident Fee
                </span>
              </div>
            </div>

            {/* 4. Resident & Accommodation Allocation Side-by-Side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Billed To (Resident) */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 border-l-4 border-l-blue-600 dark:border-slate-800 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Billed To (Student Resident)
                    </span>
                    <h4 className="font-extrabold text-[#172B45] dark:text-white text-sm">
                      {profile.name}
                    </h4>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 pl-9">
                  <p>
                    Student ID:{' '}
                    <span className="font-mono font-bold text-[#172B45] dark:text-slate-200">
                      {profile.studentCode}
                    </span>
                  </p>
                  <p>Registered Email: {profile.email}</p>
                  <p>Contact Phone: {profile.phone}</p>
                </div>
              </div>

              {/* Room Allotment Specification */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 border-l-4 border-l-indigo-600 dark:border-slate-800 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                    <BedDouble className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Room & Bed Allocation
                    </span>
                    <h4 className="font-extrabold text-[#172B45] dark:text-white text-sm">
                      Room {profile.roomDetails.roomNumber} ({profile.roomDetails.bedNumber || 'Bed A'})
                    </h4>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 pl-9">
                  <p>Room Type: {profile.roomDetails.roomType || 'Standard Sharing'}</p>
                  <p>Location: Floor {profile.roomDetails.floor} • Wing: {profile.roomDetails.wing || 'Main Wing'}</p>
                  <p>Hostel Property: {hostel.name}</p>
                </div>
              </div>
            </div>

            {/* 5. Itemized Fee Line Items Table */}
            <div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172B45] dark:text-white flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-blue-600" /> Itemized Fee Line Items
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Billing Period: {invoice.billingPeriod}
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#0D1F36] text-white text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Description & Specification</th>
                      <th className="py-3 px-4">Fee Category</th>
                      <th className="py-3 px-4">Billing Cycle</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {(invoice.items && invoice.items.length > 0 ? invoice.items : [
                      {
                        description: invoice.title || `Hostel Accommodation & Resident Facility Charges (${profile.roomDetails.roomType})`,
                        category: invoice.feeCategory,
                        billingPeriod: invoice.billingPeriod || 'Current Month',
                        amount: invoice.totalAmount,
                      },
                    ]).map((item, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-800/30' : 'bg-white dark:bg-[#121824]'}
                      >
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-medium">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#172B45] dark:text-white">
                          {item.description}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {item.category} Fee
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {item.billingPeriod}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-[#172B45] dark:text-white text-sm">
                          ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Summary Totals & Digital Verification */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pt-2">
              {/* Policy & Digital Seal (Left) */}
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 dark:border-slate-800 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 space-y-3 flex-1">
                <div>
                  <h5 className="font-bold text-[#172B45] dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Resident Payment Policy & Verification
                  </h5>
                  <p className="mt-1 text-[11px] leading-relaxed">
                    This invoice is authenticated by the Hostel OS cloud billing engine for {hostel.name}.
                    All transactions recorded in the digital portal automatically sync with hostel resident ledgers.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#0D131F] space-y-1">
                  <p className="text-[10px] font-mono font-bold text-[#172B45] dark:text-slate-200">
                    HOSTEL OS CERTIFIED AUDIT TRAIL • REF: {invNumber}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Cryptographically logged digital statement. Valid and authentic without physical seal.
                  </p>
                </div>
              </div>

              {/* Totals Breakdown Card (Right) */}
              <div className="w-full md:w-88 rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Charges:</span>
                  <span className="font-bold text-[#172B45] dark:text-slate-200">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {additional > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Utility / Maintenance Charges:</span>
                    <span className="font-bold text-[#172B45] dark:text-slate-200">
                      ₹{additional.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {discounts > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Concession / Discount:</span>
                    <span className="font-bold">
                      - ₹{discounts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-[#172B45] dark:text-white font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm">Total Invoice Amount:</span>
                  <span className="text-base font-extrabold">
                    ₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Amount Paid to Date:</span>
                  <span className="font-extrabold">
                    ₹{invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Highlighted Remaining Balance Card */}
                <div
                  className={`mt-2 rounded-xl p-3.5 border font-bold flex items-center justify-between ${
                    invoice.remainingBalance > 0
                      ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
                  }`}
                >
                  <span className="text-xs uppercase font-extrabold tracking-wide">
                    {invoice.remainingBalance > 0 ? 'Remaining Balance Due' : 'Balance Status'}
                  </span>
                  <span className="text-base font-extrabold">
                    {invoice.remainingBalance > 0
                      ? `₹${invoice.remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      : '₹0.00 (Fully Settled)'}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Verified Payment Transactions Table (if payments recorded) */}
            {(payments.length > 0 || invoice.paidAmount > 0) && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172B45] dark:text-white flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-blue-600" /> Recorded Payment Ledger
                </span>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3.5">Payment Reference</th>
                        <th className="py-2.5 px-3.5">Transaction ID</th>
                        <th className="py-2.5 px-3.5">Date</th>
                        <th className="py-2.5 px-3.5">Method</th>
                        <th className="py-2.5 px-3.5">Status</th>
                        <th className="py-2.5 px-3.5 text-right">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {payments.length > 0 ? (
                        payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {p.paymentReference}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-400">
                              {p.transactionRef}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">
                              {p.paymentDate}
                            </td>
                            <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">
                              {p.paymentMode}
                            </td>
                            <td className="py-2.5 px-3.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-right font-extrabold text-[#172B45] dark:text-white">
                              ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                            PAY-DIRECT
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-400">
                            TXN-INV-{invNumber}
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">{issueDate}</td>
                          <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-300">Online Demo UPI</td>
                          <td className="py-2.5 px-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              SUCCESS
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-extrabold text-[#172B45] dark:text-white">
                            ₹{invoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-[#172B45] dark:text-slate-200">
                Thank you for being a valued resident of {hostel.name}.
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                This is an official computer-generated fee invoice generated through Hostel OS Cloud Platform. For questions or adjustments, contact the hostel desk at {hostel.contactEmail} or call {hostel.contactPhone}.
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" onClick={handlePrint} title="Print document">
              <Printer className="h-4 w-4 mr-1.5" />
              Print Invoice
            </Button>
            <Button
              variant="primary"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 cursor-pointer"
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

export default InvoiceModal;