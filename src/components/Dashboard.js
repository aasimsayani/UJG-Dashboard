import { useState, useCallback } from "react";
import { C, TABS } from "../constants";
import { parseExport, computeAnalytics, getReport } from "../utils/parser";
import { fmtMonth, shortName, initials } from "../utils/helpers";
import { BadgeGold, BadgeGreen, BadgeRed, BadgePurple, Ring, TrendBars, Panel } from "./ui";

/* ─── UPLOAD SCREEN ─────────────────────────────────────────────────────── */
function UploadScreen({ groups, onFiles, onRemoveGroup }) {
  const [dragging, setDragging] = useState(false);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); onFiles([...e.dataTransfer.files]); };

  return (
    <div style={S.uploadZone}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div>
        <div style={S.uploadLogo}>UMMA</div>
        <div style={{ ...S.uploadLogo, fontSize: "1.1rem", letterSpacing: "0.3em", opacity: 0.7, marginTop: "0.2rem" }}>COMMUNITY ANALYTICS</div>
      </div>
      <div style={S.divider} />
      <div style={S.tagline}>WhatsApp Group Intelligence Dashboard</div>

      <label style={{ ...S.dropArea, borderColor: dragging ? C.accent : C.border, cursor: "pointer" }}>
        <input type="file" accept=".txt" multiple style={{ display: "none" }} onChange={(e) => { onFiles([...e.target.files]); e.target.value = ""; }} />
        <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem", opacity: 0.7 }}>📂</div>
        <div style={{ fontSize: "1.05rem", color: C.textMuted, marginBottom: "0.4rem" }}>Drop your WhatsApp export here</div>
        <div style={{ fontSize: "0.85rem", color: C.textFaint }}>.txt files · multiple groups supported</div>
      </label>

      {groups.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", justifyContent: "center", maxWidth: 560 }}>
          {groups.map((g, i) => (
            <div key={i} style={S.groupChip}>
              <span>📱</span>
              <span>{g.name}</span>
              <button style={S.chipRemove} onClick={() => onRemoveGroup(i)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ color: C.textFaint, fontSize: "0.82rem", fontStyle: "italic", textAlign: "center", maxWidth: 360, lineHeight: 1.7 }}>
        Export via <span style={{ color: C.textMuted }}>Chat Settings → Export Chat → Without Media</span>
      </div>
    </div>
  );
}

/* ─── OVERVIEW TAB ──────────────────────────────────────────────────────── */
function OverviewTab({ report, analytics, selMonth, trendData }) {
  const maxMsgs = Math.max(...report.contributors.map((c) => c.messageCount), 1);
  const { months } = analytics;

  return (
    <>
      {/* Stat cards */}
      <div style={S.statGrid}>
        {[
          [C.accent,   "Total Members",     report.totalMembers,  "across all groups"],
          [C.green,    "Active This Month",  report.activeCount,   `${Math.round(report.activeCount / Math.max(report.totalMembers, 1) * 100)}% participation`],
          [C.red,      "Silent Members",     report.inactiveCount, "no messages this month"],
          [C.blue,     "Total Messages",     report.totalMessages, `avg ${report.avgMessages} per member`],
          [C.purple,   "Deal Posts",         report.contributors.reduce((s, c) => s + c.dealsPosted, 0), `from ${report.dealPosters.length} members`],
          ["#fb923c",  "Consistent Members", report.consistent.length, `across ${months.length} month${months.length !== 1 ? "s" : ""}`],
        ].map(([ac, lbl, val, sub]) => (
          <div key={lbl} style={{ ...S.statCard, borderTop: `2px solid ${ac}` }}>
            <div style={S.statLabel}>{lbl}</div>
            <div style={{ ...S.statVal, color: ac }}>{val}</div>
            <div style={S.statSub}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={S.grid3}>
        {/* Health rings */}
        <Panel title="Community Health">
          <div style={{ padding: "1.5rem 1.4rem", display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Ring value={report.activeCount}      max={report.totalMembers}            color={C.green}  label="Active Rate" />
            <Ring value={report.dealPosters.length} max={Math.max(report.activeCount, 1)} color={C.blue}   label="Deal Posters" />
            <Ring value={report.consistent.length} max={report.totalMembers}            color={C.purple} label="Consistent" />
          </div>
          {months.length > 1 && (
            <div style={{ padding: "0 1.4rem 1.1rem", borderTop: `1px solid ${C.border}`, paddingTop: "1rem" }}>
              <div style={S.trendLabel}>Message Trend</div>
              <TrendBars data={trendData} activeMonth={selMonth} />
            </div>
          )}
        </Panel>

        {/* Top contributors */}
        <Panel title="Top Contributors" count={fmtMonth(selMonth)}>
          <div style={{ ...S.panelBody, ...S.scroll }}>
            {report.top.length === 0
              ? <div style={S.empty}>No contributors this month</div>
              : <div style={S.mList}>
                  {report.top.map((m, i) => {
                    const rankColor = i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : C.textFaint;
                    return (
                      <div style={S.mRow} key={m.sender}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.68rem", color: rankColor, width: 18, textAlign: "center", flexShrink: 0 }}>{i + 1}</div>
                        <div style={S.avatar}>{initials(m.sender)}</div>
                        <div style={S.mInfo}>
                          <div style={S.mName}>{shortName(m.sender)}</div>
                          <div style={S.mMeta}>{m.activeDays}d · {m.replies} replies</div>
                        </div>
                        <div style={{ width: 72, flexShrink: 0 }}>
                          <div style={S.barBg}><div style={{ ...S.bar, width: `${(m.messageCount / maxMsgs) * 100}%` }} /></div>
                          <div style={S.barCount}>{m.messageCount}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>
        </Panel>

        {/* Silent members */}
        <Panel title="Silent Members" count={`${report.inactiveCount} members`}>
          <div style={{ ...S.panelBody, ...S.scroll }}>
            {report.silent.length === 0
              ? <div style={S.empty}>Everyone contributed! 🎉</div>
              : <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
                  {report.silent.map((n) => (
                    <div key={n} style={S.silentChip}>
                      <div style={S.silentDot} />
                      {shortName(n)}
                    </div>
                  ))}
                </div>
            }
          </div>
        </Panel>
      </div>

      {/* Low contributors */}
      {report.low.length > 0 && (
        <Panel title="Low Contribution Alert" count="≤3 messages this month" style={{ marginTop: "1.25rem" }}>
          <div style={S.panelBody}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
              {report.low.map((m) => (
                <div key={m.sender} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.65rem", borderRadius: 100, background: C.redSoft, border: `1px solid ${C.red}33`, fontSize: "0.8rem" }}>
                  <span style={{ color: C.red }}>⚠</span>
                  <span style={{ color: C.text }}>{shortName(m.sender)}</span>
                  <span style={{ color: C.textFaint, fontSize: "0.72rem" }}>{m.messageCount} msg</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}

/* ─── MEMBERS TAB ───────────────────────────────────────────────────────── */
function MembersTab({ report, selMonth }) {
  return (
    <Panel title={`Member Metrics — ${fmtMonth(selMonth)}`} count={`${report.contributors.length} active`}>
      <div style={{ overflowX: "auto" }}>
        {report.contributors.length === 0
          ? <div style={S.empty}>No messages for this month</div>
          : <table style={S.tbl}>
              <thead><tr>
                {["#", "Member", "Messages", "Active Days", "Threads", "Replies", "Reply %", "Deals", "Status"].map((h) => (
                  <th style={S.th} key={h}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[...report.contributors].sort((a, b) => b.messageCount - a.messageCount).map((m, i) => {
                  const rr = m.messageCount > 0 ? Math.round(m.replies / m.messageCount * 100) : 0;
                  return (
                    <tr key={m.sender}>
                      <td style={{ ...S.td, fontFamily: "'Cinzel',serif", fontSize: "0.68rem", color: C.textFaint }}>{i + 1}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <div style={{ ...S.avatar, width: 26, height: 26, fontSize: "0.62rem" }}>{initials(m.sender)}</div>
                          <span style={{ fontWeight: 600 }}>{shortName(m.sender)}</span>
                        </div>
                      </td>
                      <td style={{ ...S.td, fontFamily: "'Cinzel',serif", color: C.accent, fontWeight: 700 }}>{m.messageCount}</td>
                      <td style={S.td}>{m.activeDays}</td>
                      <td style={S.td}>{m.threadsStarted}</td>
                      <td style={S.td}>{m.replies}</td>
                      <td style={S.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <div style={{ width: 40, height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${rr}%`, height: "100%", background: C.blue, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: "0.78rem", color: C.textMuted }}>{rr}%</span>
                        </div>
                      </td>
                      <td style={S.td}>{m.dealsPosted > 0 ? <BadgePurple>{m.dealsPosted} deal{m.dealsPosted > 1 ? "s" : ""}</BadgePurple> : <span style={{ color: C.textFaint }}>—</span>}</td>
                      <td style={S.td}>{i < 3 ? <BadgeGold>Top</BadgeGold> : m.messageCount <= 3 ? <BadgeRed>Low</BadgeRed> : <BadgeGreen>Active</BadgeGreen>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        }
      </div>
    </Panel>
  );
}

/* ─── DEALS TAB ─────────────────────────────────────────────────────────── */
function DealsTab({ report, selMonth }) {
  const noDeal = report.contributors.filter((c) => c.dealsPosted === 0);
  return (
    <div style={S.grid2}>
      <Panel title={`Deal Posters — ${fmtMonth(selMonth)}`} count={`${report.dealPosters.length} members`}>
        <div style={{ ...S.panelBody, ...S.scroll }}>
          {report.dealPosters.length === 0
            ? <div style={S.empty}>No deal posts detected</div>
            : <div style={S.mList}>
                {report.dealPosters.map((m, i) => (
                  <div style={S.mRow} key={m.sender}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.68rem", color: C.purple, width: 18, textAlign: "center" }}>{i + 1}</div>
                    <div style={{ ...S.avatar, background: "linear-gradient(135deg,#7c3aed,#4c1d95)" }}>{initials(m.sender)}</div>
                    <div style={S.mInfo}>
                      <div style={S.mName}>{shortName(m.sender)}</div>
                      <div style={S.mMeta}>{m.messageCount} msgs · {m.dealsPosted} deals</div>
                    </div>
                    <BadgePurple>{m.dealsPosted}</BadgePurple>
                  </div>
                ))}
              </div>
          }
        </div>
      </Panel>
      <Panel title="Active, No Deals Posted" count="this month">
        <div style={{ ...S.panelBody, ...S.scroll }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
            {noDeal.map((m) => (
              <div key={m.sender} style={S.silentChip}>
                <div style={{ ...S.silentDot, background: C.purple + "66" }} />
                {shortName(m.sender)}
              </div>
            ))}
            {noDeal.length === 0 && <div style={S.empty}>Everyone posted deals! 💎</div>}
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ─── CONSISTENCY TAB ───────────────────────────────────────────────────── */
function ConsistencyTab({ report, analytics }) {
  const { months, allMembers, mc } = analytics;
  const minM = Math.max(1, Math.ceil(months.length * 0.4));
  const sporadic = allMembers.filter((m) => { const c = mc[m]; return c > 0 && c < minM; }).sort((a, b) => mc[b] - mc[a]);

  return (
    <div style={S.grid2}>
      <Panel title="Consistent Contributors" count="≥40% of months">
        <div style={{ ...S.panelBody, ...S.scroll }}>
          {report.consistent.length === 0
            ? <div style={S.empty}>Need more monthly data</div>
            : <div style={S.mList}>
                {report.consistent.map((name) => {
                  const c = mc[name], pct = Math.round(c / months.length * 100);
                  return (
                    <div style={S.mRow} key={name}>
                      <div style={S.avatar}>{initials(name)}</div>
                      <div style={S.mInfo}>
                        <div style={S.mName}>{shortName(name)}</div>
                        <div style={S.mMeta}>Active {c}/{months.length} months</div>
                      </div>
                      <div style={{ width: 72 }}>
                        <div style={S.barBg}><div style={{ ...S.bar, width: `${pct}%`, background: C.green }} /></div>
                        <div style={{ ...S.barCount, color: C.green }}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </Panel>
      <Panel title="Sporadic / Irregular" count="active but infrequent">
        <div style={{ ...S.panelBody, ...S.scroll }}>
          {sporadic.length === 0
            ? <div style={S.empty}>No irregular members</div>
            : <div style={S.mList}>
                {sporadic.map((name) => {
                  const c = mc[name], pct = Math.round(c / months.length * 100);
                  return (
                    <div style={S.mRow} key={name}>
                      <div style={{ ...S.avatar, background: "linear-gradient(135deg,#78350f,#92400e)" }}>{initials(name)}</div>
                      <div style={S.mInfo}>
                        <div style={S.mName}>{shortName(name)}</div>
                        <div style={S.mMeta}>Active {c}/{months.length} months</div>
                      </div>
                      <div style={{ width: 72 }}>
                        <div style={S.barBg}><div style={{ ...S.bar, width: `${pct}%` }} /></div>
                        <div style={S.barCount}>{pct}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </Panel>
    </div>
  );
}

/* ─── ALL MEMBERS TAB ───────────────────────────────────────────────────── */
function AllMembersTab({ analytics, selMonth }) {
  const { months, mms, allMembers, mc } = analytics;
  const sorted = [...allMembers].sort((a, b) => (mms[selMonth]?.[b]?.messageCount || 0) - (mms[selMonth]?.[a]?.messageCount || 0));
  return (
    <Panel title="All Members" count={`${allMembers.length} total`}>
      <div style={{ overflowX: "auto" }}>
        <table style={S.tbl}>
          <thead><tr>
            {["Member", "This Month", "Active Months", "Consistency", "All-Time Deals", "Status"].map((h) => (
              <th style={S.th} key={h}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {sorted.map((name) => {
              const tm  = mms[selMonth]?.[name];
              const c   = mc[name];
              const pct = Math.round(c / months.length * 100);
              const atd = months.reduce((s, m) => s + (mms[m]?.[name]?.dealsPosted || 0), 0);
              const isActive = !!(tm?.messageCount > 0);
              const isCon    = c >= Math.ceil(months.length * 0.4);
              return (
                <tr key={name}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <div style={{ ...S.avatar, width: 26, height: 26, fontSize: "0.62rem" }}>{initials(name)}</div>
                      <span style={{ fontWeight: 600 }}>{shortName(name)}</span>
                    </div>
                  </td>
                  <td style={{ ...S.td, fontFamily: "'Cinzel',serif", color: isActive ? C.accent : C.textFaint, fontWeight: isActive ? 700 : 400 }}>{tm?.messageCount || 0}</td>
                  <td style={S.td}>{c}/{months.length}</td>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <div style={{ width: 40, height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: isCon ? C.green : C.accent, borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: "0.78rem", color: C.textMuted }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={S.td}>{atd > 0 ? <BadgePurple>{atd}</BadgePurple> : <span style={{ color: C.textFaint }}>—</span>}</td>
                  <td style={S.td}>{!isActive ? <BadgeRed>Silent</BadgeRed> : isCon ? <BadgeGreen>Consistent</BadgeGreen> : <BadgeGold>Active</BadgeGold>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ─── MAIN DASHBOARD ────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [groups, setGroups]       = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selMonth, setSelMonth]   = useState("");
  const [tab, setTab]             = useState("overview");

  const handleFiles = useCallback((files) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const msgs = parseExport(e.target.result);
        setGroups((prev) => {
          const next = [...prev, { name: file.name.replace(/\.[^.]+$/, ""), messages: msgs }];
          const all  = next.flatMap((g) => g.messages);
          const a    = computeAnalytics(all);
          setAnalytics(a);
          setSelMonth((sm) => sm || (a.months.length ? a.months[a.months.length - 1] : ""));
          return next;
        });
      };
      reader.readAsText(file);
    }
  }, []);

  const removeGroup = (i) => {
    const next = groups.filter((_, j) => j !== i);
    setGroups(next);
    if (next.length === 0) { setAnalytics(null); setSelMonth(""); return; }
    const a = computeAnalytics(next.flatMap((g) => g.messages));
    setAnalytics(a);
  };

  const reset = () => { setGroups([]); setAnalytics(null); setSelMonth(""); setTab("overview"); };

  if (!analytics) {
    return <UploadScreen groups={groups} onFiles={handleFiles} onRemoveGroup={removeGroup} />;
  }

  const report    = getReport(analytics, selMonth);
  const trendData = analytics.months.map((m) => ({ month: m, count: (analytics.byMonth[m] || []).length }));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.headerLogo}>UMMA Analytics</div>
          <div style={S.headerSub}>Community Intelligence · Stronger Together</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <select style={S.monthSel} value={selMonth} onChange={(e) => setSelMonth(e.target.value)}>
            {analytics.months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
          </select>
          <button style={S.resetBtn} onClick={reset}>↩ New</button>
        </div>
      </div>

      {/* Groups banner */}
      <div style={S.banner}>
        <span style={S.bannerLabel}>Groups loaded:</span>
        {groups.map((g, i) => <span style={S.tag} key={i}>📱 {g.name}</span>)}
        <label style={{ cursor: "pointer" }}>
          <input type="file" accept=".txt" multiple style={{ display: "none" }} onChange={(e) => { handleFiles([...e.target.files]); e.target.value = ""; }} />
          <span style={{ ...S.tag, opacity: 0.65 }}>+ Add Group</span>
        </label>
      </div>

      {/* Content */}
      <div style={S.main}>
        <div style={S.tabs}>
          {TABS.map((t) => (
            <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
          ))}
        </div>

        {tab === "overview"     && <OverviewTab     report={report} analytics={analytics} selMonth={selMonth} trendData={trendData} />}
        {tab === "members"      && <MembersTab      report={report} selMonth={selMonth} />}
        {tab === "deals"        && <DealsTab        report={report} selMonth={selMonth} />}
        {tab === "consistency"  && <ConsistencyTab  report={report} analytics={analytics} />}
        {tab === "all members"  && <AllMembersTab   analytics={analytics} selMonth={selMonth} />}
      </div>
    </div>
  );
}

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const S = {
  uploadZone:  { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.75rem", padding: "2rem", background: "radial-gradient(ellipse at 50% 40%, #1e1a0e 0%, #0a0a0f 65%)" },
  uploadLogo:  { fontFamily: "'Cinzel',serif", fontSize: "3rem", fontWeight: 700, color: C.accent, letterSpacing: "0.12em", textShadow: "0 0 40px #c9a84c44", textAlign: "center" },
  divider:     { width: 100, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" },
  tagline:     { fontFamily: "'Crimson Pro',serif", fontSize: "1.1rem", fontStyle: "italic", color: C.textMuted },
  dropArea:    { width: "100%", maxWidth: 460, border: `1.5px dashed ${C.border}`, borderRadius: 16, padding: "2.5rem 2rem", textAlign: "center", background: C.surface, transition: "border-color 0.2s" },
  groupChip:   { display: "flex", alignItems: "center", gap: "0.45rem", padding: "0.4rem 0.9rem", borderRadius: 100, background: C.card, border: `1px solid ${C.border}`, fontSize: "0.88rem", color: C.text },
  chipRemove:  { background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: "1rem", lineHeight: 1 },
  header:      { padding: "1.25rem 2rem", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" },
  headerLogo:  { fontFamily: "'Cinzel',serif", fontSize: "1.5rem", fontWeight: 700, color: C.accent, letterSpacing: "0.1em" },
  headerSub:   { fontFamily: "'Crimson Pro',serif", fontSize: "0.9rem", fontStyle: "italic", color: C.textMuted, marginTop: "0.1rem" },
  banner:      { display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.6rem 2rem", background: C.surface, borderBottom: `1px solid ${C.border}`, alignItems: "center" },
  bannerLabel: { fontSize: "0.8rem", color: C.textFaint, fontStyle: "italic", marginRight: "0.4rem" },
  tag:         { padding: "0.2rem 0.65rem", borderRadius: 100, background: C.accentSoft, border: `1px solid ${C.accent}44`, fontSize: "0.75rem", color: C.accent },
  main:        { padding: "1.5rem 2rem", maxWidth: 1400, margin: "0 auto", width: "100%" },
  tabs:        { display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: "1.75rem", overflowX: "auto" },
  tab:  (a)   => ({ padding: "0.7rem 1.3rem", border: "none", background: "none", color: a ? C.accent : C.textMuted, fontFamily: "'Cinzel',serif", fontSize: "0.75rem", letterSpacing: "0.08em", cursor: "pointer", borderBottom: `2px solid ${a ? C.accent : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap", transition: "color 0.2s" }),
  statGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem", marginBottom: "1.75rem" },
  statCard:    { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.1rem 1.4rem" },
  statLabel:   { fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "0.4rem" },
  statVal:     { fontFamily: "'Cinzel',serif", fontSize: "1.9rem", fontWeight: 700, lineHeight: 1, marginBottom: "0.2rem" },
  statSub:     { fontSize: "0.8rem", color: C.textFaint },
  grid2:       { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "1.25rem" },
  grid3:       { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.25rem", marginBottom: "1.25rem" },
  panelBody:   { padding: "1.1rem 1.4rem" },
  scroll:      { maxHeight: 340, overflowY: "auto" },
  mList:       { display: "flex", flexDirection: "column", gap: "0.45rem" },
  mRow:        { display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.55rem 0.65rem", borderRadius: 8, background: C.surface },
  avatar:      { width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},#8b5e00)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: "0.68rem", fontWeight: 700, color: "#0a0a0f", flexShrink: 0 },
  mInfo:       { flex: 1, minWidth: 0 },
  mName:       { fontSize: "0.9rem", color: C.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  mMeta:       { fontSize: "0.75rem", color: C.textMuted, marginTop: "0.1rem" },
  barBg:       { height: 3, background: C.border, borderRadius: 2, overflow: "hidden" },
  bar:         { height: "100%", background: C.accent, borderRadius: 2, transition: "width 0.5s ease" },
  barCount:    { fontFamily: "'Cinzel',serif", fontSize: "0.72rem", color: C.accent, textAlign: "right", marginTop: 2 },
  silentChip:  { display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.3rem 0.65rem", borderRadius: 100, background: C.surface, border: `1px solid ${C.border}`, fontSize: "0.8rem", color: C.textMuted },
  silentDot:   { width: 6, height: 6, borderRadius: "50%", background: C.textFaint, flexShrink: 0 },
  trendLabel:  { fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.1em", color: C.textFaint, marginBottom: "0.5rem", textTransform: "uppercase" },
  empty:       { textAlign: "center", padding: "2.5rem", color: C.textFaint, fontStyle: "italic", fontSize: "0.95rem" },
  tbl:         { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" },
  th:          { fontFamily: "'Cinzel',serif", fontSize: "0.62rem", letterSpacing: "0.1em", color: C.textFaint, textTransform: "uppercase", padding: "0.55rem 0.7rem", textAlign: "left", borderBottom: `1px solid ${C.border}` },
  td:          { padding: "0.55rem 0.7rem", borderBottom: `1px solid ${C.border}44`, color: C.text, verticalAlign: "middle" },
  monthSel:    { background: C.card, border: `1px solid ${C.border}`, color: C.text, fontFamily: "'Crimson Pro',serif", fontSize: "0.95rem", padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer", outline: "none" },
  resetBtn:    { background: "none", border: `1px solid ${C.border}`, color: C.textMuted, fontFamily: "'Crimson Pro',serif", fontSize: "0.88rem", padding: "0.45rem 0.9rem", borderRadius: 8, cursor: "pointer" },
};
