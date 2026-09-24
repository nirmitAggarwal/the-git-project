import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { VerificationPayload } from '../types/verification';
import { CERTIFICATE_CONFIG } from '../data/certificateData';
import { buildVerifyUrl as buildEnvVerifyUrl } from '../config/env';

// A4 landscape dimensions in millimetres.
const PAGE_W = 297;
const PAGE_H = 210;
const CENTER = PAGE_W / 2;

const COLORS = {
  ink: '#0d1117',
  navy: '#0f172a',       // Slate 900
  gold: '#b8860b',       // Deep Gold Accent
  goldSoft: '#d4af37',   // Metallic Gold
  goldLight: '#fef3c7',  // Soft Gold Highlight
  body: '#334155',       // Slate 700
  muted: '#64748b',      // Slate 500
  line: '#e2e8f0',       // Slate 200
  panel: '#f8fafc',      // Card Background
  paper: '#fdfbf7',      // Certificate Warm Off-White
  white: '#ffffff',
};

/**
 * Builds the public verification URL for a token. Uses the hash route so the
 * link works no matter which path the app is served from.
 */
export function buildVerifyUrl(token: string): string {
  return buildEnvVerifyUrl(token);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function sanitizeFilename(name: string): string {
  const cleaned = (name || 'Participant').trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'Participant';
}

/**
 * Renders a print-ready A4 landscape PDF certificate with recipient details,
 * organizer branding, author links, and an embedded QR code for verification.
 */
export async function buildCertificatePdf(
  payload: VerificationPayload,
  token: string
): Promise<jsPDF> {
  const verifyUrl = buildVerifyUrl(token);

  // Pre-render the QR code that deep-links to the verification portal.
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 0,
    width: 600,
    errorCorrectionLevel: 'M',
    color: { dark: COLORS.navy, light: COLORS.white },
  });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // ---- Paper & Framing Borders ----------------------------------------------
  doc.setFillColor(COLORS.paper);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // Outer Navy Border
  doc.setDrawColor(COLORS.navy);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, PAGE_W - 16, PAGE_H - 16, 'S');

  // Inner Gold Frame
  doc.setDrawColor(COLORS.goldSoft);
  doc.setLineWidth(0.6);
  doc.rect(11, 11, PAGE_W - 22, PAGE_H - 22, 'S');

  // Thin Accent Outline
  doc.setDrawColor(COLORS.line);
  doc.setLineWidth(0.2);
  doc.rect(13, 13, PAGE_W - 26, PAGE_H - 26, 'S');

  // Gold Corner Accents
  doc.setFillColor(COLORS.goldSoft);
  const cornerSize = 2.5;
  [
    [13, 13],
    [PAGE_W - 13 - cornerSize, 13],
    [13, PAGE_H - 13 - cornerSize],
    [PAGE_W - 13 - cornerSize, PAGE_H - 13 - cornerSize],
  ].forEach(([x, y]) => doc.rect(x, y, cornerSize, cornerSize, 'F'));

  // ---- Organizer Header -----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.navy);
  doc.setCharSpace(1.8);
  doc.text(CERTIFICATE_CONFIG.organization.toUpperCase(), CENTER, 23, { align: 'center' });
  doc.setCharSpace(0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted);
  doc.text(CERTIFICATE_CONFIG.organizationTagline, CENTER, 28, { align: 'center' });

  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.5);
  doc.line(CENTER - 25, 32, CENTER + 25, 32);

  // ---- Title Block ----------------------------------------------------------
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(COLORS.navy);
  doc.text(CERTIFICATE_CONFIG.certificateTitle.toUpperCase(), CENTER, 44, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(COLORS.gold);
  doc.text(CERTIFICATE_CONFIG.courseName, CENTER, 52, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted);
  doc.text(CERTIFICATE_CONFIG.certificateSubtitle, CENTER, 58, { align: 'center' });

  // ---- Recipient Block ------------------------------------------------------
  doc.setFont('times', 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(COLORS.body);
  doc.text('This is to certify that', CENTER, 67, { align: 'center' });

  const recipientName = payload.name || 'Participant';
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(28);
  doc.setTextColor(COLORS.navy);
  doc.text(recipientName, CENTER, 80, { align: 'center' });

  const nameWidth = Math.min(doc.getTextWidth(recipientName) + 12, 160);
  doc.setDrawColor(COLORS.gold);
  doc.setLineWidth(0.6);
  doc.line(CENTER - nameWidth / 2, 84, CENTER + nameWidth / 2, 84);

  // ---- Description ----------------------------------------------------------
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(COLORS.body);
  doc.text(CERTIFICATE_CONFIG.descriptionLine1, CENTER, 93, { align: 'center' });
  doc.text(CERTIFICATE_CONFIG.descriptionLine2, CENTER, 98, { align: 'center' });

  // ---- Completion Metrics Panel ---------------------------------------------
  const metrics = [
    { label: 'COMPLETED', value: formatDate(payload.completedAt) },
    { label: 'SCORE', value: `${payload.scorePercentage}%` },
    { label: 'MODULES', value: `${payload.completedLessonsCount}/${payload.totalLessonsCount}` },
    { label: 'XP GAINED', value: `${payload.xp} XP` },
    { label: 'FINAL CHALLENGE', value: payload.finalChallengeStatus },
  ];

  const statPanelX = 24;
  const statPanelY = 105;
  const statPanelW = PAGE_W - 48; // 249mm width
  const statPanelH = 15;

  doc.setFillColor(COLORS.panel);
  doc.roundedRect(statPanelX, statPanelY, statPanelW, statPanelH, 2, 2, 'F');
  doc.setDrawColor(COLORS.line);
  doc.setLineWidth(0.3);
  doc.roundedRect(statPanelX, statPanelY, statPanelW, statPanelH, 2, 2, 'S');

  const colWidth = statPanelW / metrics.length;
  metrics.forEach((item, idx) => {
    const colCenterX = statPanelX + (idx + 0.5) * colWidth;

    // Metric Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(COLORS.muted);
    doc.text(item.label, colCenterX, statPanelY + 5.5, { align: 'center' });

    // Metric Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.navy);
    doc.text(String(item.value), colCenterX, statPanelY + 11, { align: 'center' });

    // Vertical Divider
    if (idx < metrics.length - 1) {
      const dividerX = statPanelX + (idx + 1) * colWidth;
      doc.setDrawColor(COLORS.line);
      doc.setLineWidth(0.2);
      doc.line(dividerX, statPanelY + 3, dividerX, statPanelY + statPanelH - 3);
    }
  });

  // Section Separator Line
  doc.setDrawColor(COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(28, 128, PAGE_W - 28, 128);

  // ---- Signatory & Author Section -------------------------------------------
  const sigX = 36;
  doc.setFont('times', 'italic');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.navy);
  doc.text(CERTIFICATE_CONFIG.authorName, sigX, 142);

  doc.setDrawColor(COLORS.navy);
  doc.setLineWidth(0.4);
  doc.line(sigX, 145, sigX + 75, 145);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(COLORS.navy);
  doc.text(CERTIFICATE_CONFIG.authorName, sigX, 150);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(COLORS.muted);
  doc.text(CERTIFICATE_CONFIG.authorRole, sigX, 154.5);
  doc.text(CERTIFICATE_CONFIG.organization, sigX, 158.5);

  // Author Social Links
  let currentLinkX = sigX;
  doc.setFontSize(6.8);

  doc.setTextColor(COLORS.gold);
  doc.textWithLink('LinkedIn', currentLinkX, 163.5, { url: CERTIFICATE_CONFIG.authorLinkedIn });
  currentLinkX += doc.getTextWidth('LinkedIn');

  doc.setTextColor(COLORS.muted);
  doc.text('  |  ', currentLinkX, 163.5);
  currentLinkX += doc.getTextWidth('  |  ');

  doc.setTextColor(COLORS.gold);
  doc.textWithLink('GitHub', currentLinkX, 163.5, { url: CERTIFICATE_CONFIG.authorGitHub });
  currentLinkX += doc.getTextWidth('GitHub');

  doc.setTextColor(COLORS.muted);
  doc.text('  |  ', currentLinkX, 163.5);
  currentLinkX += doc.getTextWidth('  |  ');

  doc.setTextColor(COLORS.gold);
  doc.textWithLink('theboringedit.in', currentLinkX, 163.5, { url: CERTIFICATE_CONFIG.authorWebsite });

  // Organization LinkedIn Link
  doc.setFontSize(6.8);
  doc.setTextColor(COLORS.muted);
  doc.text('Organization: ', sigX, 168);
  doc.setTextColor(COLORS.gold);
  doc.textWithLink('linkedin.com/company/mscmsit', sigX + doc.getTextWidth('Organization: '), 168, {
    url: CERTIFICATE_CONFIG.organizationLinkedIn,
  });

  // ---- QR Code & Authenticity Badge -----------------------------------------
  const qrX = PAGE_W - 62;
  const qrY = 132;
  const qrSize = 28;

  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(COLORS.navy);
  doc.text('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(COLORS.muted);
  doc.text('Authenticity portal', qrX + qrSize / 2, qrY + qrSize + 7.5, { align: 'center' });

  // ---- Verification Footer Strip --------------------------------------------
  const footerX = 24;
  const footerY = 178;
  const footerW = PAGE_W - 48; // 249mm width
  const footerH = 13;

  doc.setFillColor(COLORS.panel);
  doc.roundedRect(footerX, footerY, footerW, footerH, 2, 2, 'F');
  doc.setDrawColor(COLORS.goldSoft);
  doc.setLineWidth(0.4);
  doc.roundedRect(footerX, footerY, footerW, footerH, 2, 2, 'S');

  // Footer Left Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(COLORS.gold);
  doc.text('VERIFIED CREDENTIAL', footerX + 5, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(COLORS.muted);
  doc.text('Cryptographically signed & tamper-proof certificate', footerX + 5, footerY + 9.5);

  // Footer Right Link (Clean, static link label)
  const linkText = 'Verify Authenticity Online \u2192';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(COLORS.gold);

  const linkTextWidth = doc.getTextWidth(linkText);
  const rightAlignX = footerX + footerW - 5;
  doc.textWithLink(linkText, rightAlignX - linkTextWidth, footerY + 5, { url: verifyUrl });

  const subText = 'Scan QR code or follow link to validate';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(COLORS.muted);
  const subTextWidth = doc.getTextWidth(subText);
  doc.text(subText, rightAlignX - subTextWidth, footerY + 9.5);

  // ---- Document Metadata ----------------------------------------------------
  doc.setProperties({
    title: `${CERTIFICATE_CONFIG.courseName} Certificate - ${payload.name}`,
    subject: `${CERTIFICATE_CONFIG.courseName} completion certificate`,
    author: CERTIFICATE_CONFIG.organization,
    keywords: `Git, GitHub, Certificate, ${CERTIFICATE_CONFIG.organization}, verification`,
    creator: CERTIFICATE_CONFIG.organization,
  });

  return doc;
}

/**
 * Generates and downloads the certificate PDF for the given payload.
 */
export async function downloadCertificatePdf(
  payload: VerificationPayload,
  token: string
): Promise<void> {
  const doc = await buildCertificatePdf(payload, token);
  const filename = `MSIT-${CERTIFICATE_CONFIG.courseName.replace(/[^a-z0-9]+/gi, '-')}-Certificate-${sanitizeFilename(
    payload.name
  )}.pdf`;
  doc.save(filename);
}

/**
 * Returns the certificate PDF as a blob (useful for previews or uploads).
 */
export async function getCertificateBlob(
  payload: VerificationPayload,
  token: string
): Promise<Blob> {
  const doc = await buildCertificatePdf(payload, token);
  return doc.output('blob');
}