import { useState } from "react";
import { C } from "../constants";
import { fmtMonth, displayName, initials, fmtDate, exportToXlsx, exportToCsv } from "../utils/helpers";
import { StatCard, Ring, TrendBars, Panel, Avatar, StatusBadge } from "./ui";

// ─── EXPORT BUTTON GROUP ─────────────────────────────────────────────────────
function ExportButtons({ analytics }) {
  const [loading, setLoading] = useState(false);

  const handleXlsx = async () => {
    setLoading(true);
    try {
      await exportToXlsx(analytics.memberDirectory, analytics);
    } catch (e) {
      console.error("Export failed:", e);
      exportToCsv(analytics.memberDirectory);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
      <button
        style={{ ...S.exportBtn, opacity: loading ? 0.6 : 1, cursor: loading ? "wait" : "pointer" }}
        onClick={handleXlsx}
        disabled={loading}
        title="Download full member directory as Excel"
      >
        {loading ? "Exporting…" : "📥 Export Data"}
      </button>
      <button style={S.exportBtnSec} onClick={() => exportToCsv(analytics.memberDirectory)} title="Download as CSV">
        CSV
      </button>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
export default function OverviewTab({ report, analytics, selMonth, trendData }) {
  const dir     = analytics.memberDirectory;
  const topList = [...dir.values()]
    .filter(r => r.totalMessages > 0)
    .sort((a, b) => b.totalMessages - a.totalMessages)
    .slice(0, 8);

  const silentList = [...dir.values()].filter(r => r.contributionStatus === "Silent");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Header row: title + export */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.7rem", letterSpacing: "0.14em", color: C.textFaint, textTransform: "uppercase" }}>
          {fmtMonth(selMonth)} · Community Overview
        </div>
        <ExportButtons analytics={analytics} />
      </div>

      {/* Primary stat row */}
      <div style={S.statGrid}>
        <StatCard label="Total Members"  value={report.totalMembers} sub="in directory"                       accentColor={C.accent} />
        <StatCard label="Active"         value={report.activeCount}  sub="messaged last 30 days"              accentColor={C.green} />
        <StatCard label="At-Risk"        value={report.atRiskCount}  sub="30–60 days inactive"                accentColor={C.orange} />
        <StatCard label="Silent"         value={report.silentCount}  sub="no messages or >60 days"            accentColor={C.red} />
      </div>

      {/* Health rings + trend */}
      <div style={S.grid3}>
        <Panel title="Contribution Health">
          <div style={{ padding: "1.5rem 1.4rem", display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Ring value={report.activeCount}  max={report.totalMembers} color={C.green}  label="Active" />
            <Ring value={report.atRiskCount}  max={report.totalMembers} color={C.orange} label="At-Risk" />
            <Ring value={report.silentCount}  max={report.totalMembers} color={C.red}    label="Silent" />
          </div>
          {trendData.length > 1 && (
            <div style={{ padding: "0 1.4rem 1.1rem", borderTop: `1px solid ${C.border}`, paddingTop: "0.9rem" }}>
              <div style={S.trendLabel}>Message Volume</div>
              <TrendBars data={trendData} activeMonth={selMonth} />
            </div>
          )}
        </Panel>

        {/* Top contributors */}
        <Panel title="Top Contributors" count={`all time`}>
          <div style={{ ...S.body, ...S.scroll }}>
            {topList.length === 0
              ? <div style={S.empty}>No messages yet</div>
              : <div style={S.mList}>
                  {topList.map((rec, i) => {
                    const rankColor = i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : C.textFaint;
                    const maxMsgs   = topList[0].totalMessages || 1;
                    return (
                      <div style={S.mRow} key={rec.senderKey}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.66rem", color: rankColor, width: 16, textAlign: "center", flexShrink: 0 }}>{i + 1}</div>
                        <Avatar name={rec.senderKey} size={28} />
                        <div style={S.mInfo}>
                          <div style={S.mName}>{displayName(rec.senderKey)}</div>
                          <div style={S.mMeta}>{rec.storeName !== "Not Available" ? rec.storeName : rec.location !== "Not Available" ? rec.location : fmtDate(rec.lastActiveDate)}</div>
                        </div>
                        <div style={{ width: 64, flexShrink: 0 }}>
                          <div style={S.barBg}><div style={{ ...S.bar, width: `${(rec.totalMessages / maxMsgs) * 100}%` }} /></div>
                          <div style={S.barCount}>{rec.totalMessages}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        </Panel>

        {/* Silent members */}
        <Panel title="Silent Members" count={`${silentList.length}`}>
          <div style={{ ...S.body, ...S.scroll }}>
            {silentList.length === 0
              ? <div style={S.empty}>Everyone has contributed 🎉</div>
              : <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {silentList.map(rec => (
                    <div key={rec.senderKey} style={S.chip}>
                      <div style={S.dot} />
                      {displayName(rec.senderKey)}
                    </div>
                  ))}
                </div>
            }
          </div>
        </Panel>
      </div>
    </div>
  );
}

const S = {
  statGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "1rem" },
  grid3:      { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.25rem" },
  body:       { padding: "1.1rem 1.4rem" },
  scroll:     { maxHeight: 320, overflowY: "auto" },
  mList:      { display: "flex", flexDirection: "column", gap: "0.4rem" },
  mRow:       { display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.6rem", borderRadius: 8, background: C.surface },
  mInfo:      { flex: 1, minWidth: 0 },
  mName:      { fontSize: "0.88rem", color: C.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  mMeta:      { fontSize: "0.73rem", color: C.textMuted, marginTop: 1 },
  barBg:      { height: 3, background: C.border, borderRadius: 2, overflow: "hidden" },
  bar:        { height: "100%", background: C.accent, borderRadius: 2 },
  barCount:   { fontFamily: "'Cinzel',serif", fontSize: "0.7rem", color: C.accent, textAlign: "right", marginTop: 2 },
  chip:       { display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.28rem 0.65rem", borderRadius: 100, background: C.surface, border: `1px solid ${C.border}`, fontSize: "0.8rem", color: C.textMuted },
  dot:        { width: 6, height: 6, borderRadius: "50%", background: C.textFaint, flexShrink: 0 },
  trendLabel: { fontFamily: "'Cinzel',serif", fontSize: "0.58rem", letterSpacing: "0.1em", color: C.textFaint, marginBottom: "0.5rem", textTransform: "uppercase" },
  empty:      { textAlign: "center", padding: "2rem", color: C.textFaint, fontStyle: "italic", fontSize: "0.9rem" },
  exportBtn:  {
    padding: "0.5rem 1.1rem", borderRadius: 8, border: "none",
    background: `linear-gradient(135deg, #b8860b, ${C.accent}, #daa520)`,
    color: "#0a0a0f", fontFamily: "'Cinzel',serif", fontSize: "0.75rem",
    fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
    boxShadow: "0 2px 12px #c9a84c33",
  },
  exportBtnSec: {
    padding: "0.5rem 0.85rem", borderRadius: 8,
    border: `1px solid ${C.border}`, background: "transparent",
    color: C.textMuted, fontFamily: "'Cinzel',serif",
    fontSize: "0.72rem", letterSpacing: "0.08em", cursor: "pointer",
  },
};
