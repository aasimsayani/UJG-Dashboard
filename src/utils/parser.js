import { CONTRIBUTION, JOIN_PATTERN } from "../constants";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const DEAL_KW = [
  "deal", "$/", "gram", "labor", "wholesale", "discount",
  "special", "offer", "sale", "pricing", "kilo", "carat",
];

// Regex to parse WhatsApp timestamp lines
// Handles: [M/D/YY, H:MM:SS AM/PM] or [DD/MM/YYYY, HH:MM:SS]
const MSG_RE = /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}:\d{2}:\d{2}(?:\s*[AP]M)?)\]\s+(.+?):\s([\s\S]*)/;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Parse a name string into first/last components.
 * Handles quoted nicknames like 'Abdul "Karl" Kader' and single names.
 */
function parseName(raw) {
  if (!raw || raw.trim() === "") return { firstName: "Not Available", lastName: "Not Available" };

  // Strip quoted nickname: 'Abdul "Karl" Kader' → 'Abdul Kader'
  const cleaned = raw.replace(/"[^"]*"/g, "").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(/\s+/);

  if (parts.length === 0) return { firstName: "Not Available", lastName: "Not Available" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "Not Available" };

  return {
    firstName: parts[0],
    lastName:  parts.slice(1).join(" "),
  };
}

/**
 * Parse a welcome message body to extract member info.
 * Handles patterns like:
 *   "Name - Store (Type) @ Location\nWelcome to the chat..."
 *   "Name - Store\nWelcome to the chat..."
 *   "Name\nWelcome to the chat..."
 * Also handles multi-member introductions (bullet lists).
 * Returns array of { rawName, storeName, location } objects.
 */
function parseWelcomeBody(body) {
  const results = [];

  // Split on newlines, look for lines before "Welcome to the chat"
  const lines = body.split("\n");
  const welcomeIdx = lines.findIndex(l => JOIN_PATTERN.test(l));
  const infoLines = welcomeIdx > 0 ? lines.slice(0, welcomeIdx) : [];

  // Also handle single-line intros before the welcome phrase
  // Pattern: "- Name - Store (Type) @ Location" or "Name - Store @ Location"
  const entryRe = /^[-•⁠\s]*(.+?)\s*[-–]\s*(.+?)(?:\s*\(([^)]+)\))?\s*(?:@\s*(.+))?$/;

  for (const line of infoLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("http")) continue;

    const m = trimmed.match(entryRe);
    if (m) {
      results.push({
        rawName:   m[1].trim(),
        storeName: m[2] ? m[2].trim() : "Not Available",
        storeType: m[3] ? m[3].trim() : "Not Available",
        location:  m[4] ? m[4].trim() : "Not Available",
      });
    } else if (trimmed.length > 0 && trimmed.length < 80) {
      // Fallback: treat line as raw name only
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

/**
 * Parse a raw WhatsApp export text into an array of message objects.
 * Each message: { date, month, sender, body, isSystem, isDeals, hasMedia, isReply }
 */
export function parseExport(text) {
  if (!text || typeof text !== "string") return [];

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

      const isDeals =
        !isSystem &&
        DEAL_KW.some((k) => bl.includes(k)) &&
        (bl.includes("$") || bl.includes("price") || bl.includes("deal") ||
          bl.includes("gram") || bl.includes("labor") || bl.includes("discount") ||
          bl.includes("offer") || bl.includes("kilo"));

      const hasMedia   = body.includes("<attached:") || body.startsWith("‎<");
      const isWelcome  = !isSystem && JOIN_PATTERN.test(body);

      cur = {
        date,
        month:     `${year}-${String(parseInt(mo, 10)).padStart(2, "0")}`,
        sender:    sender.trim(),
        body:      body.trim(),
        isSystem,
        isDeals,
        hasMedia,
        isReply:   false,
        isWelcome,
      };
    } else if (cur) {
      cur.body += "\n" + line;
    }
  }
  if (cur) msgs.push(cur);

  // Mark replies: different sender, within 10 minutes of previous
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
 * Build a structured member directory from all messages.
 * Returns Map<senderKey, MemberRecord>
 *
 * MemberRecord: {
 *   senderKey, firstName, lastName, storeName, storeType, location,
 *   joinDate, totalMessages, lastActiveDate, contributionStatus,
 *   joinDateFlagged (true if join date could not be detected)
 * }
 */
