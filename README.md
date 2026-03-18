# UMMA Community Analytics Dashboard

A private, password-protected analytics platform for WhatsApp group communities. Upload one or more WhatsApp chat exports and get instant insights on member activity, contribution health, deal posting, and more.

---

## 🚀 Quick Start

```bash
npm install
npm start
```

App runs at `http://localhost:3000`.

---

## 🔐 Password

Please reach out to Aasim for accessing this platform.

---

## 📁 How to Upload a WhatsApp Chat

1. Open WhatsApp on your phone
2. Go to the group → **⋮ Menu → More → Export Chat → Without Media**
3. Save the `.txt` file
4. Open the dashboard, enter the password
5. Drag & drop the `.txt` file onto the upload area (or click to browse)
6. Add multiple group files to combine data across subgroups

---

## 📊 Dashboard Tabs

| Tab | What it shows |
|-----|--------------|
| **Overview** | Key stats, community health rings, top contributors, silent members |
| **Members** | Per-member message counts, active days, threads, reply ratio, deals |
| **Deals** | Who posts deals vs. who doesn't |
| **Consistency** | Members active across multiple months vs. sporadic |
| **Directory** | Full member profile with store, location, join date, contribution status + Export button |
| **All Members** | Complete roster with store info, monthly stats, and status |

---

## 📥 Exporting Data

1. Go to the **Directory** tab
2. Click **📥 Export Excel** to download a `.xlsx` file
3. Click **CSV** for a plain-text fallback
4. File is named: `whatsapp_analytics_export_<timestamp>.xlsx`

The Excel export includes two sheets:
- **Member Directory** — full structured member profiles
- **Monthly Summary** — message volume and active member counts per month

---

## 🧩 Contribution Status Logic

| Status | Rule |
|--------|------|
| **Active** | Sent a message within the last 30 days |
| **At-Risk** | No messages in 30–60 days |
| **Silent** | No messages since joining, or >60 days inactive |

These thresholds are configurable in `src/constants.js` → `CONTRIBUTION`.

---

## 🔍 Join Date Detection

The parser scans for welcome messages matching the pattern:

```
"Name - Store (Type) @ Location
Welcome to the chat. Please read the description..."
```

- If a join date is found → shown in the Directory tab
- If not found → marked with ⚠ and flagged as "Unknown"

---

## 📂 Project Structure

```
umma-dashboard/
├── package.json                  # Dependencies (React 18, xlsx)
├── README.md
├── public/
│   └── index.html                # HTML entry point + Google Fonts
└── src/
    ├── index.js                  # React root mount
    ├── App.js                    # Password gate wrapper
    ├── constants.js              # Colors, passwords, thresholds, tabs
    ├── utils/
    │   ├── parser.js             # WhatsApp parser, analytics engine, member directory builder
    │   └── helpers.js            # Display formatting, export utilities
    └── components/
        ├── PasswordGate.js       # Login screen
        ├── Dashboard.js          # All tab views + layout
        ├── DirectoryTab.js       # Member directory + export + admin notifications scaffold
        └── ui.js                 # Shared: Ring, TrendBars, Panel, Badges
```

---

## ⚙️ Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | DOM rendering |
| react-scripts | 5.0.1 | CRA build toolchain |
| xlsx | ^0.18.5 | Excel export |

No environment variables required.

---

## 🔮 Coming Soon

- **Admin Notifications** — weekly email reports to up to 4 admin addresses (scaffold is in place in the Directory tab; backend integration pending)
- The `detectInactiveMembers()` function in `parser.js` is ready for use in a future cron job or server-side notification service

---

## ⚠️ Assumptions

- WhatsApp export format: `[M/D/YY, H:MM:SS AM/PM] Sender: Message`
- Join date detection relies on welcome messages containing "Welcome to the chat" — if admins use different phrasing, join dates will be flagged
- Deal detection is keyword-based (gram, labor, $/..., discount, etc.) — some false positives or misses are expected
- "Active/At-Risk/Silent" status is computed relative to the current date at time of upload, not a fixed reference date
