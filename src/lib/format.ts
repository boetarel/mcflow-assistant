export const NOT_SPECIFIED = "Not specified";
/** Joins list items as bullets; an empty list becomes "Not specified" (never invented content). */
export const bullets = (items: string[]) => {
  const clean = items.map((s) => s.trim()).filter(Boolean);
  return clean.length ? clean.map((s) => `• ${s}`).join("\n") : NOT_SPECIFIED;
};
export const orNotSpecified = (s: string) => s.trim() || NOT_SPECIFIED;
export const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());
