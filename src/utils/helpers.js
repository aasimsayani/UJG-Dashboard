import { PASSWORDS, EXPORT_PREFIX } from "../constants";
import { normaliseName } from "./parser";

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const norm = (s) => s.toLowerCase().replace(/[\s\-_.]+/g, "").trim();
export const checkPassword = (v) => PASSWORDS.some(p => norm(p) === norm(v));

// ─── DISPLAY ─────────────────────────────────────────────────────────────────

/** Initials from a raw sender string — always normalised first */
export function initials(raw) {
  const { firstName, lastName } = normaliseName(raw);
  const f = firstName !== "Not Available" ? firstName[0] : "?";
  const l = lastName  !== "Not Available" ? lastName[0]  : "";
  return (f + l).toUpperCase() || "?";
}

/** Display name: "First Last" or just "First" if no last name */
export function displayName(raw) {
  const { firstName, lastName } = normaliseName(raw);
  if (firstName === "Not Available") return raw || "Unknown";
  return lastName !== "Not Available" ? `${firstName} ${lastName}` : firstName;
}

/** First name only */
export function firstName(raw) {
  return normaliseName(raw).firstName || raw || "Unknown";
}

export const fmtMonth = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
};

export const fmtDate = (d) => {
  if (!d) return "Not Available";
  if (!(d instanceof Date) || isNaN(d)) return "Not Available";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// ─── EXPORT ──────────────────────────────────────────────────────────────────

export function exportFilename(ext = "xlsx") {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${EXPORT_PREFIX}_${ts}.${ext}`;
}

/** Flatten member directory to export-ready rows */
export function directoryToRows(memberDirectory) {
  return [...memberDirectory.values()]
    .sort((a, b) => b.totalMessages - a.totalMessages)
    .map(rec => ({
      "First Name":          rec.firstName          || "Not Available",
      "Last Name":           rec.lastName           || "Not Available",
      "Store Name":          rec.storeName          || "Not Available",
      "Location":            rec.location           || "Not Available",
      "Join Date":           fmtDate(rec.joinDate),
      "Total Messages":      rec.totalMessages      || 0,
      "Last Active Date":    fmtDate(rec.lastActiveDate),
      "Contribution Status": rec.contributionStatus || "Silent",
    }));
}

/** Export to .xlsx with two sheets */
export async function exportToXlsx(memberDirectory, analytics) {
  let XLSX;
  try {
    XLSX = await import("xlsx");
  } catch (e) {
    console.error("xlsx not available:", e);
    exportToCsv(memberDirectory);
    return;
  }

  const wb = XLSX.utils.book_new();

  // Sheet 1 — Member Directory
  const ws1 = XLSX.utils.json_to_sheet(directoryToRows(memberDirectory));
  ws1["!cols"] = [
    { wch: 16 }, { wch: 20 }, { wch: 26 }, { wch: 22 },
    { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Member Directory");

  // Sheet 2 — Monthly Summary
  const summaryRows = (analytics.months || []).map(month => {
    const msgs    = analytics.byMonth[month] || [];
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

  XLSX.writeFile(wb, exportFilename("xlsx"));
}

/** CSV fallback */
export function exportToCsv(memberDirectory) {
  const rows = directoryToRows(memberDirectory);
  if (!rows.length) return;
  const headers    = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = exportFilename("csv"); a.click();
  URL.revokeObjectURL(url);
}
