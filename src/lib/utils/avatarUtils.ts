/**
 * Universal Avatar & Initials Utilities for QUANTERS
 * Generates beautiful, deterministic SVG initials avatars with Quanta brand styling
 * and detects outdated/stock placeholder avatars.
 */

// Distinct, high-contrast, premium color palettes for letter avatars
const AVATAR_PALETTES = [
  { bg: "#0F1E36", border: "#38BDF8", text: "#FFFFFF" }, // Quanta Deep Navy & Cyan
  { bg: "#1E293B", border: "#7DD3FC", text: "#FFFFFF" }, // Slate & Sky
  { bg: "#064E3B", border: "#34D399", text: "#FFFFFF" }, // Deep Emerald & Mint
  { bg: "#312E81", border: "#A5B4FC", text: "#FFFFFF" }, // Royal Indigo
  { bg: "#4C1D95", border: "#C4B5FD", text: "#FFFFFF" }, // Deep Violet
  { bg: "#701A75", border: "#F472B6", text: "#FFFFFF" }, // Vivid Fuchsia
  { bg: "#78350F", border: "#FBBF24", text: "#FFFFFF" }, // Warm Amber
  { bg: "#134E4A", border: "#2DD4BF", text: "#FFFFFF" }, // Deep Teal
  { bg: "#831843", border: "#FB7185", text: "#FFFFFF" }, // Deep Rose
  { bg: "#1E1B4B", border: "#60A5FA", text: "#FFFFFF" }, // Midnight Blue
];

/**
 * Generates a crisp, responsive SVG Data URI avatar featuring the first letter
 * of the member's name with an elegant circular accent border.
 */
export function generateInitialsAvatar(name?: string): string {
  const clean = (name || "Quanter").trim();
  const letter = clean.charAt(0).toUpperCase() || "Q";

  // Pick deterministic palette from letter char code
  const charCode = letter.charCodeAt(0) || 0;
  const palette = AVATAR_PALETTES[charCode % AVATAR_PALETTES.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <circle cx="64" cy="64" r="64" fill="${palette.bg}"/>
    <circle cx="64" cy="64" r="60" fill="none" stroke="${palette.border}" stroke-width="3.5" stroke-opacity="0.8"/>
    <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="${palette.text}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="800" font-size="58" letter-spacing="-1">${letter}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Checks whether an avatar URL is a legacy stock placeholder (e.g. Unsplash stock girl,
 * icon-192, default logo) rather than a genuine user-uploaded or Google photo.
 */
export function isDefaultOrPlaceholderAvatar(avatarUrl?: string | null): boolean {
  if (!avatarUrl || typeof avatarUrl !== "string") return true;
  const trimmed = avatarUrl.trim();
  if (!trimmed) return true;

  // Stock Unsplash image URL previously hardcoded
  if (trimmed.includes("photo-1534528741775")) return true;

  // Generic app icons
  if (trimmed.includes("icon-192") || trimmed.includes("icon-512")) return true;

  // Generic brand logos used as avatars
  if (trimmed.includes("logo_quanta_opt") || trimmed.includes("logo_quanta")) return true;

  // Generic placeholder paths
  if (trimmed.toLowerCase().includes("default-avatar") || trimmed.toLowerCase().includes("placeholder")) {
    return true;
  }

  return false;
}

/**
 * Resolves the effective avatar URL for any member:
 * Returns the member's custom avatar if valid, or a generated initials avatar if missing/placeholder.
 */
export function getEffectiveMemberAvatar(member?: { fullName?: string; avatarUrl?: string | null } | null): string {
  if (!member) return generateInitialsAvatar("Q");
  if (member.avatarUrl && !isDefaultOrPlaceholderAvatar(member.avatarUrl)) {
    return member.avatarUrl;
  }
  return generateInitialsAvatar(member.fullName);
}
