export const C = {
  bg:         "#0a0a0f",
  surface:    "#12121a",
  card:       "#1a1a26",
  border:     "#2a2a3e",
  accent:     "#c9a84c",
  accentSoft: "#c9a84c22",
  accentGlow: "#c9a84c44",
  text:       "#e8e0d0",
  textMuted:  "#8884a0",
  textFaint:  "#4a4a6a",
  green:      "#4ade80",
  greenSoft:  "#4ade8022",
  red:        "#f87171",
  redSoft:    "#f8717122",
  blue:       "#60a5fa",
  blueSoft:   "#60a5fa22",
  purple:     "#a78bfa",
  purpleSoft: "#a78bfa22",
  orange:     "#fb923c",
  orangeSoft: "#fb923c22",
};

export const PASSWORDS = [
  "ummamanagement",
  "umma management",
  "ummamanagement2024",
  "umma2024",
  "ummamgmt",
];

// Dashboard navigation tabs
export const TABS = ["overview", "members", "deals", "consistency", "directory", "all members"];

// Contribution status thresholds (days of inactivity)
export const CONTRIBUTION = {
  ACTIVE_DAYS:  30, // Active = message within last 30 days
  AT_RISK_DAYS: 60, // At-Risk = no message in 30-60 days
  // Silent = no message since joining OR >60 days inactive
};

// Export file naming
export const EXPORT_PREFIX = "whatsapp_analytics_export";

// Welcome message pattern used to detect join date & member info
export const JOIN_PATTERN = /welcome to the chat/i;
