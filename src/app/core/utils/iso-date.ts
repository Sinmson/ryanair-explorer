const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses API `YYYY-MM-DD` into a local calendar `Date` (midnight).
 * Use in provider mappers when building generic models; avoids `new Date("…")` UTC issues.
 */
export function parseIsoDateOnlyToLocalDate(isoDateOnly: string): Date {
  const m = ISO_DATE_ONLY.exec(isoDateOnly.trim());
  if (!m) {
    throw new Error(`Expected YYYY-MM-DD, got: ${isoDateOnly}`);
  }
  const y = Number(m[1]);
  const month = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(y, month, d);
}

/**
 * EasyJet CMS dates may be `YYYY-MM-DD` or full ISO datetimes — parse to local `Date`.
 */
export function parseEasyJetApiDate(value: string): Date {
  const trimmed = value.trim();
  if (ISO_DATE_ONLY.test(trimmed)) {
    return parseIsoDateOnlyToLocalDate(trimmed);
  }
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) {
    throw new Error(`Unparseable date: ${value}`);
  }
  return new Date(ms);
}

/** Local calendar `YYYY-MM-DD` from a `Date` (e.g. filter API rows against ISO date-only bounds). */
export function formatLocalIsoDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

