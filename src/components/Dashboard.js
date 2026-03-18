import { useState, useCallback } from "react";
import { C, TABS } from "../constants";
import { parseExport, computeAnalytics, getReport } from "../utils/parser";
import { fmtMonth } from "../utils/helpers";
import { Signature } from "./ui";
import OverviewTab     from "./OverviewTab";
import DirectoryTab    from "./DirectoryTab";
import ConsistencyTab  from "./ConsistencyTab";

// ─── UPLOAD SCREEN ────────────────────────────────────────────────────────────
function UploadScreen({ groups, onFiles, onRemoveGroup, includeDeals, setIncludeDeals }) {
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState(null);

  const validate = (files) => {
    const bad = files.filter(f => !f.name.endsWith(".txt"));
    if (bad.length) { setError("Only .txt WhatsApp export files are accepted."); return false; }
    setError(null);
    return true;
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const files = [...e.dataTransfer.files];
    if (validate(files)) onFiles(files);
  };

  const onInput = (e) => {
    const files = [...e.target.files];
    if (validate(files)) onFiles(files);
    e.target.value = "";
  };

  return (
    <div style={S.uploadZone}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div style={{ textAlign: "center" }}>
        <div style={S.uploadLogo}>UMMA</div>
        <div style={{ ...S.uploadLogo, fontSize: "1rem", letterSpacing: "0.32em", opacity: 0.65, marginTop: "0.2rem" }}>
          COMMUNITY ANALYTICS
        </div>
      </div>

      <div style={S.divider} />
      <div style={S.tagline}>WhatsApp Group Intelligence Dashboard</div>

      <label style={{ ...S.dropArea, borderColor: dragging ? C.accent : C.border }}>
        <input type="file" accept=".txt" multiple style={{ display: "none" }} onChange={onInput} />
        <div style={{ fontSize: "2rem", marginBottom: "0.65rem", opacity: 0.65 }}>📂</div>
        <div style={{ fontSize: "1rem", color: C.textMuted, marginBottom: "0.35rem" }}>Drop WhatsApp export here</div>
        <div style={{ fontSize: "0.82rem", color: C.textFaint }}>.txt only · multiple groups supported</div>
      </label>

      {/* Deals feature flag */}
      <label style={S.dealsToggle}>
        <input
          type="checkbox"
          checked={includeDeals}
          onChange={e => setIncludeDeals(e.target.checked)}
          style={{ accentColor: C.accent, width: 14, height: 14, cursor: "pointer" }}
        />
        <span style={{ fontSize: "0.82rem", color: includeDeals ? C.text : C.textMuted, transition: "color 0.2s" }}>
          Include Deals Analysis
        </span>
        <span style={{ fontSize: "0.72rem", color: C.textFaint, fontStyle: "italic" }}>
          (prepares dataset for future deals tab)
        </span>
      </label>

      {error && (
        <div style={{ color: C.red, fontSize: "0.83rem", background: C.redSoft, padding: "0.5rem 1rem", borderRadius: 8, border: `1px solid ${C.red}44` }}>
          {error}
        </div>
      )}

      {groups.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center", maxWidth: 520 }}>
          {groups.map((g, i) => (
            <div key={i} style={S.groupChip}>
              <span>📱</span>
              <span>{g.name}</span>
              <button style={S.chipRemove} onClick={() => onRemoveGroup(i)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ color: C.textFaint, fontSize: "0.8rem", fontStyle: "italic", textAlign: "center", maxWidth: 340, lineHeight: 1.7 }}>
        Export via <span style={{ color: C.textMuted }}>Chat Settings → Export Chat → Without Media</span>
      </div>

      <Signature />
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [groups,        setGroups]        = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [selMonth,      setSelMonth]      = useState("");
  const [tab,           setTab]           = useState("overview");
  const [includeDeals,  setIncludeDeals]  = useState(false);

  const handleFiles = useCallback((files) => {
    for (const file of files) {
      if (!file.name.endsWith(".txt")) continue;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const msgs = parseExport(e.target.result, includeDeals);
          setGroups(prev => {
            const next = [...prev, { name: file.name.replace(/\.[^.]+$/, ""), messages: msgs }];
            const all  = next.flatMap(g => g.messages);
            const a    = computeAnalytics(all);
            setAnalytics(a);
            setSelMonth(sm => sm || (a.months.length ? a.months[a.months.length - 1] : ""));
            return next;
          });
        } catch (err) {
          console.error("Parse error:", file.name, err);
        }
      };
      reader.readAsText(file);
    }
  }, [includeDeals]);

  const removeGroup = (i) => {
    const next = groups.filter((_, j) => j !== i);
    setGroups(next);
    if (next.length === 0) { setAnalytics(null); setSelMonth(""); return; }
    const a = computeAnalytics(next.flatMap(g => g.messages));
    setAnalytics(a);
  };

  const reset = () => { setGroups([]); setAnalytics(null); setSelMonth(""); setTab("overview"); };

  if (!analytics) {
    return (
      <UploadScreen
        groups={groups} onFiles={handleFiles} onRemoveGroup={removeGroup}
        includeDeals={includeDeals} setIncludeDeals={setIncludeDeals}
      />
    );
  }

  const report    = getReport(analytics);
  const trendData = analytics.months.map(m => ({ month: m, count: (analytics.byMonth[m] || []).length }));

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.headerLogo}>UMMA Analytics</div>
          <div style={S.headerSub}>Community Intelligence · Stronger Together</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <select style={S.monthSel} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
            {analytics.months.map(m => <option key={m} value={m}>{fmtMonth(m)}</option>)}
          </select>
          <button style={S.resetBtn} onClick={reset} title="Upload new files">↩ New</button>
        </div>
      </div>

      {/* Groups banner */}
      <div style={S.banner}>
        <span style={S.bannerLabel}>Loaded:</span>
        {groups.map((g, i) => <span style={S.tag} key={i}>📱 {g.name}</span>)}
        <label style={{ cursor: "pointer" }}>
          <input type="file" accept=".txt" multiple style={{ display: "none" }}
            onChange={e => { handleFiles([...e.target.files]); e.target.value = ""; }} />
          <span style={{ ...S.tag, opacity: 0.6 }}>+ Add Group</span>
        </label>
        {includeDeals && (
          <span style={{ ...S.tag, background: C.purpleSoft, borderColor: C.purple + "44", color: C.purple }}>
            Deals Analysis On
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={S.tabRow}>
        {TABS.map(t => (
          <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={S.main}>
        {tab === "overview"    && <OverviewTab    report={report} analytics={analytics} selMonth={selMonth} trendData={trendData} />}
        {tab === "directory"   && <DirectoryTab   analytics={analytics} />}
        {tab === "consistency" && <ConsistencyTab analytics={analytics} />}
      </div>

      <Signature />
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  uploadZone:  { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.6rem", padding: "2rem", background: "radial-gradient(ellipse at 50% 38%, #1e1a0e 0%, #0a0a0f 65%)" },
  uploadLogo:  { fontFamily: "'Cinzel',serif", fontSize: "2.8rem", fontWeight: 700, color: C.accent, letterSpacing: "0.14em", textShadow: "0 0 40px #c9a84c44" },
  divider:     { width: 90, height: 1, background: "linear-gradient(90deg,transparent,#c9a84c,transparent)" },
  tagline:     { fontFamily: "'Crimson Pro',serif", fontSize: "1rem", fontStyle: "italic", color: C.textMuted },
  dropArea:    { width: "100%", maxWidth: 440, border: `1.5px dashed ${C.border}`, borderRadius: 14, padding: "2.25rem 2rem", textAlign: "center", background: C.surface, cursor: "pointer", transition: "border-color 0.2s" },
  dealsToggle: { display: "flex", alignItems: "center", gap: "0.55rem", cursor: "pointer", userSelect: "none" },
  groupChip:   { display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.38rem 0.85rem", borderRadius: 100, background: C.card, border: `1px solid ${C.border}`, fontSize: "0.86rem", color: C.text },
  chipRemove:  { background: "none", border: "none", color: C.textFaint, cursor: "pointer", fontSize: "1rem", lineHeight: 1, padding: 0 },
  header:      { padding: "1.1rem 2rem", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" },
  headerLogo:  { fontFamily: "'Cinzel',serif", fontSize: "1.4rem", fontWeight: 700, color: C.accent, letterSpacing: "0.1em" },
  headerSub:   { fontFamily: "'Crimson Pro',serif", fontSize: "0.88rem", fontStyle: "italic", color: C.textMuted, marginTop: 2 },
  banner:      { display: "flex", flexWrap: "wrap", gap: "0.45rem", padding: "0.55rem 2rem", background: C.surface, borderBottom: `1px solid ${C.border}`, alignItems: "center" },
  bannerLabel: { fontSize: "0.78rem", color: C.textFaint, fontStyle: "italic", marginRight: "0.35rem" },
  tag:         { padding: "0.18rem 0.6rem", borderRadius: 100, background: C.accentSoft, border: `1px solid ${C.accent}44`, fontSize: "0.73rem", color: C.accent },
  tabRow:      { display: "flex", borderBottom: `1px solid ${C.border}`, background: C.surface, paddingLeft: "2rem", overflowX: "auto" },
  tab:  (a)   => ({ padding: "0.75rem 1.4rem", border: "none", background: "none", color: a ? C.accent : C.textMuted, fontFamily: "'Cinzel',serif", fontSize: "0.72rem", letterSpacing: "0.1em", cursor: "pointer", borderBottom: `2px solid ${a ? C.accent : "transparent"}`, marginBottom: -1, whiteSpace: "nowrap", transition: "color 0.2s" }),
  main:        { padding: "1.75rem 2rem", maxWidth: 1400, margin: "0 auto", width: "100%", flex: 1 },
  monthSel:    { background: C.card, border: `1px solid ${C.border}`, color: C.text, fontFamily: "'Crimson Pro',serif", fontSize: "0.92rem", padding: "0.42rem 0.85rem", borderRadius: 8, cursor: "pointer", outline: "none" },
  resetBtn:    { background: "none", border: `1px solid ${C.border}`, color: C.textMuted, fontFamily: "'Crimson Pro',serif", fontSize: "0.86rem", padding: "0.42rem 0.85rem", borderRadius: 8, cursor: "pointer" },
};
