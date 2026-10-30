/**
 * Advanced Multi-Provider Real-Time Email Verification Engine
 * Supports ZeroBounce and AbstractAPI with multi-key rotation and automatic failover.
 */

export interface EmailVerificationResult {
  valid: boolean;
  deliverable: boolean;
  status: "valid" | "invalid" | "disposable" | "typo" | "unknown";
  reason?: string;
  suggestedDomain?: string;
  providerUsed?: string;
  cached?: boolean;
}

// 1. Comprehensive Disposable Email Provider Blacklist (FREE, Instant, 0 API Calls)
export const DISPOSABLE_DOMAINS = new Set<string>([
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.biz",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "mailinator.com",
  "yopmail.com",
  "yopmail.fr",
  "trashmail.com",
  "trashmail.net",
  "trashmail.me",
  "dispostable.com",
  "fakemailgenerator.com",
  "throwawaymail.com",
  "getairmail.com",
  "crazymailing.com",
  "mohmal.com",
  "mohmal.im",
  "nada.ltd",
  "inboxkitten.com",
  "mytemp.email",
  "generator.email",
  "dropmail.me",
  "emailondeck.com",
  "minuteinbox.com",
  "burnermail.io",
  "tempail.com",
  "boun.cr",
  "maildrop.cc",
  "getnada.com",
  "airmail.cc",
  "mailnull.com",
  "mytempmail.com",
  "fakemail.net",
  "armyspy.com",
  "cuvox.de",
  "dayrep.com",
  "fleckens.hu",
  "gustr.com",
  "jourrapide.com",
  "rhyta.com",
  "superrito.com",
  "teleworm.us",
  "tinemail.com",
  "mailnesia.com",
  "guerrillamail.info",
  "guerrillamail.de",
  "trashmail.org",
  "10minutemail.net",
  "10minutemail.org",
  "mytempmail.org",
  "moakt.com",
  "crazymailing.org",
  "disposablemail.com",
  "throwawayemail.com",
  "tempmailaddress.com",
  "getairmail.net",
  "inboxbear.com",
  "trash-mail.at",
  "spambog.com",
  "spamgourmet.com",
]);

// 2. Common Domain Typo Corrections
export const DOMAIN_TYPOS: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaik.com": "gmail.com",
  "gmaul.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "univ-alger.com": "univ-alger.dz",
  "univ-algiers.dz": "univ-alger.dz",
};

export interface VerificationProviderKey {
  provider: "zerobounce" | "abstract";
  key: string;
  label: string;
}

// In-Memory cache of exhausted keys with cooldown (10 minutes)
const exhaustedKeys = new Map<string, number>();

// In-Memory verification cache (7 days)
const verificationCache = new Map<string, { result: EmailVerificationResult; expiresAt: number }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Validates basic email syntax
 */
export function validateEmailSyntax(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  // RFC 5322 compliant regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed);
}

/**
 * Checks if domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}

/**
 * Checks if the email domain has a known typo
 */
export function checkDomainTypo(email: string): string | null {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1]?.trim().toLowerCase();
  return domain && DOMAIN_TYPOS[domain] ? DOMAIN_TYPOS[domain] : null;
}

/**
 * Check cached verification result
 */
function getCachedVerification(email: string): EmailVerificationResult | null {
  const norm = email.trim().toLowerCase();
  
  // 1. In-Memory
  const mem = verificationCache.get(norm);
  if (mem && Date.now() < mem.expiresAt) {
    return { ...mem.result, cached: true };
  }

  // 2. LocalStorage (client-side)
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`quanters_email_v_${norm}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return { ...parsed.result, cached: true };
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Store verification result in cache
 */
function setCachedVerification(email: string, result: EmailVerificationResult): void {
  const norm = email.trim().toLowerCase();
  const expiresAt = Date.now() + CACHE_TTL_MS;

  verificationCache.set(norm, { result, expiresAt });

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        `quanters_email_v_${norm}`,
        JSON.stringify({ result, expiresAt })
      );
    } catch {}
  }
}

/**
 * Verify email using ZeroBounce API
 */
async function verifyWithZeroBounce(
  email: string,
  key: string
): Promise<{ status: "valid" | "invalid" | "unknown"; deliverable: boolean; reason?: string } | null> {
  const url = `https://api.zerobounce.net/v2/validate?api_key=${encodeURIComponent(
    key
  )}&email=${encodeURIComponent(email)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (res.status === 429 || res.status === 402 || res.status === 401) {
    // Quota exhausted or invalid key
    return null;
  }
  if (!res.ok) return null;

  const data = await res.json();
  const zbStatus = (data.status || "").toLowerCase();

  if (zbStatus === "valid") {
    return { status: "valid", deliverable: true };
  }
  if (zbStatus === "invalid") {
    return {
      status: "invalid",
      deliverable: false,
      reason: data.sub_status ? `ZeroBounce: ${data.sub_status}` : "Mailbox does not exist",
    };
  }
  if (zbStatus === "catch-all" || zbStatus === "unknown") {
    return { status: "valid", deliverable: true, reason: "Accepts mail (Catch-All)" };
  }
  if (zbStatus === "spamtrap" || zbStatus === "abuse" || zbStatus === "do_not_mail") {
    return { status: "invalid", deliverable: false, reason: "Spam trap / high-risk email" };
  }

  return { status: "valid", deliverable: true };
}

/**
 * Verify email using AbstractAPI Email Validation
 */
