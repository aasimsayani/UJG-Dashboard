import { useState } from "react";
import { C } from "../constants";
import { fmtDate, initials, exportToXlsx, exportToCsv } from "../utils/helpers";

// ─── CONTRIBUTION STATUS BADGE ────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    "Active":  { bg: C.greenSoft,  color: C.green,  border: C.green  + "44", label: "Active"   },
    "At-Risk": { bg: C.orangeSoft, color: C.orange, border: C.orange + "44", label: "At-Risk"  },
    "Silent":  { bg: C.redSoft,    color: C.red,    border: C.red    + "44", label: "Silent"   },
  };
  const s = map[status] || map["Silent"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "0.18rem 0.55rem",
      borderRadius: 100, fontSize: "0.68rem", fontFamily: "'Cinzel',serif",
      letterSpacing: "0.05em", background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  );
}

// ─── EXPORT BUTTONS ───────────────────────────────────────────────────────────

function ExportButtons({ memberDirectory, analytics }) {
  const [loading, setLoading] = useState(false);

  const handleXlsx = async () => {
    setLoading(true);
    try {
      await exportToXlsx(memberDirectory, analytics);
    } catch (e) {
      console.error("Export failed:", e);
      alert("Excel export failed. Downloading CSV instead.");
      exportToCsv(memberDirectory);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
      <button
        style={loading ? { ...S.exportBtn, opacity: 0.6, cursor: "wait" } : S.exportBtn}
        onClick={handleXlsx}
        disabled={loading}
        title="Export member directory to Excel (.xlsx)"
      >
        {loading ? "Exporting…" : "📥 Export Excel"}
      </button>
      <button
        style={S.exportBtnSec}
        onClick={() => exportToCsv(memberDirectory)}
        title="Export member directory to CSV"
      >
        CSV
      </button>
    </div>
  );
}

// ─── ADMIN NOTIFICATION SCAFFOLD ─────────────────────────────────────────────

function AdminNotificationSection({ memberDirectory }) {
  const [emails, setEmails] = useState(["", "", "", ""]);

  const updateEmail = (i, val) => {
    const next = [...emails];
    next[i] = val;
    setEmails(next);
  };

  return (
    <div style={S.notifSection}>
      <div style={S.notifHeader}>
        <div style={S.notifTitle}>Admin Notifications</div>
        <span style={S.comingSoonBadge}>Coming Soon</span>
      </div>
      <div style={S.notifBody}>
        <div style={S.notifDesc}>
          Automated weekly reports will be sent to up to 4 admin emails.
          Silent and at-risk member alerts will be included.
        </div>

        <div style={S.emailGrid}>
          {emails.map((email, i) => (
            <div key={i} style={S.emailRow}>
              <label style={S.emailLabel}>Admin {i + 1}</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => updateEmail(i, e.target.value)}
                style={S.emailInput}
                disabled
                title="Feature coming soon"
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem" }}>
          <button style={S.sendBtn} disabled title="Feature coming soon">
            📧 Send Report
          </button>
          <span style={S.comingSoonNote}>
            Email integration coming in a future release
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DIRECTORY TAB ───────────────────────────────────────────────────────

export default function DirectoryTab({ analytics }) {
  const { memberDirectory } = analytics;
  const [filter, setFilter] = useState("all"); // all | Active | At-Risk | Silent
  const [search, setSearch] = useState("");

  const allRecords = [...memberDirectory.values()];

  const filtered = allRecords.filter((rec) => {
    const matchesFilter = filter === "all" || rec.contributionStatus === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      rec.firstName.toLowerCase().includes(q) ||
      rec.lastName.toLowerCase().includes(q) ||
      rec.storeName.toLowerCase().includes(q) ||
      rec.location.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all:      allRecords.length,
    Active:   allRecords.filter(r => r.contributionStatus === "Active").length,
    "At-Risk":allRecords.filter(r => r.contributionStatus === "At-Risk").length,
    Silent:   allRecords.filter(r => r.contributionStatus === "Silent").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase" }}>
            Member Directory
          </div>
          <div style={{ fontSize: "0.85rem", color: C.textFaint, fontStyle: "italic", marginTop: "0.2rem" }}>
            {allRecords.length} members · join dates and store info detected from chat
          </div>
        </div>
        <ExportButtons memberDirectory={memberDirectory} analytics={analytics} />
      </div>

      {/* Filter + Search row */}
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        {["all", "Active", "At-Risk", "Silent"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.35rem 0.9rem", borderRadius: 100, fontSize: "0.75rem",
              fontFamily: "'Cinzel',serif", letterSpacing: "0.06em", cursor: "pointer",
              border: `1px solid ${filter === f ? C.accent : C.border}`,
              background: filter === f ? C.accentSoft : "transparent",
              color: filter === f ? C.accent : C.textMuted,
              transition: "all 0.2s",
            }}
          >
            {f === "all" ? "All" : f} ({counts[f] ?? counts["all"]})
          </button>
        ))}
        <input
          type="text"
          placeholder="Search name, store, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={S.searchInput}
        />
      </div>

      {/* Directory table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: C.textFaint, fontStyle: "italic" }}>
              No members match your filter
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <thead>
                <tr>
                  {["Member", "Store", "Type", "Location", "Join Date", "Messages", "Last Active", "Status"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, i) => (
                  <tr key={rec.senderKey + i}>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: `linear-gradient(135deg, ${C.accent}, #8b5e00)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Cinzel',serif", fontSize: "0.62rem", fontWeight: 700, color: "#0a0a0f",
                        }}>
                          {initials(`${rec.firstName} ${rec.lastName}`)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: C.text }}>
                            {rec.firstName === "Not Available" ? rec.senderKey.split(/\s+/)[0] : `${rec.firstName} ${rec.lastName === "Not Available" ? "" : rec.lastName}`.trim()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ color: rec.storeName === "Not Available" ? C.textFaint : C.text }}>
                        {rec.storeName}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ color: rec.storeType === "Not Available" ? C.textFaint : C.textMuted, fontSize: "0.78rem" }}>
                        {rec.storeType}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ color: rec.location === "Not Available" ? C.textFaint : C.text }}>
                        {rec.location}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ color: rec.joinDateFlagged ? C.orange : C.text, fontSize: "0.8rem" }}>
                        {fmtDate(rec.joinDate)}
                        {rec.joinDateFlagged && (
                          <span title="Join date could not be detected from chat" style={{ marginLeft: "0.3rem", cursor: "help" }}>⚠</span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...S.td, fontFamily: "'Cinzel',serif", color: rec.totalMessages > 0 ? C.accent : C.textFaint, fontWeight: 700 }}>
                      {rec.totalMessages}
                    </td>
                    <td style={{ ...S.td, fontSize: "0.8rem", color: C.textMuted }}>
                      {fmtDate(rec.lastActiveDate)}
                    </td>
                    <td style={S.td}>
                      <StatusBadge status={rec.contributionStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Admin Notification Section */}
      <AdminNotificationSection memberDirectory={memberDirectory} />
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = {
  th: {
    fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.1em",
    color: C.textFaint, textTransform: "uppercase",
    padding: "0.6rem 0.8rem", textAlign: "left",
    borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
  },
  td: {
    padding: "0.6rem 0.8rem",
    borderBottom: `1px solid ${C.border}44`,
    color: C.text, verticalAlign: "middle",
  },
  exportBtn: {
    padding: "0.5rem 1.1rem", borderRadius: 8, border: "none",
    background: `linear-gradient(135deg, #b8860b, ${C.accent}, #daa520)`,
    color: "#0a0a0f", fontFamily: "'Cinzel',serif", fontSize: "0.75rem",
    fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
    boxShadow: "0 2px 12px #c9a84c33",
  },
  exportBtnSec: {
    padding: "0.5rem 0.9rem", borderRadius: 8,
    border: `1px solid ${C.border}`, background: "transparent",
    color: C.textMuted, fontFamily: "'Cinzel',serif",
    fontSize: "0.72rem", letterSpacing: "0.08em", cursor: "pointer",
  },
  searchInput: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text,
    fontFamily: "'Crimson Pro',serif", fontSize: "0.9rem",
    padding: "0.4rem 0.85rem", outline: "none",
    minWidth: 240, flex: 1,
  },
  notifSection: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 12, overflow: "hidden",
  },
  notifHeader: {
    padding: "0.9rem 1.4rem", borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", gap: "0.75rem",
  },
  notifTitle: {
    fontFamily: "'Cinzel',serif", fontSize: "0.7rem",
    letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase",
  },
  comingSoonBadge: {
    padding: "0.15rem 0.55rem", borderRadius: 100, fontSize: "0.65rem",
    fontFamily: "'Cinzel',serif", letterSpacing: "0.06em",
    background: C.blueSoft, color: C.blue, border: `1px solid ${C.blue}44`,
  },
  notifBody: { padding: "1.25rem 1.4rem" },
  notifDesc: {
    fontSize: "0.88rem", color: C.textMuted, fontStyle: "italic",
    marginBottom: "1.1rem", lineHeight: 1.6,
  },
  emailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.75rem" },
  emailRow:  { display: "flex", flexDirection: "column", gap: "0.3rem" },
  emailLabel:{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.1em", color: C.textFaint, textTransform: "uppercase" },
  emailInput:{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 6, color: C.textFaint,
    fontFamily: "'Crimson Pro',serif", fontSize: "0.9rem",
    padding: "0.45rem 0.75rem", outline: "none", opacity: 0.6, cursor: "not-allowed",
  },
  sendBtn: {
    padding: "0.55rem 1.25rem", borderRadius: 8,
    border: `1px solid ${C.border}`, background: "transparent",
    color: C.textFaint, fontFamily: "'Cinzel',serif",
    fontSize: "0.75rem", letterSpacing: "0.08em",
    cursor: "not-allowed", opacity: 0.5,
  },
  comingSoonNote: {
    fontSize: "0.8rem", color: C.textFaint, fontStyle: "italic",
  },
};
