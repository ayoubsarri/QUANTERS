import fs from "node:fs";

let s = fs.readFileSync("src/app/admin/settings/page.tsx", "utf-8");

// 1. Add variable at top if not present
if (!s.includes("const emailVerifyEnabled =")) {
  s = s.replace(
    "const welcomeMsgEnabled = formState.welcomeMessageEnabled ?? true;",
    `const welcomeMsgEnabled = formState.welcomeMessageEnabled ?? true;
  const emailVerifyEnabled = formState.emailVerificationEnabled ?? true;
  const [testEmailInput, setTestEmailInput] = useState("");
  const [testEmailResult, setTestEmailResult] = useState<any>(null);
  const [testEmailLoading, setTestEmailLoading] = useState(false);`
  );
}

// 2. Add import for verifyEmailWithFailover if not present
if (!s.includes("verifyEmailWithFailover")) {
  s = `import { verifyEmailWithFailover, VerificationProviderKey } from "@/lib/utils/emailVerification";\n` + s;
}

// 3. Add UI row after Welcome Message
const targetEnd = `                  </div>
                </div>
              )}
            </div>
          </div>
        </div>`;

const newPoolCard = `                  </div>
                </div>
              )}
            </div>

            {/* Row 5: Real-Time Email Verification Multi-Key Pool (ZeroBounce & AbstractAPI) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F1E36]">
                      Real-Time Email Verification (Multi-Key Failover Pool)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ZeroBounce + AbstractAPI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Connects up to 4 API keys across ZeroBounce and AbstractAPI. When Key 1 runs out of free quota or hits rate limits, it automatically switches to Key 2, Key 3, and Key 4 without service interruption.
                  </p>
                </div>

                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, emailVerificationEnabled: true }));
                      applyImmediatePatch(
                        { emailVerificationEnabled: true },
                        "Enabled real-time email verification pool",
                        "Email Verification: Enabled"
                      );
                    }}
                    className={\`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer \${
                      emailVerifyEnabled ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
                    }\`}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, emailVerificationEnabled: false }));
                      applyImmediatePatch(
                        { emailVerificationEnabled: false },
                        "Disabled real-time email verification pool",
                        "Email Verification: Disabled"
                      );
                    }}
                    className={\`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer \${
                      !emailVerifyEnabled ? "bg-white text-rose-600 shadow-2xs" : "text-slate-600"
                    }\`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              {/* Pool Keys & Live Tester */}
              {emailVerifyEnabled && (
                <div className="bg-[#F8FAFD] rounded-xl p-3.5 border border-slate-200/80 space-y-3">
                  <div className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Configured API Key Pool (Automatic Switching &amp; Failover)</span>
                    <span className="text-[10px] text-emerald-600 normal-case font-sans">
                      400–500 free checks / month pooled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Key 1: ZeroBounce 1 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          1. ZeroBounce API Key (Account #1)
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">100 free/mo</span>
                      </div>
                      <input
                        type="password"
                        value={formState.zerobounceApiKey1 ?? ""}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, zerobounceApiKey1: e.target.value }))
                        }
                        onBlur={() =>
                          applyImmediatePatch(
                            { zerobounceApiKey1: formState.zerobounceApiKey1 },
                            "Updated ZeroBounce Key 1",
                            "ZeroBounce Key 1 Saved"
                          )
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono focus:outline-none focus:border-[#0284C7]"
                        placeholder="e.g. 7a8b9c... (ZeroBounce Primary)"
                      />
                    </div>

                    {/* Key 2: ZeroBounce 2 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          2. ZeroBounce API Key (Account #2)
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">100 free/mo</span>
                      </div>
                      <input
                        type="password"
                        value={formState.zerobounceApiKey2 ?? ""}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, zerobounceApiKey2: e.target.value }))
                        }
                        onBlur={() =>
                          applyImmediatePatch(
                            { zerobounceApiKey2: formState.zerobounceApiKey2 },
                            "Updated ZeroBounce Key 2",
                            "ZeroBounce Key 2 Saved"
                          )
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono focus:outline-none focus:border-[#0284C7]"
                        placeholder="e.g. 1d2e3f... (ZeroBounce Secondary)"
                      />
                    </div>

                    {/* Key 3: AbstractAPI 1 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          3. AbstractAPI Key (Account #1)
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">100 free/mo</span>
                      </div>
                      <input
                        type="password"
                        value={formState.abstractApiKey1 ?? ""}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, abstractApiKey1: e.target.value }))
                        }
                        onBlur={() =>
                          applyImmediatePatch(
                            { abstractApiKey1: formState.abstractApiKey1 },
                            "Updated AbstractAPI Key 1",
                            "AbstractAPI Key 1 Saved"
                          )
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono focus:outline-none focus:border-[#0284C7]"
                        placeholder="e.g. 4a5b6c... (Abstract Primary)"
                      />
                    </div>

                    {/* Key 4: AbstractAPI 2 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          4. AbstractAPI Key (Account #2)
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">100 free/mo</span>
                      </div>
                      <input
                        type="password"
                        value={formState.abstractApiKey2 ?? ""}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, abstractApiKey2: e.target.value }))
                        }
                        onBlur={() =>
                          applyImmediatePatch(
                            { abstractApiKey2: formState.abstractApiKey2 },
                            "Updated AbstractAPI Key 2",
                            "AbstractAPI Key 2 Saved"
                          )
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-mono focus:outline-none focus:border-[#0284C7]"
                        placeholder="e.g. 8e9f0a... (Abstract Secondary)"
                      />
                    </div>
                  </div>

                  {/* Interactive Failover Tester */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Test Failover Verification Live
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={testEmailInput}
                        onChange={(e) => setTestEmailInput(e.target.value)}
                        placeholder="Enter email to test (e.g. test@gmail.com)"
                        className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7]"
                      />
                      <button
                        type="button"
                        disabled={testEmailLoading || !testEmailInput.includes("@")}
                        onClick={async () => {
                          setTestEmailLoading(true);
                          setTestEmailResult(null);
                          try {
                            const keys: VerificationProviderKey[] = [];
                            if (formState.zerobounceApiKey1) keys.push({ provider: "zerobounce", key: formState.zerobounceApiKey1, label: "ZeroBounce #1" });
                            if (formState.zerobounceApiKey2) keys.push({ provider: "zerobounce", key: formState.zerobounceApiKey2, label: "ZeroBounce #2" });
                            if (formState.abstractApiKey1) keys.push({ provider: "abstract", key: formState.abstractApiKey1, label: "AbstractAPI #1" });
                            if (formState.abstractApiKey2) keys.push({ provider: "abstract", key: formState.abstractApiKey2, label: "AbstractAPI #2" });

                            const res = await verifyEmailWithFailover(testEmailInput, keys);
                            setTestEmailResult(res);
                          } catch (err: any) {
                            setTestEmailResult({ valid: false, error: err?.message });
                          } finally {
                            setTestEmailLoading(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        {testEmailLoading ? "Testing..." : "Test Verification"}
                      </button>
                    </div>

                    {testEmailResult && (
                      <div className={\`mt-2 p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between \${
                        testEmailResult.deliverable
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      }\`}>
                        <div>
                          <span className="font-bold">
                            {testEmailResult.deliverable ? "✅ Deliverable (Exists)" : "❌ Undeliverable / Invalid"}
                          </span>
                          {testEmailResult.reason && (
                            <span className="ml-2 text-slate-500 font-sans">({testEmailResult.reason})</span>
                          )}
                        </div>
                        {testEmailResult.providerUsed && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 border border-current font-bold">
                            Provider: {testEmailResult.providerUsed}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>`;

if (s.includes(targetEnd)) {
  s = s.replace(targetEnd, newPoolCard);
  fs.writeFileSync("src/app/admin/settings/page.tsx", s, "utf-8");
  console.log("Successfully patched admin settings page with email verification pool");
} else {
  console.log("Target string not found in settings page");
}
