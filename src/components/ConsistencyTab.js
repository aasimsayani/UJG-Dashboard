import { C } from "../constants";
import { displayName, fmtDate } from "../utils/helpers";
import { Avatar, StatusBadge, Panel, StatCard } from "./ui";

// ─── GROUP LIST ───────────────────────────────────────────────────────────────
function MemberGroup({ title, members, accentColor, emptyMsg }) {
  return (
    <Panel title={title} count={`${members.length} members`}>
      <div style={{ padding: "1rem 1.4rem", maxHeight: 340, overflowY: "auto" }}>
        {members.length === 0
          ? <div style={{ textAlign: "center", padding: "2rem", color: C.textFaint, fontStyle: "italic" }}>{emptyMsg}</div>
          : <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {members.map(rec => (
                <div key={rec.senderKey} style={S.row}>
                  <Avatar name={rec.senderKey} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {displayName(rec.senderKey)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: C.textMuted, marginTop: 1 }}>
                      {rec.storeName !== "Not Available" ? rec.storeName : "—"}
                      {rec.lastActiveDate
                        ? <span style={{ marginLeft: "0.4rem", color: C.textFaint }}>Last active: {fmtDate(rec.lastActiveDate)}</span>
                        : <span style={{ marginLeft: "0.4rem", color: C.textFaint }}>Never messaged</span>
                      }
                    </div>
                  </div>
                  <StatusBadge status={rec.contributionStatus} />
                </div>
              ))}
            </div>
        }
      </div>
    </Panel>
  );
}

// ─── CONSISTENCY TAB ──────────────────────────────────────────────────────────
export default function ConsistencyTab({ analytics }) {
  const { memberDirectory } = analytics;
  const all     = [...memberDirectory.values()];
  const active  = all.filter(r => r.contributionStatus === "Active").sort((a, b) => b.totalMessages - a.totalMessages);
  const atRisk  = all.filter(r => r.contributionStatus === "At-Risk").sort((a, b) => b.totalMessages - a.totalMessages);
  const silent  = all.filter(r => r.contributionStatus === "Silent").sort((a, b) => (b.totalMessages || 0) - (a.totalMessages || 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Summary counts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "1rem" }}>
        <StatCard label="Active"   value={active.length}  sub="messaged last 30 days"    accentColor={C.green} />
        <StatCard label="At-Risk"  value={atRisk.length}  sub="30–60 days inactive"       accentColor={C.orange} />
        <StatCard label="Silent"   value={silent.length}  sub="no msg or >60 days"        accentColor={C.red} />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", padding: "0.7rem 1rem", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10 }}>
        {[
          { color: C.green,  label: "Active",  rule: "Sent a message within the last 30 days" },
          { color: C.orange, label: "At-Risk", rule: "No messages in the past 30–60 days" },
          { color: C.red,    label: "Silent",  rule: "No messages since joining, or >60 days inactive" },
        ].map(({ color, label, rule }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.65rem", color, letterSpacing: "0.08em" }}>{label}</span>
            <span style={{ fontSize: "0.75rem", color: C.textFaint }}>— {rule}</span>
          </div>
        ))}
      </div>

      {/* Member groups */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem" }}>
        <MemberGroup title="Active Members"   members={active} accentColor={C.green}  emptyMsg="No active members" />
        <MemberGroup title="At-Risk Members"  members={atRisk} accentColor={C.orange} emptyMsg="No at-risk members" />
        <MemberGroup title="Silent Members"   members={silent} accentColor={C.red}    emptyMsg="No silent members" />
      </div>
    </div>
  );
}

const S = {
  row: { display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.5rem 0.55rem", borderRadius: 8, background: C.surface },
};
