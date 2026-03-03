import { COLORS } from "./constants.js";

export function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function initials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function pickColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function toDollarAmount(value) {
  const number = Number(value) || 0;
  return Number.isInteger(number) ? `$${number}` : `$${number.toFixed(2)}`;
}

export function formatDateForUi(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function normalizeTimeLabel(time) {
  if (!time) {
    return null;
  }

  if (/[AP]M$/i.test(time.trim())) {
    return time;
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(String(time).trim());
  if (!match) {
    return null;
  }

  const hour24 = Number(match[1]);
  const minutes = match[2];
  if (hour24 < 0 || hour24 > 23) {
    return null;
  }

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

export function parseUiDateAndTime(uiDate, uiTime) {
  const date = new Date(`${uiDate} ${uiTime}`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}
