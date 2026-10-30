import fs from "node:fs";

let s = fs.readFileSync("src/app/(mobile)/welcome/page.tsx", "utf-8");

// 1. Add import
if (!s.includes("verifyEmailWithFailover")) {
  s = `import { verifyEmailWithFailover, checkDomainTypo, isDisposableEmail, VerificationProviderKey } from "@/lib/utils/emailVerification";\n` + s;
}

// 2. Add verification logic inside handleRegister
const targetCheck = `    const validEmail = validateEmail(email);
    if (!validEmail.isValid) {
      setErrorMsg(validEmail.error || "Please enter a valid university or personal email address.");
      return;
    }`;

const enhancedCheck = `    const validEmail = validateEmail(email);
    if (!validEmail.isValid) {
      setErrorMsg(validEmail.error || "Please enter a valid university or personal email address.");
      return;
    }

    // Real-Time Multi-Provider Email Verification & Failover Pool
    if (settings.emailVerificationEnabled !== false) {
      const typo = checkDomainTypo(validEmail.normalized);
      if (typo) {
        const suggested = validEmail.normalized.split("@")[0] + "@" + typo;
        setErrorMsg(\`Did you mean \${suggested}? Please verify your email spelling.\`);
        return;
      }

      if (isDisposableEmail(validEmail.normalized)) {
        setErrorMsg("Temporary or disposable email addresses are not permitted. Please use your real university or personal email.");
        return;
      }

      const keys: VerificationProviderKey[] = [];
      if (settings.zerobounceApiKey1) keys.push({ provider: "zerobounce", key: settings.zerobounceApiKey1, label: "ZeroBounce #1" });
      if (settings.zerobounceApiKey2) keys.push({ provider: "zerobounce", key: settings.zerobounceApiKey2, label: "ZeroBounce #2" });
      if (settings.abstractApiKey1) keys.push({ provider: "abstract", key: settings.abstractApiKey1, label: "AbstractAPI #1" });
      if (settings.abstractApiKey2) keys.push({ provider: "abstract", key: settings.abstractApiKey2, label: "AbstractAPI #2" });

      try {
        const verifyRes = await verifyEmailWithFailover(validEmail.normalized, keys);
        if (!verifyRes.deliverable) {
          setErrorMsg(
            verifyRes.reason ||
            "This email address does not appear to exist in real life or cannot receive mail. Please use a valid personal email."
          );
          return;
        }
      } catch (err) {
        // Fallback: don't block user on network error
        console.warn("[Email Verification] Fallback due to error:", err);
      }
    }`;

if (s.includes(targetCheck)) {
  s = s.replace(targetCheck, enhancedCheck);
  fs.writeFileSync("src/app/(mobile)/welcome/page.tsx", s, "utf-8");
  console.log("Successfully connected email verification into welcome registration");
} else {
  console.log("Target check not found in welcome page");
}
