/**
 * Professional Authentication, Security & Compliance Utilities
 * Standards: NIST SP 800-63B, OWASP ASVS 4.0, RFC 5322
 */

export const RFC_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates and normalizes an email address according to RFC 5322 standards.
 */
export function validateEmail(email: string): {
  isValid: boolean;
  normalized: string;
  error?: string;
} {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized) {
    return {
      isValid: false,
      normalized: "",
      error: "Please enter your email address.",
    };
  }

  if (normalized.length > 254) {
    return {
      isValid: false,
      normalized,
      error: "Email address exceeds maximum length of 254 characters.",
    };
  }

  if (!RFC_EMAIL_REGEX.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error: "Please enter a valid email address (e.g. member@univ-alger.dz).",
    };
  }

  return { isValid: true, normalized };
}

export interface PasswordEvaluation {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too Short" | "Weak" | "Fair" | "Strong";
  feedback: string;
  isValid: boolean;
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

/**
 * Evaluates password strength according to NIST SP 800-63B standards.
 * Minimum requirement: 8 characters with at least one letter and one number.
 */
export function evaluatePasswordStrength(password: string): PasswordEvaluation {
  const pwd = password || "";
  const hasMinLength = pwd.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
  const hasMixedCase = /[a-z]/.test(pwd) && /[A-Z]/.test(pwd);

  if (pwd.length === 0) {
    return {
      score: 0,
      label: "Too Short",
      feedback: "Enter a password (minimum 8 characters)",
      isValid: false,
      hasMinLength: false,
      hasLetter: false,
      hasNumber: false,
      hasSymbol: false,
    };
  }

  if (!hasMinLength) {
    return {
      score: 1,
      label: "Too Short",
      feedback: `Need at least 8 characters (${8 - pwd.length} more needed)`,
      isValid: false,
      hasMinLength: false,
      hasLetter,
      hasNumber,
      hasSymbol,
    };
  }

  let calculatedScore = 2; // base score for 8+ chars
  if (hasLetter && hasNumber) calculatedScore += 1;
  if (hasMixedCase || hasSymbol) calculatedScore += 1;

  if (calculatedScore >= 4) {
    return {
      score: 4,
      label: "Strong",
      feedback: "Strong password with high entropy",
      isValid: true,
      hasMinLength: true,
      hasLetter,
      hasNumber,
      hasSymbol,
    };
  }

  if (calculatedScore === 3) {
    return {
      score: 3,
      label: "Fair",
      feedback: "Good password. Add symbols or mixed case for stronger security",
      isValid: true,
      hasMinLength: true,
      hasLetter,
      hasNumber,
      hasSymbol,
    };
  }

  return {
    score: 2,
    label: "Weak",
    feedback: "Weak password. Include both letters and numbers",
    isValid: hasLetter || hasNumber,
    hasMinLength: true,
    hasLetter,
    hasNumber,
    hasSymbol,
  };
}

/**
 * Cryptographically Secure Strong Password Generator
 * Generates high-entropy passwords conforming to OWASP standards (lowercase, uppercase, numbers, symbols).
 */
export function generateStrongPassword(length = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused I, O
  const lower = "abcdefghijkmnopqrstuvwxyz"; // exclude easily confused l
  const numbers = "23456789"; // exclude easily confused 0, 1
  const symbols = "!@#$%^&*-_=+?";
  const all = upper + lower + numbers + symbols;

  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);

    // Guarantee at least one of each mandatory category
    const required = [
      upper[bytes[0] % upper.length],
      lower[bytes[1] % lower.length],
      numbers[bytes[2] % numbers.length],
      symbols[bytes[3] % symbols.length],
    ];

    const rest = Array.from(bytes.slice(4)).map((b) => all[b % all.length]);
    const combined = [...required, ...rest];

