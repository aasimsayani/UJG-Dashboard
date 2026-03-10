import { useState, useCallback, useMemo } from "react";

// ─── PASSWORD GATE ────────────────────────────────────────────────────────────

const VALID_PASSWORDS = [
  "ummamanagement",
  "umma management",
  "ummamanagement2024",
  "umma2024",
  "ummamgmt",
];

function normalise(str) {
  return str.toLowerCase().replace(/[\s\-_\.]+/g, "").trim();
}

function checkPassword(input) {
  const n = normalise(input);
  return VALID_PASSWORDS.some(p => normalise(p) === n);
}

function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (checkPassword(value)) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setValue("");
    }
  };

  const gateCss = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0a0a0f; }

    .gate {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 50% 35%, #1e1a0e 0%, #0a0a0f 65%);
      padding: 2rem;
    }

    .gate-emblem {
      width: 72px; height: 72px;
      border-radius: 50%;
      border: 1.5px solid #c9a84c66;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.75rem;
      background: #c9a84c0a;
      box-shadow: 0 0 40px #c9a84c22;
    }

    .gate-star { font-size: 2rem; }

    .gate-title {
      font-family: 'Cinzel', serif;
      font-size: 2.6rem;
      font-weight: 700;
      color: #c9a84c;
      letter-spacing: 0.14em;
      text-shadow: 0 0 40px #c9a84c44;
      margin-bottom: 0.3rem;
      text-align: center;
    }

    .gate-sub {
      font-family: 'Crimson Pro', serif;
      font-style: italic;
      font-size: 1rem;
      color: #8884a0;
      letter-spacing: 0.06em;
      margin-bottom: 2.5rem;
      text-align: center;
    }

    .gate-divider {
      width: 80px; height: 1px;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      margin: 0 auto 2.5rem;
    }

    .gate-card {
      width: 100%; max-width: 380px;
      background: #12121a;
      border: 1px solid #2a2a3e;
      border-radius: 16px;
      padding: 2.25rem 2rem;
      display: flex; flex-direction: column; gap: 1.25rem;
    }

    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-10px); }
      40%      { transform: translateX(10px); }
      60%      { transform: translateX(-8px); }
      80%      { transform: translateX(8px); }
    }
    .shake { animation: shake 0.5s ease; }

    .gate-label {
      font-family: 'Cinzel', serif;
      font-size: 0.65rem;
      letter-spacing: 0.14em;
      color: #4a4a6a;
      text-transform: uppercase;
      margin-bottom: 0.4rem;
    }

    .gate-input {
      width: 100%;
      background: #0a0a0f;
      border: 1.5px solid #2a2a3e;
      border-radius: 8px;
      color: #e8e0d0;
      font-family: 'Crimson Pro', serif;
      font-size: 1.1rem;
      letter-spacing: 0.08em;
      padding: 0.85rem 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .gate-input:focus {
      border-color: #c9a84c;
      box-shadow: 0 0 0 3px #c9a84c18;
    }
    .gate-input.error { border-color: #f87171; box-shadow: 0 0 0 3px #f8717118; }

    .gate-error {
      font-family: 'Crimson Pro', serif;
      font-style: italic;
      font-size: 0.88rem;
      color: #f87171;
      text-align: center;
    }

    .gate-btn {
      width: 100%;
      padding: 0.9rem;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #b8860b, #c9a84c, #daa520);
      color: #0a0a0f;
      font-family: 'Cinzel', serif;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      cursor: pointer;
      transition: all 0.25s;
      box-shadow: 0 4px 20px #c9a84c33;
    }
    .gate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px #c9a84c44; }
    .gate-btn:active { transform: translateY(0); }

    .gate-hint {
      font-family: 'Crimson Pro', serif;
      font-style: italic;
      font-size: 0.8rem;
      color: #4a4a6a;
      text-align: center;
    }
  `;

  return (
    <>
      <style>{gateCss}</style>
      <div className="gate">
        <div className="gate-emblem">
          <span className="gate-star">☪</span>
        </div>
        <div className="gate-title">UMMA</div>
        <div className="gate-sub">Community Analytics · Members Only</div>
        <div className="gate-divider" />

        <div className={`gate-card ${shake ? "shake" : ""}`}>
          <div>
            <div className="gate-label">Access Password</div>
            <input
              className={`gate-input ${error ? "error" : ""}`}
              type="password"
              placeholder="Enter password…"
              value={value}
              onChange={e => { setValue(e.target.value); setError(false); }}
              onKeyDown={e => e.key === "Enter" && attempt()}
              autoFocus
            />
          </div>

          {error && (
            <div className="gate-error">Incorrect password — please try again</div>
          )}

          <button className="gate-btn" onClick={attempt}>
            ENTER DASHBOARD
          </button>

          <div className="gate-hint">Contact your group admin for access</div>
        </div>
      </div>
    </>
  );
}

// ─── PARSER ──────────────────────────────────────────────────────────────────

function parseWhatsAppExport(text) {
  const lines = text.split("\n");
  const messages = [];
  // Matches: [M/D/YY, H:MM:SS AM/PM] Name: message
  // Also handles [DD/MM/YYYY, HH:MM:SS] format
  const msgRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}:\d{2}(?:\s*[AP]M)?)\]\s+(.+?):\s([\s\S]*)/;
  const systemRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s*(\d{1,2}:\d{2}:\d{2}(?:\s*[AP]M)?)\]\s+(.+?):\s‎?(You |.+ added |.+ removed |.+ left|.+ joined|Messages and calls)/;

  let current = null;

  for (const line of lines) {
    const match = line.match(msgRegex);
    if (match) {
      if (current) messages.push(current);
      const [, datePart, timePart, sender, body] = match;
      // Parse date
      const dateParts = datePart.split("/");
      let month, day, year;
      // WhatsApp exports as M/D/YY or DD/MM/YYYY
      month = parseInt(dateParts[0]);
      day = parseInt(dateParts[1]);
      year = parseInt(dateParts[2]);
      if (year < 100) year += 2000;

      // Check if system message
      const isSystem =
        sender.includes("UMMA") ||
        body.startsWith("You ") ||
        body.startsWith("‎You ") ||
        body.includes(" added ") ||
        body.includes(" removed ") ||
        body.includes("joined using") ||
        body.includes("end-to-end encrypted") ||
        body.includes("changed the group") ||
        body.includes("changed their phone") ||
        body.includes("deleted this message") ||
        body.includes("This message was deleted") ||
        body.startsWith("‎<attached:");

      // Detect deal keywords
      const dealKeywords = [
        "deal", "price", "$/", "gram", "per gram", "labor", "wholesale",
        "discount", "special", "offer", "sale", "pricing", "cost", "rate",
        "buy", "sell", "stock", "available", "DM me", "hit me up", "reach out",
        "kilo", "carat", "ct", "mm", "gold", "diamond", "moissanite"
      ];
      const bodyLower = body.toLowerCase();
      const isDeals = !isSystem && dealKeywords.some(k => bodyLower.includes(k)) &&
        (bodyLower.includes("$") || bodyLower.includes("price") || bodyLower.includes("deal") ||
          bodyLower.includes("gram") || bodyLower.includes("labor") || bodyLower.includes("discount") ||
          bodyLower.includes("offer") || bodyLower.includes("special") || bodyLower.includes("kilo"));

      // Count media
      const hasMedia = body.includes("<attached:") || body.startsWith("‎<");

      current = {
        date: new Date(year, month - 1, day),
        month: `${year}-${String(month).padStart(2, "0")}`,
        sender: sender.trim(),
        body: body.trim(),
        isSystem,
        isDeals,
        hasMedia,
        isReply: false, // will be determined below
      };
    } else if (current) {
      current.body += "\n" + line;
    }
  }
  if (current) messages.push(current);

  // Mark replies: messages within 10 min of previous non-system msg from different sender
  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    if (!curr.isSystem && !prev.isSystem && prev.sender !== curr.sender) {
      const diff = curr.date - prev.date;
      if (diff >= 0 && diff < 600000) curr.isReply = true;
    }
  }

  return messages;
}

function computeAnalytics(allMessages) {
  // Filter out system messages
  const msgs = allMessages.filter(m => !m.isSystem);

  // Group by month
  const byMonth = {};
  for (const m of msgs) {
    if (!byMonth[m.month]) byMonth[m.month] = [];
    byMonth[m.month].push(m);
  }

  const months = Object.keys(byMonth).sort();

  // Per-member stats per month
  const memberMonthStats = {}; // memberMonthStats[month][sender]

  for (const month of months) {
    memberMonthStats[month] = {};
    const monthMsgs = byMonth[month];

    for (const m of monthMsgs) {
      if (!memberMonthStats[month][m.sender]) {
        memberMonthStats[month][m.sender] = {
          sender: m.sender,
          messageCount: 0,
          activeDays: new Set(),
          replies: 0,
          dealsPosted: 0,
          mediaShared: 0,
          threadsStarted: 0,
        };
      }
      const s = memberMonthStats[month][m.sender];
      s.messageCount++;
      s.activeDays.add(m.date.toISOString().split("T")[0]);
      if (m.isReply) s.replies++;
      if (m.isDeals) s.dealsPosted++;
      if (m.hasMedia) s.mediaShared++;
    }

    // Thread starters: first msg of each "new thread" (gap > 1hr from previous)
    let lastTime = null;
    let lastSender = null;
    for (const m of monthMsgs) {
      const gap = lastTime ? m.date - lastTime : Infinity;
      if (gap > 3600000 || lastSender !== m.sender) {
        if (memberMonthStats[month][m.sender]) {
          memberMonthStats[month][m.sender].threadsStarted++;
        }
      }
      lastTime = m.date;
      lastSender = m.sender;
    }
  }

  // Finalize activeDays
  for (const month of months) {
    for (const sender of Object.keys(memberMonthStats[month])) {
      memberMonthStats[month][sender].activeDays = memberMonthStats[month][sender].activeDays.size;
    }
  }

  // All unique members (across all months)
  const allMembers = new Set();
  for (const month of months) {
    for (const sender of Object.keys(memberMonthStats[month])) {
      allMembers.add(sender);
    }
  }

  // Consistency: how many months was each member active
  const memberConsistency = {};
  for (const member of allMembers) {
    let activeMonths = 0;
    for (const month of months) {
      if (memberMonthStats[month][member] && memberMonthStats[month][member].messageCount > 0) {
        activeMonths++;
      }
    }
    memberConsistency[member] = activeMonths;
  }

  return { byMonth, months, memberMonthStats, allMembers: [...allMembers], memberConsistency };
}

function getMonthlyReport(analytics, selectedMonth) {
  const { months, memberMonthStats, allMembers, memberConsistency } = analytics;

  const statsForMonth = memberMonthStats[selectedMonth] || {};
  const contributors = Object.values(statsForMonth).filter(s => s.messageCount > 0);
  const contributorNames = new Set(contributors.map(s => s.sender));

  const silent = allMembers.filter(m => !contributorNames.has(m));

  const sorted = [...contributors].sort((a, b) => b.messageCount - a.messageCount);
  const top = sorted.slice(0, 10);
  const low = sorted.filter(s => s.messageCount <= 3 && s.messageCount > 0);

  const dealPosters = contributors
    .filter(s => s.dealsPosted > 0)
    .sort((a, b) => b.dealsPosted - a.dealsPosted);

  // Consistent: active in >= 80% of months
  const minMonths = Math.max(1, Math.ceil(months.length * 0.4));
  const consistent = allMembers.filter(m => memberConsistency[m] >= minMonths && contributorNames.has(m));

  const totalMessages = contributors.reduce((s, m) => s + m.messageCount, 0);
  const avgMessages = contributors.length ? Math.round(totalMessages / contributors.length) : 0;

  return {
    contributors,
    silent,
    top,
    low,
    dealPosters,
    consistent,
    totalMembers: allMembers.length,
    activeCount: contributors.length,
    inactiveCount: silent.length,
    totalMessages,
    avgMessages,
  };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#0a0a0f",
  surface: "#12121a",
  card: "#1a1a26",
  border: "#2a2a3e",
  accent: "#c9a84c",
  accentSoft: "#c9a84c22",
  accentGlow: "#c9a84c44",
  text: "#e8e0d0",
  textMuted: "#8884a0",
  textFaint: "#4a4a6a",
  green: "#4ade80",
  greenSoft: "#4ade8022",
  red: "#f87171",
  redSoft: "#f8717122",
  blue: "#60a5fa",
  blueSoft: "#60a5fa22",
  purple: "#a78bfa",
  purpleSoft: "#a78bfa22",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${COLORS.bg};
    color: ${COLORS.text};
    font-family: 'Crimson Pro', Georgia, serif;
    min-height: 100vh;
  }

  .app { min-height: 100vh; background: ${COLORS.bg}; }

  .upload-zone {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
    background: radial-gradient(ellipse at 50% 40%, #1e1a0e 0%, ${COLORS.bg} 65%);
  }

  .upload-logo {
    font-family: 'Cinzel', serif;
    font-size: 3.2rem;
    font-weight: 700;
    color: ${COLORS.accent};
    letter-spacing: 0.12em;
    text-shadow: 0 0 40px ${COLORS.accentGlow};
    line-height: 1.1;
    text-align: center;
  }

  .upload-tagline {
    font-family: 'Crimson Pro', serif;
    font-size: 1.2rem;
    font-style: italic;
    color: ${COLORS.textMuted};
    letter-spacing: 0.04em;
  }

  .upload-divider {
    width: 120px;
    height: 1px;
    background: linear-gradient(90deg, transparent, ${COLORS.accent}, transparent);
    margin: 0 auto;
  }

  .drop-area {
    width: 100%;
    max-width: 480px;
    border: 1.5px dashed ${COLORS.border};
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: ${COLORS.surface};
    position: relative;
    overflow: hidden;
  }

  .drop-area::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, ${COLORS.accentGlow} 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
  }

  .drop-area:hover::before, .drop-area.dragging::before { opacity: 1; }
  .drop-area:hover, .drop-area.dragging { border-color: ${COLORS.accent}; }

  .drop-icon { font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.7; }
  .drop-text { font-size: 1.1rem; color: ${COLORS.textMuted}; margin-bottom: 0.5rem; }
  .drop-sub { font-size: 0.9rem; color: ${COLORS.textFaint}; }

  .add-group-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: 1px solid ${COLORS.accent};
    background: transparent;
    color: ${COLORS.accent};
    font-family: 'Cinzel', serif;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.2s;
  }
  .add-group-btn:hover { background: ${COLORS.accentSoft}; }

  .groups-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    max-width: 600px;
  }

  .group-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 100px;
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    font-size: 0.9rem;
    color: ${COLORS.text};
  }

  .group-chip-remove {
    background: none;
    border: none;
    color: ${COLORS.textFaint};
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    transition: color 0.2s;
  }
  .group-chip-remove:hover { color: ${COLORS.red}; }

  .analyze-btn {
    padding: 1rem 3rem;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #b8860b, ${COLORS.accent}, #daa520);
    color: #0a0a0f;
    font-family: 'Cinzel', serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 24px ${COLORS.accentGlow};
  }
  .analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px ${COLORS.accentGlow}; }
  .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* ── DASHBOARD ── */
  .dashboard { min-height: 100vh; display: flex; flex-direction: column; }

  .header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .header-logo {
    font-family: 'Cinzel', serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: ${COLORS.accent};
    letter-spacing: 0.1em;
  }

  .header-subtitle {
    font-family: 'Crimson Pro', serif;
    font-size: 0.95rem;
    font-style: italic;
    color: ${COLORS.textMuted};
    margin-top: 0.1rem;
  }

  .header-right { display: flex; align-items: center; gap: 1rem; }

  .month-select {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    color: ${COLORS.text};
    font-family: 'Crimson Pro', serif;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }
  .month-select:focus { border-color: ${COLORS.accent}; }

  .reset-btn {
    background: none;
    border: 1px solid ${COLORS.border};
    color: ${COLORS.textMuted};
    font-family: 'Crimson Pro', serif;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .reset-btn:hover { border-color: ${COLORS.red}; color: ${COLORS.red}; }

  .main { padding: 2rem; max-width: 1400px; margin: 0 auto; width: 100%; flex: 1; }

  /* Tabs */
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid ${COLORS.border};
    margin-bottom: 2rem;
    overflow-x: auto;
  }

  .tab {
    padding: 0.75rem 1.5rem;
    border: none;
    background: none;
    color: ${COLORS.textMuted};
    font-family: 'Cinzel', serif;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 2px solid transparent;
    white-space: nowrap;
    margin-bottom: -1px;
  }
  .tab:hover { color: ${COLORS.text}; }
  .tab.active { color: ${COLORS.accent}; border-bottom-color: ${COLORS.accent}; }

  /* Stat Cards */
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }

  .stat-card {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--accent-color, ${COLORS.accent});
  }

  .stat-label {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    color: ${COLORS.textMuted};
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-family: 'Cinzel', serif;
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-color, ${COLORS.accent});
    line-height: 1;
    margin-bottom: 0.25rem;
  }

  .stat-sub { font-size: 0.85rem; color: ${COLORS.textFaint}; }

  /* Content grid */
  .content-grid { display: grid; gap: 1.5rem; }
  .col-2 { grid-template-columns: 1fr 1fr; }
  .col-3 { grid-template-columns: 1fr 1fr 1fr; }

  @media (max-width: 900px) {
    .col-2, .col-3 { grid-template-columns: 1fr; }
  }

  /* Panel */
  .panel {
    background: ${COLORS.card};
    border: 1px solid ${COLORS.border};
    border-radius: 12px;
    overflow: hidden;
  }

  .panel-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid ${COLORS.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    color: ${COLORS.accent};
    text-transform: uppercase;
  }

  .panel-count {
    font-size: 0.85rem;
    color: ${COLORS.textFaint};
    font-style: italic;
  }

  .panel-body { padding: 1.25rem 1.5rem; }

  /* Member rows */
  .member-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .member-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    background: ${COLORS.surface};
    transition: background 0.2s;
  }
  .member-row:hover { background: #1e1e2e; }

  .rank {
    font-family: 'Cinzel', serif;
    font-size: 0.7rem;
    color: ${COLORS.textFaint};
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .rank-gold { color: #ffd700; }
  .rank-silver { color: #c0c0c0; }
  .rank-bronze { color: #cd7f32; }

  .member-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${COLORS.accent}, #8b5e00);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    font-weight: 700;
    color: #0a0a0f;
    flex-shrink: 0;
  }

  .member-info { flex: 1; min-width: 0; }

  .member-name {
    font-size: 0.95rem;
    color: ${COLORS.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
  }

  .member-meta { font-size: 0.78rem; color: ${COLORS.textMuted}; margin-top: 0.1rem; }

  .member-bar-wrap { width: 80px; flex-shrink: 0; }

  .member-bar-bg {
    height: 4px;
    background: ${COLORS.border};
    border-radius: 2px;
    overflow: hidden;
  }

  .member-bar {
    height: 100%;
    border-radius: 2px;
    background: var(--bar-color, ${COLORS.accent});
    transition: width 0.5s ease;
  }

  .member-count {
    font-family: 'Cinzel', serif;
    font-size: 0.75rem;
    color: ${COLORS.accent};
    text-align: right;
    margin-top: 2px;
  }

  /* Badge */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: 100px;
    font-size: 0.7rem;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.06em;
  }
  .badge-green { background: ${COLORS.greenSoft}; color: ${COLORS.green}; border: 1px solid ${COLORS.green}44; }
  .badge-red { background: ${COLORS.redSoft}; color: ${COLORS.red}; border: 1px solid ${COLORS.red}44; }
  .badge-blue { background: ${COLORS.blueSoft}; color: ${COLORS.blue}; border: 1px solid ${COLORS.blue}44; }
  .badge-purple { background: ${COLORS.purpleSoft}; color: ${COLORS.purple}; border: 1px solid ${COLORS.purple}44; }
  .badge-gold { background: ${COLORS.accentSoft}; color: ${COLORS.accent}; border: 1px solid ${COLORS.accent}44; }

  /* Silent members grid */
  .silent-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  .silent-chip {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-radius: 100px;
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    font-size: 0.82rem;
    color: ${COLORS.textMuted};
  }

  .silent-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${COLORS.textFaint};
    flex-shrink: 0;
  }

  /* Progress ring (community health) */
  .health-ring-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .health-ring-label {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: ${COLORS.textMuted};
    text-transform: uppercase;
    text-align: center;
  }

  /* Month trend mini */
  .trend-bar-wrap { display: flex; align-items: flex-end; gap: 3px; height: 48px; }
  .trend-bar-col { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .trend-bar-item { border-radius: 3px 3px 0 0; width: 20px; min-height: 4px; background: ${COLORS.accent}88; transition: background 0.2s; }
  .trend-bar-item.active { background: ${COLORS.accent}; }
  .trend-bar-item:hover { background: ${COLORS.accent}; }
  .trend-label { font-size: 0.6rem; color: ${COLORS.textFaint}; }

  /* Scrollable */
  .scrollable { max-height: 360px; overflow-y: auto; }
  .scrollable::-webkit-scrollbar { width: 4px; }
  .scrollable::-webkit-scrollbar-track { background: transparent; }
  .scrollable::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }

  /* Groups added banner */
  .groups-banner {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem 2rem;
    background: ${COLORS.surface};
    border-bottom: 1px solid ${COLORS.border};
    align-items: center;
  }

  .groups-banner-label { font-size: 0.8rem; color: ${COLORS.textFaint}; font-style: italic; margin-right: 0.5rem; }

  .group-tag {
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    background: ${COLORS.accentSoft};
    border: 1px solid ${COLORS.accent}44;
    font-size: 0.78rem;
    color: ${COLORS.accent};
  }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  th {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: ${COLORS.textFaint};
    text-transform: uppercase;
    padding: 0.6rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${COLORS.border};
  }
  td {
    padding: 0.6rem 0.75rem;
    border-bottom: 1px solid ${COLORS.border}44;
    color: ${COLORS.text};
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: ${COLORS.surface}; }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: ${COLORS.textFaint};
    font-style: italic;
    font-size: 1rem;
  }
`;

// ── Utility ──

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0] || "")
    .join("")
    .toUpperCase();
}

