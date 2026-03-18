import { CONTRIBUTION, JOIN_PATTERN } from "../constants";

// ─── EMOJI / SPECIAL CHAR STRIPPER ──────────────────────────────────────────
// Removes emoji, flag sequences, and common WhatsApp decoration from name strings
const EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA9F}☪✓•·]/gu;
const FLAG_RE  = /[\u{1F1E0}-\u{1F1FF}]{2}/gu;

function stripDecorations(str) {
  return (str || "")
    .replace(FLAG_RE, "")
    .replace(EMOJI_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── GLOBAL NAME NORMALIZER ──────────────────────────────────────────────────
/**
 * Normalise any raw name string into { firstName, lastName }.
 * Handles:
 *   - Quoted nicknames:  'Abdul "Karl" Kader'      → Abdul Kader
 *   - WhatsApp suffixes: 'Mo Jooma ☪️ (Icebox) [Atlanta]' → Mo Jooma
 *   - Emojis / flags stripped
 *   - Single names:      'Zahir'                   → { firstName: "Zahir", lastName: "Not Available" }
 */
export function normaliseName(raw) {
  if (!raw || raw.trim() === "") {
    return { firstName: "Not Available", lastName: "Not Available" };
  }

  let s = stripDecorations(raw);

  // Remove quoted nicknames: Abdul "Karl" Kader → Abdul Kader
  s = s.replace(/"[^"]*"/g, "");

  // Remove parenthetical suffixes: Mo Jooma (Icebox) → Mo Jooma
  s = s.replace(/\([^)]*\)/g, "");

  // Remove bracket suffixes: Mo Jooma [Atlanta] → Mo Jooma
  s = s.replace(/\[[^\]]*\]/g, "");

  // Remove trailing WS tag
  s = s.replace(/\bWS\b/g, "");

  s = s.replace(/\s+/g, " ").trim();

  if (!s) return { firstName: "Not Available", lastName: "Not Available" };

  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Not Available", lastName: "Not Available" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "Not Available" };

  return {
    firstName: parts[0],
    lastName:  parts.slice(1).join(" "),
  };
}

// ─── WELCOME MESSAGE PARSER ──────────────────────────────────────────────────
/**
 * Parse a welcome message body to extract member profile entries.
 * Handles multi-member introductions (bullet lists) and single entries.
 *
 * Pattern: "Name - Store (Type) @ Location\nWelcome to the chat..."
 *
 * Returns array of { rawName, storeName, storeType, location }
 */
function parseWelcomeBody(body) {
  const results = [];
  const lines = body.split("\n");
  const welcomeIdx = lines.findIndex(l => JOIN_PATTERN.test(l));
  const infoLines  = welcomeIdx > 0 ? lines.slice(0, welcomeIdx) : [];

  // Pattern: optional bullet + Name - Store (Type) @ Location
  const entryRe = /^[-•⁠\s]*(.+?)\s*[-–]\s*(.+?)(?:\s*\(([^)]+)\))?\s*(?:@\s*(.+))?$/;

  for (const line of infoLines) {
    const trimmed = stripDecorations(line).trim();
    if (!trimmed || trimmed.startsWith("http") || trimmed.length < 2) continue;

    const m = trimmed.match(entryRe);
    if (m) {
      results.push({
        rawName:   m[1].trim(),
        storeName: m[2] ? m[2].trim() : "Not Available",
        storeType: m[3] ? m[3].trim() : "Not Available",
        location:  m[4] ? stripDecorations(m[4]).trim() : "Not Available",
      });
    } else if (trimmed.length < 80) {
      results.push({
        rawName:   trimmed,
        storeName: "Not Available",
        storeType: "Not Available",
        location:  "Not Available",
      });
    }
  }

  return results;
}

// ─── MAIN PARSER ─────────────────────────────────────────────────────────────
const MSG_RE = /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}:\d{2}:\d{2}(?:\s*[AP]M)?)\]\s+(.+?):\s([\s\S]*)/;

/**
 * Parse raw WhatsApp export text into message objects.
 * @param {string} text
 * @param {boolean} includeDeals  – controlled by upload feature flag
 * @returns {object[]}
 */