export function buildMemberDirectory(allMsgs) {
  const now          = new Date();
  const nonSystem    = allMsgs.filter(m => !m.isSystem);

  // --- Step 1: Collect all known senders ---
  const senderSet = new Set(nonSystem.map(m => m.sender));

  // --- Step 2: Build base records ---
  const records = new Map(); // key = sender string
  for (const sender of senderSet) {
    records.set(sender, {
      senderKey:          sender,
      firstName:          "Not Available",
      lastName:           "Not Available",
      storeName:          "Not Available",
      storeType:          "Not Available",
      location:           "Not Available",
      joinDate:           null,          // Date | null
      joinDateFlagged:    true,          // flagged until we find evidence
      totalMessages:      0,
      lastActiveDate:     null,
      contributionStatus: "Silent",
    });
  }

  // --- Step 3: Scan welcome messages to extract join info ---
  // Welcome messages are typically sent by an admin (Mo Jooma, Wafi, etc.)
  // right after a member is added. We match by name proximity.
  const welcomeMsgs = allMsgs.filter(m => m.isWelcome && !m.isSystem);

  for (const wMsg of welcomeMsgs) {
    const entries = parseWelcomeBody(wMsg.body);

    for (const entry of entries) {
      if (!entry.rawName || entry.rawName === "Not Available") continue;

      // Try to find a matching sender by comparing first name
      const firstName = entry.rawName.split(/\s+/)[0].toLowerCase();

      // Look for the sender whose name starts with this first name
      let matched = null;
      for (const [senderKey] of records) {
        const sk = senderKey.toLowerCase();
        if (sk.startsWith(firstName) || sk.includes(firstName)) {
          matched = senderKey;
          break;
        }
      }

      // If no direct sender match, still record the entry keyed by rawName
      // so directory captures members who never sent a message
      const key = matched || entry.rawName;

      if (!records.has(key)) {
        records.set(key, {
          senderKey:       key,
          firstName:       "Not Available",
          lastName:        "Not Available",
          storeName:       "Not Available",
          storeType:       "Not Available",
          location:        "Not Available",
          joinDate:        null,
          joinDateFlagged: true,
          totalMessages:   0,
          lastActiveDate:  null,
          contributionStatus: "Silent",
        });
      }

      const rec = records.get(key);
      const { firstName: fn, lastName: ln } = parseName(entry.rawName);
      rec.firstName = fn;
      rec.lastName  = ln;
      if (entry.storeName !== "Not Available") rec.storeName = entry.storeName;
      if (entry.storeType !== "Not Available") rec.storeType = entry.storeType;
      if (entry.location  !== "Not Available") rec.location  = entry.location;

      // Assign join date from the welcome message timestamp
      if (!rec.joinDate || wMsg.date < rec.joinDate) {
        rec.joinDate        = wMsg.date;
        rec.joinDateFlagged = false;
      }
    }
  }

  // --- Step 4: Compute message stats & contribution status ---
  for (const msg of nonSystem) {
    const rec = records.get(msg.sender);
    if (!rec) continue;

    rec.totalMessages++;

    if (!rec.lastActiveDate || msg.date > rec.lastActiveDate) {
      rec.lastActiveDate = msg.date;
    }

    // Try to infer name from sender string if not already set
    if (rec.firstName === "Not Available" && msg.sender) {
      const { firstName, lastName } = parseName(msg.sender);
      rec.firstName = firstName;
      rec.lastName  = lastName;
    }
  }

  // --- Step 5: Assign contribution status ---
  for (const [, rec] of records) {
    const daysSinceLast = rec.lastActiveDate
      ? Math.floor((now - rec.lastActiveDate) / 86_400_000)
      : Infinity;

    if (daysSinceLast <= CONTRIBUTION.ACTIVE_DAYS) {
      rec.contributionStatus = "Active";
    } else if (daysSinceLast <= CONTRIBUTION.AT_RISK_DAYS) {
      rec.contributionStatus = "At-Risk";
    } else {
      rec.contributionStatus = "Silent";
    }
  }

  return records;
}

// ─── ANALYTICS COMPUTATION ────────────────────────────────────────────────────

/**
 * Compute per-month analytics from all messages.
 */
