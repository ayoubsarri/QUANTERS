/**
 * QUANTERS — Official Algerian Mobile Phone Number Formatter & Validator
 * Supports all national telecom operators in natural Algerian format:
 * - Mobilis: 06 XX XX XX XX
 * - Djezzy:  07 XX XX XX XX
 * - Ooredoo: 05 XX XX XX XX
 */

export type AlgerianCarrier = "Mobilis" | "Djezzy" | "Ooredoo";

export interface PhoneValidationResult {
  isValid: boolean;
  carrier: AlgerianCarrier | null;
  formatted: string;
  international: string;
  e164: string;
  error?: string;
  errorMessage?: string;
}

/**
 * Strips all non-digit characters except an optional leading '+'
 */
export function extractDigits(input: string): string {
  if (!input) return "";
  return input.replace(/[^\d+]/g, "");
}

/**
 * Detects carrier from leading digit (e.g. '6' -> Mobilis, '7' -> Djezzy, '5' -> Ooredoo)
 */
export function detectCarrier(leadDigit: string): AlgerianCarrier | null {
  if (leadDigit === "6") return "Mobilis";
  if (leadDigit === "7") return "Djezzy";
  if (leadDigit === "5") return "Ooredoo";
  return null;
}

/**
 * Real-time user typing formatter:
 * Formats naturally as Algerian 10-digit national mobile format:
 * `0X XX XX XX XX` (e.g. 06 61 23 45 67)
 * Accepts '06...', '6...', or international '+213...'.
 */
export function formatAlgerianPhoneInput(raw: string): string {
  if (!raw) return "";

  // Extract clean digits
  let digits = raw.replace(/\D/g, "");

  // Handle international prefix patterns
  if (digits.startsWith("00213")) {
    digits = "0" + digits.slice(5);
  } else if (digits.startsWith("213")) {
    digits = "0" + digits.slice(3);
  } else if (digits.length > 0 && !digits.startsWith("0")) {
    // If user starts typing with 5, 6, or 7 directly, prepend leading 0
    digits = "0" + digits;
  }

  // Cap at 10 national digits (leading 0 + 9 national digits)
  digits = digits.slice(0, 10);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  }
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
  }
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}

/**
 * Check if the number is an obvious dummy/placeholder sequence
 */
function isDummySequence(nineDigits: string): boolean {
  if (/^(\d)\1{7,}$/.test(nineDigits)) return true;
  if (nineDigits.endsWith("0000000")) return true;
  if (nineDigits === "550000000" || nineDigits === "660000000" || nineDigits === "770000000") return true;
  if (nineDigits.slice(1) === "12345678" || nineDigits.slice(1) === "87654321") return true;
  if (nineDigits.slice(1) === "00000000") return true;
  return false;
}

/**
 * Validates whether the given string is a real, complete Algerian mobile phone number (10 digits starting with 05, 06, or 07)
 */
export function validateAlgerianPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    const error = "Phone number is required.";
    return {
      isValid: false,
      carrier: null,
      formatted: "",
      international: "",
      e164: "",
      error,
      errorMessage: error,
    };
  }

  let digits = input.replace(/\D/g, "");

  if (digits.startsWith("00213")) {
    digits = "0" + digits.slice(5);
  } else if (digits.startsWith("213")) {
    digits = "0" + digits.slice(3);
  } else if (digits.length > 0 && !digits.startsWith("0")) {
    digits = "0" + digits;
  }

  if (digits.length === 0 || digits === "0") {
    const error = "Please enter your mobile phone number.";
    return {
      isValid: false,
      carrier: null,
      formatted: formatAlgerianPhoneInput(input),
      international: "",
      e164: "",
      error,
      errorMessage: error,
    };
  }

  const secondDigit = digits.length > 1 ? digits.charAt(1) : "";
  const carrier = secondDigit ? detectCarrier(secondDigit) : null;

  if (digits.length >= 2 && !carrier) {
    const error = "Must start with 05 (Ooredoo), 06 (Mobilis), or 07 (Djezzy).";
    return {
      isValid: false,
      carrier: null,
      formatted: formatAlgerianPhoneInput(input),
      international: "",
      e164: "",
      error,
      errorMessage: error,
    };
  }

  if (digits.length < 10) {
    const error = `Incomplete number (${digits.length}/10 digits).`;
    return {
      isValid: false,
      carrier,
      formatted: formatAlgerianPhoneInput(input),
      international: "",
      e164: "",
      error,
      errorMessage: error,
    };
  }

  const national9 = digits.slice(1); // 9 national digits (e.g. 661234567)

  if (isDummySequence(national9)) {
    const error = "Please enter a real personal phone number (mock digits not accepted).";
    return {
      isValid: false,
      carrier,
      formatted: formatAlgerianPhoneInput(input),
      international: "",
      e164: "",
      error,
      errorMessage: error,
    };
  }

  const formatted = formatAlgerianPhoneInput(digits); // e.g. 06 61 23 45 67
  const international = `+213${national9}`;

  return {
    isValid: true,
    carrier,
    formatted,
    international,
    e164: international,
  };
}
