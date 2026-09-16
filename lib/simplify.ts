export function looksLikeMinify(original: string, rewritten: string) {
  const lines = rewritten.split("\n").filter((line) => line.trim());
  if (!lines.length) return true;

  const longest = Math.max(...lines.map((line) => line.length));
  if (longest > 96) return true;

  const compact = (value: string) => value.replace(/\s+/g, "");
  const a = compact(original);
  const b = compact(rewritten);
  if (a && b && a === b) return true;

  const squeezedOriginal = original.replace(/\s+/g, " ").trim();
  const squeezedRewrite = rewritten.replace(/\s+/g, " ").trim();
  if (squeezedOriginal === squeezedRewrite) return true;

  return false;
}
