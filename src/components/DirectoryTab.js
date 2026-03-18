import { useState } from "react";
import { C } from "../constants";
import { displayName, fmtDate } from "../utils/helpers";
import { Avatar, StatusBadge } from "./ui";

export default function DirectoryTab({ analytics }) {
  const { memberDirectory } = analytics;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const all = [...memberDirectory.values()].sort((a, b) => b.totalMessages - a.totalMessages);

  const counts = {
    all:       all.length,
    Active:    all.filter(r => r.contributionStatus === "Active").length,
    "At-Risk": all.filter(r => r.contributionStatus === "At-Risk").length,
    Silent:    all.filter(r => r.contributionStatus === "Silent").length,
  };

  const visible = all.filter(rec => {
    const matchFilter = filter === "all" || rec.contributionStatus === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (rec.firstName + " " + rec.lastName).toLowerCase().includes(q) ||
      rec.storeName.toLowerCase().includes(q) ||
      rec.location.toLowerCase().includes(q) ||
      rec.senderKey.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center" }}>
        {["all", "Active", "At-Risk", "Silent"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "0.32rem 0.85rem", borderRadius: 100, fontSize: "0.72rem",
            fontFamily: "'Cinzel',serif", letterSpacing: "0.06em", cursor: "pointer",
            border: `1px solid ${filter === f ? C.accent : C.border}`,
            background: filter === f ? C.accentSoft : "transparent",
            color: filter === f ? C.accent : C.textMuted, transition: "all 0.2s",
          }}>
            {f === "all" ? "All" : f} ({counts[f] ?? counts.all})
          </button>
        ))}
        <input
          type="text" placeholder="Search name, store, location…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.text, fontFamily: "'Crimson Pro',serif",
            fontSize: "0.9rem", padding: "0.38rem 0.85rem", outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          {visible.length === 0
            ? <div style={{ textAlign: "center", padding: "3rem", color: C.textFaint, fontStyle: "italic" }}>No members match</div>
            : <table style={S.tbl}>
                <thead><tr>
                  {["Member", "Store", "Location", "Join Date", "Messages", "Last Active", "Status"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {visible.map((rec, i) => (
                    <tr key={rec.senderKey + i}>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Avatar name={rec.senderKey} size={28} />
                          <div>
                            <div style={{ fontWeight: 600, color: C.text, fontSize: "0.88rem" }}>
                              {displayName(rec.senderKey)}
                            </div>
                            {rec.firstName !== "Not Available" && rec.lastName !== "Not Available" && (
                              <div style={{ fontSize: "0.72rem", color: C.textFaint }}>
                                {rec.firstName} {rec.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={{ color: rec.storeName === "Not Available" ? C.textFaint : C.text, fontSize: "0.84rem" }}>
                          {rec.storeName}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ color: rec.location === "Not Available" ? C.textFaint : C.textMuted, fontSize: "0.82rem" }}>
                          {rec.location}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={{ color: rec.joinDateFlagged ? C.orange : C.textMuted, fontSize: "0.8rem" }}>
                          {fmtDate(rec.joinDate)}
                          {rec.joinDateFlagged && <span style={{ marginLeft: "0.25rem" }} title="Could not be detected">⚠</span>}
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
          }
        </div>
      </div>
    </div>
  );
}

const S = {
  tbl: { width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" },
  th:  { fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.1em", color: C.textFaint, textTransform: "uppercase", padding: "0.6rem 0.9rem", textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" },
  td:  { padding: "0.6rem 0.9rem", borderBottom: `1px solid ${C.border}44`, color: C.text, verticalAlign: "middle" },
};