function fmtMonth(m) {
  if (!m) return "";
  const [y, mo] = m.split("-");
  const date = new Date(parseInt(y), parseInt(mo) - 1, 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function shortSender(name) {
  // Extract first name only for display
  return name.split(/\s+/)[0] || name;
}

// ── Ring Component ──

function RingGauge({ value, max, color, label, size = 80 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  const dash = pct * circ;

  return (
    <div className="health-ring-wrap">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text
          x={size / 2} y={size / 2 + 1}
          textAnchor="middle" dominantBaseline="middle"
          fill={color}
          fontSize={size < 80 ? "11" : "14"}
          fontFamily="'Cinzel', serif"
          fontWeight="700"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div className="health-ring-label">{label}</div>
    </div>
  );
}

// ── Mini Trend ──

function TrendBars({ data, activeMonth }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="trend-bar-wrap">
      {data.map(d => (
        <div className="trend-bar-col" key={d.month}>
          <div
            className={`trend-bar-item ${d.month === activeMonth ? "active" : ""}`}
            style={{ height: Math.max(4, (d.count / max) * 44) + "px" }}
            title={`${fmtMonth(d.month)}: ${d.count} messages`}
          />
          <div className="trend-label">{d.month.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  return <Dashboard />;
}

function Dashboard() {
  const [groups, setGroups] = useState([]); // [{name, messages}]
  const [analytics, setAnalytics] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [tab, setTab] = useState("overview");
  const [dragging, setDragging] = useState(false);

  const allMessages = useMemo(() => {
    return groups.flatMap(g => g.messages);
  }, [groups]);

  const handleFiles = useCallback((files) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const messages = parseWhatsAppExport(text);
        setGroups(prev => {
          const name = file.name.replace(/\.[^.]+$/, "");
          const updated = [...prev, { name, messages }];
          const all = updated.flatMap(g => g.messages);
          const a = computeAnalytics(all);
          setAnalytics(a);
          if (a.months.length > 0 && !selectedMonth) {
            setSelectedMonth(a.months[a.months.length - 1]);
          }
          return updated;
        });
      };
      reader.readAsText(file);
    }
  }, [selectedMonth]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const handleInput = useCallback((e) => {
    handleFiles(Array.from(e.target.files));
    e.target.value = "";
  }, [handleFiles]);

  const reset = () => {
    setGroups([]);
    setAnalytics(null);
    setSelectedMonth("");
    setTab("overview");
  };

  if (!analytics || groups.length === 0) {
    return (
      <>
        <style>{css}</style>
        <div className="upload-zone">
          <div>
            <div className="upload-logo">UMMA</div>
            <div className="upload-logo" style={{ fontSize: "1.2rem", marginTop: "0.2rem", letterSpacing: "0.3em" }}>COMMUNITY ANALYTICS</div>
          </div>
          <div className="upload-divider" />
          <div className="upload-tagline">WhatsApp Group Intelligence Dashboard</div>

          <label
            className={`drop-area ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input type="file" accept=".txt" multiple style={{ display: "none" }} onChange={handleInput} />
            <div className="drop-icon">📂</div>
            <div className="drop-text">Drop your WhatsApp export here</div>
            <div className="drop-sub">or click to browse · .txt files · multiple groups supported</div>
          </label>

          {groups.length > 0 && (
            <div className="groups-list">
              {groups.map((g, i) => (
                <div className="group-chip" key={i}>
                  <span>📱</span>
                  <span>{g.name}</span>
                  <button className="group-chip-remove" onClick={() => {
                    const next = groups.filter((_, j) => j !== i);
                    setGroups(next);
                  }}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ color: COLORS.textFaint, fontSize: "0.85rem", fontStyle: "italic", textAlign: "center", maxWidth: 380 }}>
            Export any WhatsApp group via<br />
            <span style={{ color: COLORS.textMuted }}>Chat Settings → Export Chat → Without Media</span>
          </div>
        </div>
      </>
    );
  }

  const report = getMonthlyReport(analytics, selectedMonth);
  const { months, byMonth } = analytics;

  const trendData = months.map(m => ({
    month: m,
    count: (byMonth[m] || []).length,
  }));

  const maxMsgs = Math.max(...report.contributors.map(c => c.messageCount), 1);

  const TABS = ["overview", "members", "deals", "consistency", "all members"];

  return (
    <>
      <style>{css}</style>
      <div className="dashboard">
        {/* Header */}
        <div className="header">
          <div>
            <div className="header-logo">UMMA Analytics</div>
            <div className="header-subtitle">Community Intelligence · Stronger Together</div>
          </div>
          <div className="header-right">
            <select
              className="month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {months.map(m => (
                <option key={m} value={m}>{fmtMonth(m)}</option>
              ))}
            </select>
            <button className="reset-btn" onClick={reset}>↩ New</button>
          </div>
        </div>

        {/* Groups banner */}
        <div className="groups-banner">
          <span className="groups-banner-label">Groups loaded:</span>
          {groups.map((g, i) => (
            <span className="group-tag" key={i}>📱 {g.name}</span>
          ))}
          <label style={{ cursor: "pointer" }}>
            <input type="file" accept=".txt" multiple style={{ display: "none" }} onChange={handleInput} />
            <span className="group-tag" style={{ cursor: "pointer", opacity: 0.7 }}>+ Add Group</span>
          </label>
        </div>

        {/* Tabs */}
        <div className="main">
          <div className="tabs">
            {TABS.map(t => (
              <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <>
              {/* Stat row */}
              <div className="stat-grid">
                <div className="stat-card" style={{ "--accent-color": COLORS.accent }}>
                  <div className="stat-label">Total Members</div>
                  <div className="stat-value">{report.totalMembers}</div>
                  <div className="stat-sub">across all groups</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": COLORS.green }}>
                  <div className="stat-label">Active This Month</div>
                  <div className="stat-value">{report.activeCount}</div>
                  <div className="stat-sub">{Math.round((report.activeCount / Math.max(report.totalMembers, 1)) * 100)}% participation rate</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": COLORS.red }}>
                  <div className="stat-label">Silent Members</div>
                  <div className="stat-value">{report.inactiveCount}</div>
                  <div className="stat-sub">no messages this month</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": COLORS.blue }}>
                  <div className="stat-label">Total Messages</div>
                  <div className="stat-value">{report.totalMessages}</div>
                  <div className="stat-sub">avg {report.avgMessages} per member</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": COLORS.purple }}>
                  <div className="stat-label">Deal Posts</div>
                  <div className="stat-value">{report.contributors.reduce((s, c) => s + c.dealsPosted, 0)}</div>
                  <div className="stat-sub">from {report.dealPosters.length} members</div>
                </div>
                <div className="stat-card" style={{ "--accent-color": "#fb923c" }}>
                  <div className="stat-label">Consistent Members</div>
                  <div className="stat-value">{report.consistent.length}</div>
                  <div className="stat-sub">across {months.length} month{months.length !== 1 ? "s" : ""}</div>
                </div>
              </div>

              <div className="content-grid col-3" style={{ marginBottom: "1.5rem" }}>
                {/* Community Health */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Community Health</div>
                  </div>
                  <div className="panel-body" style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", paddingTop: "1.5rem", paddingBottom: "1.5rem" }}>
                    <RingGauge value={report.activeCount} max={report.totalMembers} color={COLORS.green} label="Active Rate" />
                    <RingGauge value={report.dealPosters.length} max={report.activeCount || 1} color={COLORS.blue} label="Deal Posters" />
                    <RingGauge value={report.consistent.length} max={report.totalMembers} color={COLORS.purple} label="Consistent" />
                  </div>
                  {months.length > 1 && (
                    <div style={{ padding: "0 1.5rem 1.25rem", borderTop: `1px solid ${COLORS.border}`, paddingTop: "1rem" }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: COLORS.textFaint, marginBottom: "0.5rem", textTransform: "uppercase" }}>Message Trend</div>
                      <TrendBars data={trendData} activeMonth={selectedMonth} />
                    </div>
                  )}
                </div>

                {/* Top Contributors */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Top Contributors</div>
                    <div className="panel-count">{fmtMonth(selectedMonth)}</div>
                  </div>
                  <div className="panel-body scrollable">
                    {report.top.length === 0 ? (
                      <div className="empty-state">No contributors this month</div>
                    ) : (
                      <div className="member-list">
                        {report.top.map((m, i) => (
                          <div className="member-row" key={m.sender}>
                            <div className={`rank ${i === 0 ? "rank-gold" : i === 1 ? "rank-silver" : i === 2 ? "rank-bronze" : ""}`}>
                              {i + 1}
                            </div>
                            <div className="member-avatar">{initials(m.sender)}</div>
                            <div className="member-info">
                              <div className="member-name">{shortSender(m.sender)}</div>
                              <div className="member-meta">{m.activeDays}d active · {m.replies} replies</div>
                            </div>
                            <div className="member-bar-wrap">
                              <div className="member-bar-bg">
                                <div className="member-bar" style={{ width: `${(m.messageCount / maxMsgs) * 100}%` }} />
                              </div>
                              <div className="member-count">{m.messageCount}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Silent Members */}
                <div className="panel">
                  <div className="panel-header">
                    <div className="panel-title">Silent Members</div>
                    <div className="panel-count">{report.inactiveCount} members</div>
                  </div>
                  <div className="panel-body scrollable">
                    {report.silent.length === 0 ? (
                      <div className="empty-state">Everyone contributed! 🎉</div>
                    ) : (
                      <div className="silent-grid">
                        {report.silent.map(name => (
                          <div className="silent-chip" key={name}>
                            <div className="silent-dot" />
                            {shortSender(name)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Low contributors */}
              {report.low.length > 0 && (
                <div className="panel" style={{ marginBottom: "1.5rem" }}>
                  <div className="panel-header">
                    <div className="panel-title">Low Contribution Alert</div>
                    <div className="panel-count">≤3 messages this month</div>
                  </div>
                  <div className="panel-body">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {report.low.map(m => (
                        <div key={m.sender} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.75rem", borderRadius: "100px", background: COLORS.redSoft, border: `1px solid ${COLORS.red}33`, fontSize: "0.82rem" }}>
                          <span style={{ color: COLORS.red }}>⚠</span>
                          <span style={{ color: COLORS.text }}>{shortSender(m.sender)}</span>
                          <span style={{ color: COLORS.textFaint, fontSize: "0.75rem" }}>{m.messageCount} msg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── MEMBERS TAB ── */}
          {tab === "members" && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Member Metrics — {fmtMonth(selectedMonth)}</div>
                <div className="panel-count">{report.contributors.length} active</div>
              </div>
              <div className="table-wrap">
                {report.contributors.length === 0 ? (
                  <div className="empty-state">No messages found for this month</div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Member</th>
                        <th>Messages</th>
                        <th>Active Days</th>
                        <th>Threads Started</th>
                        <th>Replies</th>
                        <th>Reply Ratio</th>
                        <th>Deals Posted</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...report.contributors]
                        .sort((a, b) => b.messageCount - a.messageCount)
                        .map((m, i) => {
                          const replyRatio = m.messageCount > 0 ? Math.round((m.replies / m.messageCount) * 100) : 0;
                          const isTop = i < 3;
                          const isLow = m.messageCount <= 3;
                          return (
                            <tr key={m.sender}>
                              <td style={{ color: COLORS.textFaint, fontFamily: "'Cinzel', serif", fontSize: "0.7rem" }}>{i + 1}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <div className="member-avatar" style={{ width: 28, height: 28, fontSize: "0.65rem" }}>{initials(m.sender)}</div>
                                  <span style={{ fontWeight: 600 }}>{shortSender(m.sender)}</span>
                                </div>
                              </td>
                              <td style={{ fontFamily: "'Cinzel', serif", color: COLORS.accent, fontWeight: 700 }}>{m.messageCount}</td>
                              <td>{m.activeDays}</td>
                              <td>{m.threadsStarted}</td>
                              <td>{m.replies}</td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                  <div style={{ width: 48, height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                                    <div style={{ width: `${replyRatio}%`, height: "100%", background: COLORS.blue, borderRadius: 2 }} />
                                  </div>
                                  <span style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>{replyRatio}%</span>
                                </div>
                              </td>
                              <td>
                                {m.dealsPosted > 0 ? (
                                  <span className="badge badge-purple">{m.dealsPosted} deal{m.dealsPosted > 1 ? "s" : ""}</span>
                                ) : (
                                  <span style={{ color: COLORS.textFaint, fontSize: "0.8rem" }}>—</span>
                                )}
                              </td>
                              <td>
                                {isTop ? <span className="badge badge-gold">Top</span>
                                  : isLow ? <span className="badge badge-red">Low</span>
                                  : <span className="badge badge-green">Active</span>}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── DEALS TAB ── */}
          {tab === "deals" && (
            <div className="content-grid col-2">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Deal Posters — {fmtMonth(selectedMonth)}</div>
                  <div className="panel-count">{report.dealPosters.length} members</div>
                </div>
                <div className="panel-body scrollable">
                  {report.dealPosters.length === 0 ? (
                    <div className="empty-state">No deal posts detected this month</div>
                  ) : (
                    <div className="member-list">
                      {report.dealPosters.map((m, i) => (
                        <div className="member-row" key={m.sender}>
                          <div className="rank" style={{ color: COLORS.purple }}>{i + 1}</div>
                          <div className="member-avatar" style={{ background: "linear-gradient(135deg, #7c3aed, #4c1d95)" }}>{initials(m.sender)}</div>
                          <div className="member-info">
                            <div className="member-name">{shortSender(m.sender)}</div>
                            <div className="member-meta">{m.messageCount} total msgs · {m.dealsPosted} deal posts</div>
                          </div>
                          <span className="badge badge-purple">{m.dealsPosted}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Who Has NOT Posted Deals</div>
                  <div className="panel-count">Active but no deals</div>
                </div>
                <div className="panel-body scrollable">
                  <div className="silent-grid">
                    {report.contributors.filter(c => c.dealsPosted === 0).map(m => (
                      <div className="silent-chip" key={m.sender}>
                        <div className="silent-dot" style={{ background: COLORS.purple + "66" }} />
                        {shortSender(m.sender)}
                      </div>
                    ))}
                    {report.contributors.filter(c => c.dealsPosted === 0).length === 0 && (
                      <div className="empty-state">Everyone posted deals! 💎</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CONSISTENCY TAB ── */}
          {tab === "consistency" && (
            <div className="content-grid col-2">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Consistent Contributors</div>
                  <div className="panel-count">Active ≥40% of months</div>
                </div>
                <div className="panel-body scrollable">
                  {report.consistent.length === 0 ? (
                    <div className="empty-state">Need more monthly data</div>
                  ) : (
                    <div className="member-list">
                      {report.consistent.map((name) => {
                        const consistency = analytics.memberConsistency[name];
                        const pct = Math.round((consistency / months.length) * 100);
                        return (
                          <div className="member-row" key={name}>
                            <div className="member-avatar">{initials(name)}</div>
                            <div className="member-info">
                              <div className="member-name">{shortSender(name)}</div>
                              <div className="member-meta">Active {consistency}/{months.length} months</div>
                            </div>
                            <div className="member-bar-wrap">
                              <div className="member-bar-bg">
                                <div className="member-bar" style={{ width: `${pct}%`, "--bar-color": COLORS.green }} />
                              </div>
                              <div className="member-count" style={{ color: COLORS.green }}>{pct}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Inconsistent / Irregular</div>
                  <div className="panel-count">Active but sporadic</div>
                </div>
                <div className="panel-body scrollable">
                  <div className="member-list">
                    {analytics.allMembers
                      .filter(m => {
                        const c = analytics.memberConsistency[m];
                        return c > 0 && c < Math.ceil(months.length * 0.4);
                      })
                      .sort((a, b) => analytics.memberConsistency[b] - analytics.memberConsistency[a])
                      .map(name => {
                        const consistency = analytics.memberConsistency[name];
                        const pct = Math.round((consistency / months.length) * 100);
                        return (
                          <div className="member-row" key={name}>
                            <div className="member-avatar" style={{ background: "linear-gradient(135deg, #78350f, #92400e)" }}>{initials(name)}</div>
                            <div className="member-info">
                              <div className="member-name">{shortSender(name)}</div>
                              <div className="member-meta">Active {consistency}/{months.length} months</div>
                            </div>
                            <div className="member-bar-wrap">
                              <div className="member-bar-bg">
                                <div className="member-bar" style={{ width: `${pct}%`, "--bar-color": COLORS.accent }} />
                              </div>
                              <div className="member-count">{pct}%</div>
                            </div>
                          </div>
                        );
                      })}
                    {analytics.allMembers.filter(m => {
                      const c = analytics.memberConsistency[m];
                      return c > 0 && c < Math.ceil(months.length * 0.4);
                    }).length === 0 && (
                      <div className="empty-state">No irregular members</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ALL MEMBERS TAB ── */}
          {tab === "all members" && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">All Members</div>
                <div className="panel-count">{analytics.allMembers.length} total</div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>This Month</th>
                      <th>Active Months</th>
                      <th>Consistency</th>
                      <th>Deals (all time)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.allMembers
                      .sort((a, b) => {
                        const aThis = analytics.memberMonthStats[selectedMonth]?.[a]?.messageCount || 0;
                        const bThis = analytics.memberMonthStats[selectedMonth]?.[b]?.messageCount || 0;
                        return bThis - aThis;
                      })
                      .map(name => {
                        const thisMonth = analytics.memberMonthStats[selectedMonth]?.[name];
                        const consistency = analytics.memberConsistency[name];
                        const pct = Math.round((consistency / months.length) * 100);
                        const allTimeDeals = months.reduce((s, m) => s + (analytics.memberMonthStats[m]?.[name]?.dealsPosted || 0), 0);
                        const isActive = !!(thisMonth?.messageCount > 0);
                        const isConsistent = consistency >= Math.ceil(months.length * 0.4);

                        return (
                          <tr key={name}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div className="member-avatar" style={{ width: 28, height: 28, fontSize: "0.65rem" }}>{initials(name)}</div>
                                <span style={{ fontWeight: 600 }}>{shortSender(name)}</span>
                              </div>
                            </td>
                            <td style={{ fontFamily: "'Cinzel', serif", color: isActive ? COLORS.accent : COLORS.textFaint, fontWeight: isActive ? 700 : 400 }}>
                              {thisMonth?.messageCount || 0}
                            </td>
                            <td>{consistency}/{months.length}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <div style={{ width: 48, height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", background: isConsistent ? COLORS.green : COLORS.accent, borderRadius: 2 }} />
                                </div>
                                <span style={{ fontSize: "0.8rem", color: COLORS.textMuted }}>{pct}%</span>
                              </div>
                            </td>
                            <td>
                              {allTimeDeals > 0 ? (
                                <span className="badge badge-purple">{allTimeDeals}</span>
                              ) : (
                                <span style={{ color: COLORS.textFaint, fontSize: "0.8rem" }}>—</span>
                              )}
                            </td>
                            <td>
                              {!isActive ? (
                                <span className="badge badge-red">Silent</span>
                              ) : isConsistent ? (
                                <span className="badge badge-green">Consistent</span>
                              ) : (
                                <span className="badge badge-gold">Active</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
