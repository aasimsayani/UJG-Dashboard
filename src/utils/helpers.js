import { PASSWORDS } from "../constants";

const norm = (s) => s.toLowerCase().replace(/[\s\-_.]+/g, "").trim();
export const checkPassword = (v) => PASSWORDS.some((p) => norm(p) === norm(v));

export const initials = (n) =>
  n.split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();

export const shortName = (n) => n.split(/\s+/)[0] || n;

export const fmtMonth = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
};