export function computeAnalytics(allMsgs) {
  const msgs = allMsgs.filter(m => !m.isSystem);

  const byMonth = {};
  for (const m of msgs) {
    if (!byMonth[m.month]) byMonth[m.month] = [];
    byMonth[m.month].push(m);
  }
  const months = Object.keys(byMonth).sort();
  const mms    = {}; // mms[month][sender]

  for (const month of months) {
    mms[month] = {};
    const mm   = byMonth[month];

    for (const m of mm) {
      if (!mms[month][m.sender]) {
        mms[month][m.sender] = {
          sender:        m.sender,
          messageCount:  0,
          activeDays:    new Set(),
          replies:       0,
          dealsPosted:   0,
          threadsStarted: 0,
        };
      }
      const s = mms[month][m.sender];
      s.messageCount++;
      s.activeDays.add(m.date.toISOString().split("T")[0]);
      if (m.isReply)  s.replies++;
      if (m.isDeals)  s.dealsPosted++;
    }

    // Thread detection: gap > 1hr from previous msg by same sender
    let lt = null, ls = null;
    for (const m of mm) {
      const gap = lt ? m.date - lt : Infinity;
      if (gap > 3_600_000 || ls !== m.sender) {
        if (mms[month][m.sender]) mms[month][m.sender].threadsStarted++;
      }
      lt = m.date;
      ls = m.sender;
    }
  }

  // Finalise activeDays Set → number
  for (const month of months)
    for (const s of Object.keys(mms[month]))
      mms[month][s].activeDays = mms[month][s].activeDays.size;

  const allMembers = [...new Set(months.flatMap(mo => Object.keys(mms[mo])))];
  const mc = {}; // member consistency: count of months active
  for (const mb of allMembers)
    mc[mb] = months.filter(mo => mms[mo][mb]?.messageCount > 0).length;

  // Build member directory
  const memberDirectory = buildMemberDirectory(allMsgs);

  return { byMonth, months, mms, allMembers, mc, memberDirectory };
}

// ─── REPORT BUILDER ──────────────────────────────────────────────────────────

/**
 * Derive a monthly report from analytics for a given month key.
 */
export function getReport(analytics, selMonth) {
  const { months, mms, allMembers, mc, memberDirectory } = analytics;
  const stats        = mms[selMonth] || {};
  const contributors = Object.values(stats).filter(s => s.messageCount > 0);
  const cNames       = new Set(contributors.map(s => s.sender));
  const silent       = allMembers.filter(m => !cNames.has(m));
  const sorted       = [...contributors].sort((a, b) => b.messageCount - a.messageCount);
  const top          = sorted.slice(0, 10);
  const low          = sorted.filter(s => s.messageCount <= 3);
  const dealPosters  = contributors
    .filter(s => s.dealsPosted > 0)
    .sort((a, b) => b.dealsPosted - a.dealsPosted);
  const minM         = Math.max(1, Math.ceil(months.length * 0.4));
  const consistent   = allMembers.filter(m => mc[m] >= minM && cNames.has(m));
  const totalMessages = contributors.reduce((s, m) => s + m.messageCount, 0);

  // Contribution status counts from directory
  let activeCount   = 0;
  let atRiskCount   = 0;
  let silentCount   = 0;
  for (const [, rec] of memberDirectory) {
    if      (rec.contributionStatus === "Active")   activeCount++;
    else if (rec.contributionStatus === "At-Risk")  atRiskCount++;
    else                                            silentCount++;
  }

  return {
    contributors, silent, top, low, dealPosters, consistent,
    totalMembers:   allMembers.length,
    activeCount:    contributors.length,
    inactiveCount:  silent.length,
    totalMessages,
    avgMessages:    contributors.length
      ? Math.round(totalMessages / contributors.length)
      : 0,
    // Contribution health from directory
    dirActiveCount:  activeCount,
    dirAtRiskCount:  atRiskCount,
    dirSilentCount:  silentCount,
  };
}

// ─── SILENT MEMBER DETECTOR (reusable for future notification cron) ──────────

/**
 * Returns all members whose contribution status is Silent or At-Risk.
 * Scaffold for future automated notification system.
 * @param {Map} memberDirectory
 * @returns {{ silent: MemberRecord[], atRisk: MemberRecord[] }}
 */
export function detectInactiveMembers(memberDirectory) {
  const silent = [];
  const atRisk = [];
  for (const [, rec] of memberDirectory) {
    if      (rec.contributionStatus === "Silent")   silent.push(rec);
    else if (rec.contributionStatus === "At-Risk")  atRisk.push(rec);
  }
  return { silent, atRisk };
}
