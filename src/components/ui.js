import { C } from "../constants";
import { initials } from "../utils/helpers";

/* ── Badges ── */
export const BadgeGold   = ({ children }) => <span style={badge(C.accentSoft, C.accent,  C.accent  + "44")}>{children}</span>;
export const BadgeGreen  = ({ children }) => <span style={badge(C.greenSoft,  C.green,   C.green   + "44")}>{children}</span>;
export const BadgeRed    = ({ children }) => <span style={badge(C.redSoft,    C.red,     C.red     + "44")}>{children}</span>;
export const BadgePurple = ({ children }) => <span style={badge(C.purpleSoft, C.purple,  C.purple  + "44")}>{children}</span>;

function badge(bg, color, borderColor) {
  return {
    display: "inline-flex", alignItems: "center",
    padding: "0.18rem 0.55rem", borderRadius: 100,
    fontSize: "0.68rem", fontFamily: "'Cinzel', serif",
    letterSpacing: "0.05em", background: bg, color, border: `1px solid ${borderColor}`,
  };
}

/* ── Member Row ── */
export function MemberRow({ member, rank, maxMsgs, barColor, avatarBg, extra }) {
  const pct = maxMsgs > 0 ? (member.messageCount / maxMsgs) * 100 : 0;
  const rankColor = rank === 0 ? "#ffd700" : rank === 1 ? "#c0c0c0" : rank === 2 ? "#cd7f32" : C.textFaint;
  return (
    <div style={S.row}>
      {rank !== undefined && (
        <div style={{ ...S.rank, color: rankColor }}>{rank + 1}</div>
      )}
      <div style={{ ...S.avatar, background: avatarBg || `linear-gradient(135deg, ${C.accent}, #8b5e00)` }}>
        {initials(member.sender)}
      </div>
      <div style={S.info}>
        <div style={S.name}>{member.sender.split(/\s+/)[0]}</div>
        <div style={S.meta}>{member.activeDays}d active · {member.replies} replies</div>
      </div>
      {extra}
      <div style={S.barWrap}>
        <div style={S.barBg}>
          <div style={{ ...S.bar, width: `${pct}%`, background: barColor || C.accent }} />
        </div>
        <div style={{ ...S.barCount, color: barColor || C.accent }}>{member.messageCount}</div>
      </div>
    </div>
  );
}

/* ── Ring Gauge ── */
export function Ring({ value, max, color, label, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  const dash = pct * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize={14} fontFamily="'Cinzel',serif" fontWeight="700"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}>
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.1em", color: C.textMuted, textTransform: "uppercase", textAlign: "center" }}>
        {label}
      </div>
    </div>
  );
}

/* ── Trend Bars ── */
export function TrendBars({ data, activeMonth }) {
  const mx = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
      {data.map((d) => (
        <div key={d.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: 18, minHeight: 4,
            height: Math.max(4, (d.count / mx) * 44),
            borderRadius: "3px 3px 0 0",
            background: d.month === activeMonth ? C.accent : C.accent + "66",
            transition: "background 0.2s",
          }} title={`${d.month}: ${d.count}`} />
          <div style={{ fontSize: "0.58rem", color: C.textFaint }}>{d.month.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Panel ── */
export function Panel({ title, count, children, style }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }}>
      <div style={{ padding: "0.9rem 1.4rem", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.7rem", letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase" }}>{title}</div>
        {count && <div style={{ fontSize: "0.82rem", color: C.textFaint, fontStyle: "italic" }}>{count}</div>}
      </div>
      {children}
    </div>
  );
}

const S = {
  row: { display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.55rem 0.65rem", borderRadius: 8, background: C.surface },
  rank: { fontFamily: "'Cinzel',serif", fontSize: "0.68rem", width: 18, textAlign: "center", flexShrink: 0 },
  avatar: { width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: "0.68rem", fontWeight: 700, color: "#0a0a0f", flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: "0.9rem", color: C.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  meta: { fontSize: "0.75rem", color: C.textMuted, marginTop: "0.1rem" },
  barWrap: { width: 72, flexShrink: 0 },
  barBg: { height: 3, background: C.border, borderRadius: 2, overflow: "hidden" },
  bar: { height: "100%", borderRadius: 2, transition: "width 0.5s ease" },
  barCount: { fontFamily: "'Cinzel',serif", fontSize: "0.72rem", textAlign: "right", marginTop: 2 },
};
