// Heavier export formats (PDF/Word). Import this module lazily
// (`await import("@/lib/export")`) so jsPDF stays out of the initial bundle.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type Cell = string | number;

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const escapeHtml = (v: Cell) =>
  String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Download a report as a real PDF (jsPDF + autotable). */
export function downloadPdf(filename: string, title: string, headers: string[], rows: Cell[][]) {
  const doc = new jsPDF({ orientation: rows[0] && rows[0].length > 5 ? "landscape" : "portrait" });
  doc.setFontSize(15);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);
  autoTable(doc, {
    head: [headers],
    body: rows.map((r) => r.map((c) => String(c))),
    startY: 27,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [10, 10, 10], textColor: [245, 242, 235] },
    alternateRowStyles: { fillColor: [245, 242, 235] },
  });
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

/** Download a report as a Word document (.doc) — HTML-based, no dependency. */
export function downloadWord(filename: string, title: string, headers: string[], rows: Cell[][]) {
  const th = headers.map((h) => `<th style="background:#0a0a0a;color:#fff;padding:6px;text-align:left">${escapeHtml(h)}</th>`).join("");
  const trs = rows
    .map((r) => `<tr>${r.map((c) => `<td style="padding:6px;border:1px solid #ddd">${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body style="font-family:Arial,sans-serif"><h2>${escapeHtml(title)}</h2><p style="color:#666">Generated ${new Date().toLocaleString()}</p><table style="border-collapse:collapse;width:100%"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
  const blob = new Blob(["﻿" + html], { type: "application/msword" });
  triggerDownload(blob, filename.endsWith(".doc") ? filename : `${filename}.doc`);
}