export function parseExport(text, includeDeals = false) {
  if (!text || typeof text !== "string") return [];

  const DEAL_KW = [
    "deal", "$/", "gram", "labor", "wholesale", "discount",
    "special", "offer", "sale", "pricing", "kilo", "carat",
  ];

  const lines = text.split("\n");
  const msgs  = [];
  let cur     = null;

  for (const line of lines) {
    const m = line.match(MSG_RE);
    if (m) {
      if (cur) msgs.push(cur);

      const [, mo, d, yr, , sender, body] = m;
      let year = parseInt(yr, 10);
      if (year < 100) year += 2000;

      const date = new Date(year, parseInt(mo, 10) - 1, parseInt(d, 10));
      const bl   = body.toLowerCase();

      const isSystem =
        sender.includes("UMMA") ||
        /^‎?(You |.+ added |.+ removed |.+ joined|Messages and calls)/.test(body) ||
        body.includes("changed the group") ||
        body.includes("deleted this message") ||
        body.includes("This message was deleted");

      // Only compute deal flag if feature flag is on
      const isDeals = includeDeals && !isSystem &&
        DEAL_KW.some(k => bl.includes(k)) &&
        (bl.includes("$") || bl.includes("price") || bl.includes("deal") ||
         bl.includes("gram") || bl.includes("labor") || bl.includes("discount") ||
         bl.includes("offer") || bl.includes("kilo"));

      const hasMedia  = body.includes("<attached:") || body.startsWith("‎<");
      const isWelcome = !isSystem && JOIN_PATTERN.test(body);

      cur = {
        date,
        month:   `${year}-${String(parseInt(mo, 10)).padStart(2, "0")}`,
        sender:  sender.trim(),
        body:    body.trim(),
        isSystem,
        isDeals,
        hasMedia,
        isReply: false,
        isWelcome,
      };
    } else if (cur) {
      cur.body += "\n" + line;
    }
  }
  if (cur) msgs.push(cur);

  // Mark replies: different sender, within 10 minutes
  for (let i = 1; i < msgs.length; i++) {
    const p = msgs[i - 1], c = msgs[i];
    if (!c.isSystem && !p.isSystem && p.sender !== c.sender) {
      const diff = c.date - p.date;
      if (diff >= 0 && diff < 600_000) c.isReply = true;
    }
  }

  return msgs;
}

// ─── MEMBER DIRECTORY BUILDER ─────────────────────────────────────────────────
/**
 * Build a normalised member directory from all parsed messages.
 * Returns Map<senderKey, MemberRecord>
 */
