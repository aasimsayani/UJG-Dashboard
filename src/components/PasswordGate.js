import { useState } from "react";
import { C } from "../constants";
import { checkPassword } from "../utils/helpers";

const shakeKf = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-10px); }
    40%      { transform: translateX(10px); }
    60%      { transform: translateX(-8px); }
    80%      { transform: translateX(8px); }
  }
`;

export default function PasswordGate({ onUnlock }) {
  const [val, setVal]     = useState("");
  const [err, setErr]     = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (checkPassword(val)) {
      onUnlock();
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setVal("");
    }
  };

  return (
    <div style={styles.gate}>
      <style>{shakeKf}</style>
      <div style={styles.emblem}>
        <span style={{ fontSize: "2rem" }}>☪</span>
      </div>
      <div style={styles.title}>UMMA</div>
      <div style={styles.sub}>Community Analytics · Members Only</div>
      <div style={styles.divider} />

      <div style={{ ...styles.card, animation: shake ? "shake 0.5s ease" : "none" }}>
        <div>
          <div style={styles.label}>Access Password</div>
          <input
            style={{ ...styles.input, borderColor: err ? C.red : C.border }}
            type="password"
            placeholder="Enter password…"
            value={val}
            onChange={(e) => { setVal(e.target.value); setErr(false); }}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            autoFocus
          />
        </div>
        {err && <div style={styles.error}>Incorrect password — please try again</div>}
        <button style={styles.btn} onClick={attempt}>ENTER DASHBOARD</button>
        <div style={styles.hint}>Contact your group admin for access</div>
      </div>
    </div>
  );
}

const styles = {
  gate: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "radial-gradient(ellipse at 50% 35%, #1e1a0e 0%, #0a0a0f 65%)",
    padding: "2rem",
  },
  emblem: {
    width: 72, height: 72, borderRadius: "50%",
    border: "1.5px solid #c9a84c66", display: "flex",
    alignItems: "center", justifyContent: "center",
    marginBottom: "1.75rem", background: "#c9a84c0a",
    boxShadow: "0 0 40px #c9a84c22",
  },
  title: {
    fontFamily: "'Cinzel', serif", fontSize: "2.6rem", fontWeight: 700,
    color: C.accent, letterSpacing: "0.14em",
    textShadow: "0 0 40px #c9a84c44", marginBottom: "0.3rem", textAlign: "center",
  },
  sub: {
    fontFamily: "'Crimson Pro', serif", fontStyle: "italic",
    fontSize: "1rem", color: C.textMuted, letterSpacing: "0.06em",
    marginBottom: "2.5rem", textAlign: "center",
  },
  divider: {
    width: 80, height: 1,
    background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
    margin: "0 auto 2.5rem",
  },
  card: {
    width: "100%", maxWidth: 380, background: C.surface,
    border: `1px solid ${C.border}`, borderRadius: 16,
    padding: "2.25rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem",
  },
  label: {
    fontFamily: "'Cinzel', serif", fontSize: "0.65rem",
    letterSpacing: "0.14em", color: C.textFaint,
    textTransform: "uppercase", marginBottom: "0.4rem",
  },
  input: {
    width: "100%", background: C.bg, border: `1.5px solid ${C.border}`,
    borderRadius: 8, color: C.text, fontFamily: "'Crimson Pro', serif",
    fontSize: "1.1rem", letterSpacing: "0.08em",
    padding: "0.85rem 1rem", outline: "none", transition: "border-color 0.2s",
  },
  error: {
    fontFamily: "'Crimson Pro', serif", fontStyle: "italic",
    fontSize: "0.88rem", color: C.red, textAlign: "center",
  },
  btn: {
    width: "100%", padding: "0.9rem", border: "none", borderRadius: 8,
    background: "linear-gradient(135deg, #b8860b, #c9a84c, #daa520)",
    color: "#0a0a0f", fontFamily: "'Cinzel', serif", fontSize: "0.85rem",
    fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer",
    boxShadow: "0 4px 20px #c9a84c33",
  },
  hint: {
    fontFamily: "'Crimson Pro', serif", fontStyle: "italic",
    fontSize: "0.8rem", color: C.textFaint, textAlign: "center",
  },
};
