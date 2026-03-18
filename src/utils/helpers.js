import { PASSWORDS, EXPORT_PREFIX } from "../constants";

// ─── AUTH ─────────────────────────────────────────────────────────────────────

const norm = (s) => s.toLowerCase().replace(/[\s\-_.]+/g, "").trim();
export const checkPassword = (v) => PASSWORDS.some((p) => norm(p) === norm(v));

// ─── DISPLAY HELPERS ─────────────────────────────────────────────────────────

export const initials = (n) =>
  (n || "").split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";

export const shortName = (n) => (n || "").split(/\s+/)[0] || n || "Unknown";

export const fmtMonth = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleString("default", {
    month: "long",
    year:  "numeric",
  });
};

export const fmtDate = (d) => {
  if (!d) return "Not Available";
  if (!(d instanceof Date) || isNaN(d)) return "Not Available";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// ─── EXPORT HELPERS ──────────────────────────────────────────────────────────

/**
 * Generate a timestamped export filename.
 * e.g. whatsapp_analytics_export_2025-06-15T14-30-00.xlsx
 */
export function exportFilename(ext = "xlsx") {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${EXPORT_PREFIX}_${ts}.${ext}`;
}

/**
 * Convert member directory Map into a flat array of plain objects
 * suitable for Excel/CSV export. No nested JSON.
 */
export function directoryToRows(memberDirectory) {
  return [...memberDirectory.values()].map((rec) => ({
    "First Name":            rec.firstName          || "Not Available",
    "Last Name":             rec.lastName           || "Not Available",
    "Store Name":            rec.storeName          || "Not Available",
    "Store Type":            rec.storeType          || "Not Available",
    "Location":              rec.location           || "Not Available",
    "Join Date":             fmtDate(rec.joinDate),
    "Join Date Flagged":     rec.joinDateFlagged ? "Yes" : "No",
    "Total Messages":        rec.totalMessages      || 0,
    "Last Active Date":      fmtDate(rec.lastActiveDate),
    "Contribution Status":   rec.contributionStatus || "Silent",
  }));
}

/**
 * Export member directory to .xlsx using the xlsx library.
 * Falls back gracefully if xlsx is unavailable.
 */
export async function exportToXlsx(memberDirectory, analytics) {
  // Dynamic import so the app doesn't break if xlsx isn't installed yet
  let XLSX;
  try {
    XLSX = await import("xlsx");
  } catch (e) {
    console.error("xlsx library not available:", e);
    exportToCsv(memberDirectory); // fallback
    return;
  }

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Member Directory ──
  const dirRows = directoryToRows(memberDirectory);
  const ws1 = XLSX.utils.json_to_sheet(dirRows);
  // Set column widths
  ws1["!cols"] = [
    { wch: 16 }, { wch: 20 }, { wch: 24 }, { wch: 14 },
    { wch: 22 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
    { wch: 18 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Member Directory");

  // ── Sheet 2: Monthly Summary ──
  const summaryRows = analytics.months.map((month) => {
    const msgs = analytics.byMonth[month] || [];
    const senders = new Set(msgs.map(m => m.sender));
    return {
      "Month":          fmtMonth(month),
      "Total Messages": msgs.length,
      "Active Members": senders.size,
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  ws2["!cols"] = [{ wch: 18 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Monthly Summary");

  // Write and trigger download
  XLSX.writeFile(wb, exportFilename("xlsx"));
}

/**
 * CSV fallback export.
 */
export function exportToCsv(memberDirectory) {
  const rows   = directoryToRows(memberDirectory);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = exportFilename("csv");
  a.click();
  URL.revokeObjectURL(url);
}
