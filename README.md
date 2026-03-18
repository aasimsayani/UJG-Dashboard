# UMMA Community Analytics Dashboard
**Built by Aasim Sayani · Fuse Jewelry**

A password-protected analytics platform for WhatsApp group communities. Upload one or more WhatsApp chat exports and instantly analyse member activity, contribution health, store info, and join dates.

---

## 🚀 Setup

```bash
npm install
npm start
```

App runs at `http://localhost:3000`. That's it — no environment variables required.

---

## 🔐 Password

Default: **`ummamanagement`**

Accepted variants (spacing and capitalisation ignored):
`ummamanagement` · `umma management` · `ummamanagement2024` · `umma2024` · `ummamgmt`

To change: edit `src/constants.js` → `PASSWORDS` array.

---

## 📁 Uploading a WhatsApp Chat

1. Open WhatsApp on your phone
2. Open the group → **⋮ → More → Export Chat → Without Media**
3. Save the `.txt` file
4. Enter the dashboard password
5. Drag & drop the `.txt` file onto the upload screen (or click to browse)
6. To combine multiple subgroups, upload them one at a time using **+ Add Group**

### Deals Analysis Toggle
On the upload screen, check **"Include Deals Analysis"** to flag deal-related messages in the dataset. This prepares the data for a future Deals tab (no separate tab is shown yet).

---

## 📊 Dashboard Tabs

### Overview
- Total / Active / At-Risk / Silent member counts
- Contribution health rings
- Top contributors (all-time)
- Silent member list
- **Export Data button** (Excel + CSV)

### Directory
- Full member profiles: First Name, Last Name, Store, Location, Join Date, Messages, Last Active, Status
- Filter by contribution status
- Search by name, store, or location
- ⚠ flag on join dates that could not be detected from the chat

### Consistency
- Members grouped into Active / At-Risk / Silent with rules displayed
- Per-category lists with last active dates

---

## 📥 Exporting Data

1. Go to the **Overview** tab
2. Click **📥 Export Data** → downloads `.xlsx`
3. Click **CSV** for a plain-text fallback

File is named: `whatsapp_analytics_export_<timestamp>.xlsx`

**Sheets included:**
- `Member Directory` — full normalised profiles
- `Monthly Summary` — message volume per month

---

## 🤝 Contribution Status Rules

| Status   | Rule |
|----------|------|
| Active   | Sent a message within the last 30 days |
| At-Risk  | No messages in 30–60 days |
| Silent   | No messages since joining, or >60 days inactive |

Thresholds are configurable in `src/constants.js` → `CONTRIBUTION`.

---

## 🔍 Join Date Detection

The parser scans for welcome messages containing **"Welcome to the chat"** and reads the structured intro line above it:

```
Sania Dayyani - Cali Jewelers (Retail) @ Houston TX
Welcome to the chat. Please read the description...
```

- **Found** → join date, store name, and location are extracted and displayed
- **Not found** → join date shows "Not Available" with a ⚠ flag

---

## 📂 Project Structure

```
umma-dashboard/
├── package.json
├── README.md
├── public/
│   └── index.html
└── src/
    ├── index.js            React root
    ├── App.js              Password gate wrapper
    ├── constants.js        Colors, passwords, tabs, thresholds
    ├── utils/
    │   ├── parser.js       WhatsApp parser · name normaliser · analytics engine
    │   └── helpers.js      Display formatting · export utilities
    └── components/
        ├── PasswordGate.js Login screen
        ├── Dashboard.js    Layout, routing, upload screen
        ├── OverviewTab.js  Overview + export
        ├── DirectoryTab.js Member directory table
        ├── ConsistencyTab.js Contribution groupings
        └── ui.js           Shared: Ring, TrendBars, Panel, Badges, Avatar, Signature
```

---

## 📦 Dependencies

| Package        | Purpose         |
|----------------|-----------------|
| react ^18.2.0  | UI framework    |
| react-dom      | DOM rendering   |
| react-scripts  | Build toolchain |
| xlsx ^0.18.5   | Excel export    |

---

*Built by Aasim Sayani · Fuse Jewelry*
