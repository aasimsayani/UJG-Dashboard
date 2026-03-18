import { C } from "../constants";
import { initials } from "../utils/helpers";

// ─── BADGES ──────────────────────────────────────────────────────────────────
const badge = (bg, color, border) => ({
  display: "inline-flex", alignItems: "center",
  padding: "0.18rem 0.6rem", borderRadius: 100,
  fontSize: "0.68rem", fontFamily: "'Cinzel',serif",
  letterSpacing: "0.05em", background: bg, color, border: `1px solid ${border}`,
});

export const BadgeGold    = ({ children }) => <span style={badge(C.accentSoft,  C.accent,  C.accent  + "44")}>{children}</span>;
export const BadgeGreen   = ({ children }) => <span style={badge(C.greenSoft,   C.green,   C.green   + "44")}>{children}</span>;
export const BadgeRed     = ({ children }) => <span style={badge(C.redSoft,     C.red,     C.red     + "44")}>{children}</span>;
export const BadgePurple  = ({ children }) => <span style={badge(C.purpleSoft,  C.purple,  C.purple  + "44")}>{children}</span>;
export const BadgeOrange  = ({ children }) => <span style={badge(C.orangeSoft,  C.orange,  C.orange  + "44")}>{children}</span>;
export const BadgeBlue    = ({ children }) => <span style={badge(C.blueSoft,    C.blue,    C.blue    + "44")}>{children}</span>;

export function StatusBadge({ status }) {
  if (status === "Active")   return <BadgeGreen>Active</BadgeGreen>;
  if (status === "At-Risk")  return <BadgeOrange>At-Risk</BadgeOrange>;
  return <BadgeRed>Silent</BadgeRed>;
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 32, bg }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: bg || `linear-gradient(135deg, ${C.accent}, #8b5e00)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel',serif", fontSize: size * 0.28,
      fontWeight: 700, color: "#0a0a0f",
    }}>
      {initials(name)}
    </div>
  );
}

// ─── RING GAUGE ───────────────────────────────────────────────────────────────
export function Ring({ value, max, color, label, size = 82 }) {
  const r    = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = max > 0 ? Math.min(value / max, 1) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round" />
        <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize={14} fontFamily="'Cinzel',serif" fontWeight="700"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.1em", color: C.textMuted, textTransform: "uppercase", textAlign: "center" }}>
        {label}
      </div>
    </div>
  );
}

// ─── TREND BARS ───────────────────────────────────────────────────────────────
export function TrendBars({ data, activeMonth }) {
  const mx = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
      {data.map(d => (
        <div key={d.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{
            width: 18, minHeight: 4, height: Math.max(4, (d.count / mx) * 44),
            borderRadius: "3px 3px 0 0",
            background: d.month === activeMonth ? C.accent : C.accent + "55",
          }} title={`${d.month}: ${d.count}`} />
          <div style={{ fontSize: "0.58rem", color: C.textFaint }}>{d.month.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── PANEL ────────────────────────────────────────────────────────────────────
export function Panel({ title, count, children, style }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", ...style }}>
      <div style={{ padding: "0.85rem 1.4rem", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.68rem", letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase" }}>
          {title}
        </div>
        {count !== undefined && (
          <div style={{ fontSize: "0.8rem", color: C.textFaint, fontStyle: "italic" }}>{count}</div>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accentColor }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "1.1rem 1.4rem", borderTop: `2px solid ${accentColor}` }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.6rem", letterSpacing: "0.12em", color: C.textMuted, textTransform: "uppercase", marginBottom: "0.4rem" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "1.9rem", fontWeight: 700, color: accentColor, lineHeight: 1, marginBottom: "0.2rem" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.8rem", color: C.textFaint }}>{sub}</div>
    </div>
  );
}

// ─── SIGNATURE ────────────────────────────────────────────────────────────────
// Subtle persistent creator credit — shown on every page
export function Signature() {
  return (
    <div style={{
      position: "fixed", bottom: "1rem", right: "1.25rem",
      display: "flex", alignItems: "center", gap: "0.4rem",
      opacity: 0.28, transition: "opacity 0.3s",
      pointerEvents: "none", zIndex: 100,
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
      onMouseLeave={e => e.currentTarget.style.opacity = "0.28"}
    >
      <div style={{
        width: 1, height: 18,
        background: `linear-gradient(to bottom, transparent, ${C.accent}, transparent)`,
      }} />
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: "0.6rem",
          letterSpacing: "0.14em", color: C.accent,
          textTransform: "uppercase",
        }}>
          Aasim Sayani
        </div>
        <div style={{
          fontFamily: "'Crimson Pro',serif", fontStyle: "italic",
          fontSize: "0.62rem", color: C.textFaint, letterSpacing: "0.04em",
        }}>
          Fuse Jewelry
        </div>
      </div>
    </div>
  );
}
