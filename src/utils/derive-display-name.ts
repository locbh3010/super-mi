/**
 * Derive a display name from the local-part of an email.
 * "cotexi1034@hotkev.com" -> "cotexi1034"
 * "  foo@bar.com  "       -> "foo"
 * "@x.com" / ""           -> "user"  (empty local-part fallback)
 * "noatsign"              -> "noatsign"
 */
export function deriveDisplayName(email: string): string {
	const local = email.split("@")[0]?.trim();
	return local || "user";
}
