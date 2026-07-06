const esc = (v: string | number) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function triggerCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Build a CSV string and trigger a browser download. */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  triggerCsv(filename, [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n"));
}

export type ReportSection = { title: string; headers: string[]; rows: (string | number)[][] };

/** Download several report sections in one CSV (blank line between each). */
export function downloadCsvSections(filename: string, sections: ReportSection[]) {
  const parts: string[] = [];
  for (const sec of sections) {
    parts.push(esc(sec.title));
    parts.push(sec.headers.map(esc).join(","));
    for (const r of sec.rows) parts.push(r.map(esc).join(","));
    parts.push("");
  }
  triggerCsv(filename, parts.join("\n"));
}