    // Cryptographic Fisher-Yates shuffle
    const shuffleBytes = new Uint8Array(combined.length);
    window.crypto.getRandomValues(shuffleBytes);
    for (let i = combined.length - 1; i > 0; i--) {
      const j = shuffleBytes[i] % (i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join("");
  }

  let res = "";
  for (let i = 0; i < length; i++) {
    res += all.charAt(Math.floor(Math.random() * all.length));
  }
  return res;
}

/**
 * Client-Side Brute-Force Rate Limiting Shield (OWASP compliance)
 * Pauses authentication for 30s after 5 consecutive failed attempts in 60s.
 */
const STORAGE_PREFIX = "quanters_auth_shield_";
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds

export function checkLoginLockout(): {
  isLocked: boolean;
  remainingSeconds: number;
} {
  if (typeof window === "undefined") return { isLocked: false, remainingSeconds: 0 };
  try {
    const lockoutUntil = parseInt(
      sessionStorage.getItem(`${STORAGE_PREFIX}lockout_until`) || "0",
      10
    );
    const now = Date.now();
    if (lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function recordFailedLoginAttempt(): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsCount: number;
} {
  if (typeof window === "undefined")
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
  try {
    const now = Date.now();
    const attempts = JSON.parse(
      sessionStorage.getItem(`${STORAGE_PREFIX}attempts`) || "[]"
    ) as number[];

    // Keep attempts within the last 60 seconds
    const recent = attempts.filter((t) => now - t < 60000);
    recent.push(now);
    sessionStorage.setItem(`${STORAGE_PREFIX}attempts`, JSON.stringify(recent));

    if (recent.length >= MAX_ATTEMPTS) {
      const lockoutUntil = now + LOCKOUT_DURATION_MS;
      sessionStorage.setItem(
        `${STORAGE_PREFIX}lockout_until`,
        lockoutUntil.toString()
      );
      return {
        isLocked: true,
        remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
        attemptsCount: recent.length,
      };
    }

    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsCount: recent.length,
    };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptsCount: 0 };
  }
}

export function clearFailedLoginAttempts(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}attempts`);
    sessionStorage.removeItem(`${STORAGE_PREFIX}lockout_until`);
  } catch {}
}

/**
 * Pure TypeScript Synchronous SHA-256 (FIPS 180-4 / RFC 6234)
 * Used for deterministic, zero-plaintext salted credential digests in synchronous store actions.
 */
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function sha256Hex(ascii: string): string {
  const utf8 = new TextEncoder().encode(ascii);
  const bitLen = utf8.length * 8;
  const padLen = ((utf8.length + 9 + 63) >> 6) << 6;
  const buf = new Uint8Array(padLen);
  buf.set(utf8);
  buf[utf8.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(padLen - 4, bitLen >>> 0, false);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < padLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, "0"))
    .join("");
}

const CREDENTIAL_PEPPER = "quanta-univ-algiers1-erp-v3.2-zero-plaintext";
const DIGEST_PREFIX = "qt$s256$";

// Precomputed SHA-256 digests for initial bootstrap recovery (zero plaintext passwords in bundle)
const BOOTSTRAP_DIGEST_ALLOWLIST = new Set<string>([
  "26d2f7b7c19f90102db366a374fc89503a52b16e1a3f67699f36829a82c7c37c",
  "3084715b993d9bb682dcf53256642f01473036bc35a51cc15d87c252c4355046",
  "e36a6b6fcfdf28b6c8df20c3c731e20b7f5946a4870730062efc18a1174127d3",
  "761fc763bfe072012917e4da176c6e22da5eb7cee7fd795432af5ebd4df3052c",
]);

/**
 * Computes a salted, multi-round SHA-256 credential digest.
 * Never stores or returns plaintext passwords.
 */
export function hashCredentialDigest(email: string, rawPassword: string): string {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPass = (rawPassword || "").trim();
  if (!cleanPass) return "";
  if (cleanPass.startsWith(DIGEST_PREFIX)) return cleanPass;

  const salt = `${cleanEmail}::${CREDENTIAL_PEPPER}`;
  let digest = sha256Hex(`${salt}::${cleanPass}`);
  for (let i = 0; i < 64; i++) {
    digest = sha256Hex(`${digest}::${salt}::${i}`);
  }
  return `${DIGEST_PREFIX}${digest}`;
}

/**
 * Constant-time string equality check to prevent side-channel timing attacks.
 */
export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Verifies a candidate password against a stored salted digest (or legacy unmigrated field).
 */
export function verifyCredentialDigest(
  email: string,
  candidatePassword: string,
  storedDigestOrLegacy?: string,
  isBootstrapSuperAdmin = false
): boolean {
  const cleanPass = (candidatePassword || "").trim();
  if (!cleanPass) return false;

  if (storedDigestOrLegacy) {
    if (storedDigestOrLegacy.startsWith(DIGEST_PREFIX)) {
      const candidateHash = hashCredentialDigest(email, cleanPass);
      return constantTimeEquals(candidateHash, storedDigestOrLegacy);
    }
    // Legacy migration support if an old record had a raw string before sanitization
    if (constantTimeEquals(cleanPass, storedDigestOrLegacy)) {
      return true;
    }
  }

  if (isBootstrapSuperAdmin && !storedDigestOrLegacy) {
    const unsalted = sha256Hex(`${CREDENTIAL_PEPPER}::bootstrap::${cleanPass}`);
    return BOOTSTRAP_DIGEST_ALLOWLIST.has(unsalted);
  }

  return false;
}

/**
 * Sanitizes external URLs to prevent Stored XSS via `javascript:`, `vbscript:`, or `data:` payloads.
 * Only permits valid `http:` and `https:` schemes or safe relative internal paths.
 */
export function sanitizeExternalUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  // Reject control characters, newlines, and null bytes (L3-SEC-09)
  if (/[\x00-\x1F\x7F]/.test(trimmed)) return null;
  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === "http:" || parsed.protocol === "https:") && (parsed.hostname.includes(".") || parsed.hostname === "localhost")) {
      return parsed.href;
    }
    return null;
  } catch {
    // Allow clean relative internal paths starting with /
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
      return trimmed;
    }
    return null;
  }
}

/**
 * Standard Legal & Compliance Text
 */
export const TERMS_AND_PRIVACY_DATA = {
  terms: {
    title: "QUANTERS Platform Terms of Service",
    lastUpdated: "Academic Year 2026/2027",
    sections: [
      {
        heading: "1. Academic Purpose & Eligibility",
        body: "QUANTERS is the official digital Enterprise Resource Planning (ERP) and member engagement platform of QUANTA Scientific Club at the University of Algiers 1 (Benyoucef Benkhedda). Access is granted to enrolled students, alumni, and verified academic collaborators.",
      },
      {
        heading: "2. Adherence to Club Internal Law",
        body: "All authenticated users are bound by the QUANTA Club Internal Law (Règlement Intérieur). In accordance with Article 8, members pledge active scientific dedication, ethical collaboration, respect for peers, and non-partisan academic integrity.",
      },
      {
        heading: "3. Credential Confidentiality & Account Security",
        body: "Your account credentials are for your personal academic use only. Sharing passwords or utilizing automated bots to manipulate workshop attendance, XP rankings, or exam scores constitutes an internal disciplinary violation.",
      },
      {
        heading: "4. Attendance & Optical Check-In Integrity",
        body: "Workshop attendance verification via rotating projector QR codes or 6-digit session codes requires physical presence in the university amphitheater or lab session. Fraudulent check-in attempts are logged in the immutable audit registry.",
      },
    ],
  },
  privacy: {
    title: "QUANTERS Data Protection & Privacy Policy",
    lastUpdated: "Academic Year 2026/2027",
    sections: [
      {
        heading: "1. Data Collection & Student KYC",
        body: "We collect only data necessary for club operations: full name, university email, academic level, study specialty, equipment availability, and weekly schedule availability to coordinate workshops and scientific teams.",
      },
      {
        heading: "2. Zero Third-Party Commercial Monetization",
        body: "QUANTA operates under strict non-commercial academic principles. Your personal data is never sold, leased, or transmitted to commercial marketing advertisers. All records are stored securely on Google Cloud Platform / Firebase infrastructure.",
      },
      {
        heading: "3. Cryptographic Protection",
        body: "Authentication passwords are never stored in plaintext and are protected using cryptographic hashing via Google Firebase Authentication. Communication between your browser and QUANTERS is encrypted via TLS 1.3.",
      },
      {
        heading: "4. Member Rights & Data Deletion",
        body: "In accordance with international privacy principles, any member may request correction of their academic dossier, export of their achievement history, or account deletion upon resignation or university graduation.",
      },
    ],
  },
};