async function verifyWithAbstractApi(
  email: string,
  key: string
): Promise<{ status: "valid" | "invalid" | "unknown"; deliverable: boolean; reason?: string } | null> {
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${encodeURIComponent(
    key
  )}&email=${encodeURIComponent(email)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (res.status === 429 || res.status === 402 || res.status === 401) {
    // Quota exhausted or invalid key
    return null;
  }
  if (!res.ok) return null;

  const data = await res.json();
  const deliverability = (data.deliverability || "").toUpperCase();
  const isSmtpValid = Boolean(data.is_smtp_valid?.value);

  if (deliverability === "DELIVERABLE" && isSmtpValid) {
    return { status: "valid", deliverable: true };
  }
  if (deliverability === "UNDELIVERABLE" || (!isSmtpValid && data.is_smtp_valid?.text?.includes("failed"))) {
    return {
      status: "invalid",
      deliverable: false,
      reason: "AbstractAPI: Mailbox not found on host",
    };
  }
  if (data.is_disposable_email?.value === true) {
    return { status: "invalid", deliverable: false, reason: "Disposable email detected" };
  }

  // Risky or unknown: allow gracefully
  return { status: "valid", deliverable: true };
}

/**
 * Master Verification Pipeline with Multi-Key Failover
 */
export async function verifyEmailWithFailover(
  email: string,
  customKeys?: VerificationProviderKey[]
): Promise<EmailVerificationResult> {
  const normEmail = (email || "").trim().toLowerCase();

  // 1. Fast Syntax Validation (Free, 0ms)
  if (!validateEmailSyntax(normEmail)) {
    return {
      valid: false,
      deliverable: false,
      status: "invalid",
      reason: "Invalid email syntax format",
    };
  }

  // 2. Domain Typo Suggestion (Free, 0ms)
  const typo = checkDomainTypo(normEmail);
  if (typo) {
    const suggested = normEmail.split("@")[0] + "@" + typo;
    return {
      valid: false,
      deliverable: false,
      status: "typo",
      suggestedDomain: suggested,
      reason: `Did you mean ${suggested}?`,
    };
  }

  // 3. Disposable Email Blacklist (Free, 0ms)
  if (isDisposableEmail(normEmail)) {
    return {
      valid: false,
      deliverable: false,
      status: "disposable",
      reason: "Disposable and temporary email addresses are not allowed.",
    };
  }

  // 4. Cache Check (Free, 0ms)
  const cached = getCachedVerification(normEmail);
  if (cached) {
    return cached;
  }

  // 5. Gather Configured Keys (from parameters, settings, or env)
  const keysToTry: VerificationProviderKey[] = [];

  if (customKeys && customKeys.length > 0) {
    keysToTry.push(...customKeys);
  }

  // Add env keys if defined
  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_ZEROBOUNCE_KEY_1) {
      keysToTry.push({ provider: "zerobounce", key: process.env.NEXT_PUBLIC_ZEROBOUNCE_KEY_1, label: "ZeroBounce Primary" });
    }
    if (process.env.NEXT_PUBLIC_ZEROBOUNCE_KEY_2) {
      keysToTry.push({ provider: "zerobounce", key: process.env.NEXT_PUBLIC_ZEROBOUNCE_KEY_2, label: "ZeroBounce Secondary" });
    }
    if (process.env.NEXT_PUBLIC_ABSTRACT_KEY_1) {
      keysToTry.push({ provider: "abstract", key: process.env.NEXT_PUBLIC_ABSTRACT_KEY_1, label: "AbstractAPI Primary" });
    }
    if (process.env.NEXT_PUBLIC_ABSTRACT_KEY_2) {
      keysToTry.push({ provider: "abstract", key: process.env.NEXT_PUBLIC_ABSTRACT_KEY_2, label: "AbstractAPI Secondary" });
    }
  }

  // If no external keys are configured, return valid based on syntax and disposable checks
  if (keysToTry.length === 0) {
    const result: EmailVerificationResult = {
      valid: true,
      deliverable: true,
      status: "valid",
      reason: "Format and domain verified",
    };
    setCachedVerification(normEmail, result);
    return result;
  }

  // 6. Failover Loop across all keys
  const now = Date.now();
  for (const item of keysToTry) {
    // Skip if key is known to be exhausted recently (within 10 mins)
    const exhaustedUntil = exhaustedKeys.get(item.key);
    if (exhaustedUntil && now < exhaustedUntil) {
      continue;
    }

    try {
      let outcome: { status: "valid" | "invalid" | "unknown"; deliverable: boolean; reason?: string } | null = null;

      if (item.provider === "zerobounce") {
        outcome = await verifyWithZeroBounce(normEmail, item.key);
      } else if (item.provider === "abstract") {
        outcome = await verifyWithAbstractApi(normEmail, item.key);
      }

      if (outcome) {
        const finalResult: EmailVerificationResult = {
          valid: outcome.deliverable,
          deliverable: outcome.deliverable,
          status: outcome.status,
          reason: outcome.reason,
          providerUsed: item.label || item.provider,
        };
        setCachedVerification(normEmail, finalResult);
        return finalResult;
      } else {
        // Mark key as exhausted for 10 minutes
        exhaustedKeys.set(item.key, now + 10 * 60 * 1000);
        console.warn(`[Verification Failover] Key exhausted for ${item.provider}: ${item.label}. Trying next key...`);
      }
    } catch (err) {
      console.warn(`[Verification Error] Provider ${item.provider} failed. Switching to next provider...`, err);
    }
  }

  // 7. Graceful Fallback if all keys exhausted: Do not block legitimate users
  const fallbackResult: EmailVerificationResult = {
    valid: true,
    deliverable: true,
    status: "valid",
    reason: "Syntax and domain verified (API quota fallback)",
  };
  setCachedVerification(normEmail, fallbackResult);
  return fallbackResult;
}
