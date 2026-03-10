const DEAL_KW = [
  "deal", "$/", "gram", "labor", "wholesale", "discount",
  "special", "offer", "sale", "pricing", "kilo", "carat",
];

export function parseExport(text) {
  const lines = text.split("\n");
  const msgs = [];
  const re = /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s*(\d{1,2}:\d{2}:\d{2}(?:\s*[AP]M)?)\]\s+(.+?):\s([\s\S]*)/;
  let cur = null;

  for (const line of lines) {
    const m = line.match(re);
    if (m) {
      if (cur) msgs.push(cur);
      const [, mo, d, yr, , sender, body] = m;
      let year = parseInt(yr);
      if (year < 100) year += 2000;
      const date = new Date(year, parseInt(mo) - 1, parseInt(d));
      const bl = body.toLowerCase();

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

      const hasMedia = body.includes("<attached:") || body.startsWith("‎<");

      cur = {
        date,
        month: `${year}-${String(parseInt(mo)).padStart(2, "0")}`,
        sender: sender.trim(),
        body: body.trim(),
        isSystem,
        isDeals,
        hasMedia,
        isReply: false,
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
      if (diff >= 0 && diff < 600000) c.isReply = true;
    }
  }
  return msgs;
}

export function computeAnalytics(allMsgs) {
  const msgs = allMsgs.filter((m) => !m.isSystem);
  const byMonth = {};
  for (const m of msgs) {
    if (!byMonth[m.month]) byMonth[m.month] = [];
    byMonth[m.month].push(m);
  }
  const months = Object.keys(byMonth).sort();
  const mms = {}; // mms[month][sender]

  for (const month of months) {
    mms[month] = {};
    const mm = byMonth[month];
    for (const m of mm) {
      if (!mms[month][m.sender]) {
        mms[month][m.sender] = {
          sender: m.sender,
          messageCount: 0,
          activeDays: new Set(),
          replies: 0,
          dealsPosted: 0,
          threadsStarted: 0,
        };
      }
      const s = mms[month][m.sender];
      s.messageCount++;
      s.activeDays.add(m.date.toISOString().split("T")[0]);
      if (m.isReply) s.replies++;
      if (m.isDeals) s.dealsPosted++;
    }
    // Thread detection: gap > 1hr or different sender
    let lt = null, ls = null;
    for (const m of mm) {
      const gap = lt ? m.date - lt : Infinity;
      if (gap > 3600000 || ls !== m.sender) {
        if (mms[month][m.sender]) mms[month][m.sender].threadsStarted++;
      }
      lt = m.date;
      ls = m.sender;
    }
  }

  // Finalise activeDays from Set → number
  for (const month of months)
    for (const s of Object.keys(mms[month]))
      mms[month][s].activeDays = mms[month][s].activeDays.size;

  const allMembers = [...new Set(months.flatMap((mo) => Object.keys(mms[mo])))];
  const mc = {}; // member consistency: months active count
  for (const mb of allMembers)
    mc[mb] = months.filter((mo) => mms[mo][mb]?.messageCount > 0).length;

  return { byMonth, months, mms, allMembers, mc };
}

export function getReport(analytics, selMonth) {
  const { months, mms, allMembers, mc } = analytics;
  const stats = mms[selMonth] || {};
  const contributors = Object.values(stats).filter((s) => s.messageCount > 0);
  const cNames = new Set(contributors.map((s) => s.sender));
  const silent = allMembers.filter((m) => !cNames.has(m));
  const sorted = [...contributors].sort((a, b) => b.messageCount - a.messageCount);
  const top = sorted.slice(0, 10);
  const low = sorted.filter((s) => s.messageCount <= 3);
  const dealPosters = contributors
    .filter((s) => s.dealsPosted > 0)
    .sort((a, b) => b.dealsPosted - a.dealsPosted);
  const minM = Math.max(1, Math.ceil(months.length * 0.4));
  const consistent = allMembers.filter((m) => mc[m] >= minM && cNames.has(m));
  const totalMessages = contributors.reduce((s, m) => s + m.messageCount, 0);
  return {
    contributors, silent, top, low, dealPosters, consistent,
    totalMembers: allMembers.length,
    activeCount: contributors.length,
    inactiveCount: silent.length,
    totalMessages,
    avgMessages: contributors.length
      ? Math.round(totalMessages / contributors.length)
      : 0,
  };
}