export function buildMemberDirectory(allMsgs) {
  const now       = new Date();
  const nonSystem = allMsgs.filter(m => !m.isSystem);

  // Step 1 — seed a record for every sender
  const records = new Map();
  for (const { sender } of nonSystem) {
    if (!records.has(sender)) {
      const { firstName, lastName } = normaliseName(sender);
      records.set(sender, {
        senderKey:          sender,
        firstName,
        lastName,
        storeName:          "Not Available",
        storeType:          "Not Available",
        location:           "Not Available",
        joinDate:           null,
        joinDateFlagged:    true,
        totalMessages:      0,
        lastActiveDate:     null,
        contributionStatus: "Silent",
      });
    }
  }

  // Step 2 — enrich from welcome messages
  for (const wMsg of allMsgs.filter(m => m.isWelcome && !m.isSystem)) {
    const entries = parseWelcomeBody(wMsg.body);

    for (const entry of entries) {
      if (!entry.rawName || entry.rawName === "Not Available") continue;

      const { firstName, lastName } = normaliseName(entry.rawName);
      const fnLower = firstName.toLowerCase();

      // Match existing sender by first-name prefix
      let key = null;
      for (const [sk] of records) {
        const skLower = sk.toLowerCase();
        if (skLower.startsWith(fnLower) || skLower.includes(fnLower)) {
          key = sk;
          break;
        }
      }

      // If no sender match, create a new record for this welcomed member
      if (!key) {
        key = entry.rawName;
        records.set(key, {
          senderKey:          key,
          firstName:          "Not Available",
          lastName:           "Not Available",
          storeName:          "Not Available",
          storeType:          "Not Available",
          location:           "Not Available",
          joinDate:           null,
          joinDateFlagged:    true,
          totalMessages:      0,
          lastActiveDate:     null,
          contributionStatus: "Silent",
        });
      }

      const rec = records.get(key);

      // Always update with the richer parsed name from the welcome message
      rec.firstName = firstName;
      rec.lastName  = lastName;
      if (entry.storeName !== "Not Available") rec.storeName = entry.storeName;
      if (entry.storeType !== "Not Available") rec.storeType = entry.storeType;
      if (entry.location  !== "Not Available") rec.location  = entry.location;

      // Earliest welcome = join date
      if (!rec.joinDate || wMsg.date < rec.joinDate) {
        rec.joinDate        = wMsg.date;
        rec.joinDateFlagged = false;
      }
    }
  }

  // Step 3 — accumulate message stats
  for (const msg of nonSystem) {
    const rec = records.get(msg.sender);
    if (!rec) continue;
    rec.totalMessages++;
    if (!rec.lastActiveDate || msg.date > rec.lastActiveDate) {
      rec.lastActiveDate = msg.date;
    }
  }

  // Step 4 — assign contribution status
  for (const [, rec] of records) {
    const days = rec.lastActiveDate
      ? Math.floor((now - rec.lastActiveDate) / 86_400_000)
      : Infinity;

    if      (days <= CONTRIBUTION.ACTIVE_DAYS)   rec.contributionStatus = "Active";
    else if (days <= CONTRIBUTION.AT_RISK_DAYS)  rec.contributionStatus = "At-Risk";
    else                                          rec.contributionStatus = "Silent";
  }

  return records;
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
export function computeAnalytics(allMsgs) {
  const msgs = allMsgs.filter(m => !m.isSystem);

  const byMonth = {};
  for (const m of msgs) {
    if (!byMonth[m.month]) byMonth[m.month] = [];
    byMonth[m.month].push(m);
  }
  const months = Object.keys(byMonth).sort();
  const mms    = {};

  for (const month of months) {
    mms[month] = {};
    const mm   = byMonth[month];

    for (const m of mm) {
      if (!mms[month][m.sender]) {
        mms[month][m.sender] = {
          sender: m.sender, messageCount: 0,
          activeDays: new Set(), replies: 0, dealsPosted: 0, threadsStarted: 0,
        };
      }
      const s = mms[month][m.sender];
      s.messageCount++;
      s.activeDays.add(m.date.toISOString().split("T")[0]);
      if (m.isReply) s.replies++;
      if (m.isDeals) s.dealsPosted++;
    }

    let lt = null, ls = null;
    for (const m of mm) {
      const gap = lt ? m.date - lt : Infinity;
      if (gap > 3_600_000 || ls !== m.sender) {
        if (mms[month][m.sender]) mms[month][m.sender].threadsStarted++;
      }
      lt = m.date; ls = m.sender;
    }
  }

  for (const month of months)
    for (const s of Object.keys(mms[month]))
      mms[month][s].activeDays = mms[month][s].activeDays.size;

  const allMembers     = [...new Set(months.flatMap(mo => Object.keys(mms[mo])))];
  const mc             = {};
  for (const mb of allMembers)
    mc[mb] = months.filter(mo => mms[mo][mb]?.messageCount > 0).length;

  const memberDirectory = buildMemberDirectory(allMsgs);

  return { byMonth, months, mms, allMembers, mc, memberDirectory };
}

// ─── REPORT ───────────────────────────────────────────────────────────────────
export function getReport(analytics) {
  const { memberDirectory, allMembers } = analytics;

  let activeCount  = 0, atRiskCount = 0, silentCount = 0;
  for (const [, rec] of memberDirectory) {
    if      (rec.contributionStatus === "Active")   activeCount++;
    else if (rec.contributionStatus === "At-Risk")  atRiskCount++;
    else                                            silentCount++;
  }

  const totalMessages = [...memberDirectory.values()]
    .reduce((s, r) => s + r.totalMessages, 0);

  return {
    totalMembers:  allMembers.length,
    activeCount,
    atRiskCount,
    silentCount,
    totalMessages,
  };
}

// ─── INACTIVE MEMBER DETECTOR (future notification scaffold) ─────────────────
export function detectInactiveMembers(memberDirectory) {
  const silent = [], atRisk = [];
  for (const [, rec] of memberDirectory) {
    if      (rec.contributionStatus === "Silent")   silent.push(rec);
    else if (rec.contributionStatus === "At-Risk")  atRisk.push(rec);
  }
  return { silent, atRisk };
}
