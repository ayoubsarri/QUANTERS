import fs from "node:fs";

let s = fs.readFileSync("src/app/admin/settings/page.tsx", "utf-8");

// 1. Add variable at top of component if not present
if (!s.includes("const welcomeMsgEnabled =")) {
  s = s.replace(
    "const autoApprove = formState.onboardingAutoApprove ?? true;",
    "const autoApprove = formState.onboardingAutoApprove ?? true;\n  const welcomeMsgEnabled = formState.welcomeMessageEnabled ?? true;"
  );
}

// 2. Add the UI block after Onboarding Admission Mode
const targetString = `                  HR Approval
                </button>
              </div>
            </div>
          </div>
        </div>`;

const welcomeCard = `                  HR Approval
                </button>
              </div>
            </div>

            {/* Row 4: Post-Admission Welcome Message (Admin Editable) */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F1E36]">
                      Post-Admission Automated Welcome Message
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E0F2FE] text-[#0284C7]">
                      Auto-Dispatch
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Automatically sends a personalized message to members upon admission approval when they first open and navigate the platform.
                  </p>
                </div>

                <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, welcomeMessageEnabled: true }));
                      applyImmediatePatch(
                        { welcomeMessageEnabled: true },
                        "Enabled post-admission welcome message",
                        "Welcome Message: Enabled"
                      );
                    }}
                    className={\`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer \${
                      welcomeMsgEnabled ? "bg-white text-[#0284C7] shadow-2xs" : "text-slate-600"
                    }\`}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, welcomeMessageEnabled: false }));
                      applyImmediatePatch(
                        { welcomeMessageEnabled: false },
                        "Disabled post-admission welcome message",
                        "Welcome Message: Disabled"
                      );
                    }}
                    className={\`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer \${
                      !welcomeMsgEnabled ? "bg-white text-rose-600 shadow-2xs" : "text-slate-600"
                    }\`}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              {/* Editable Welcome Message Fields */}
              {welcomeMsgEnabled && (
                <div className="bg-[#F8FAFD] rounded-xl p-3.5 border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Sender Label
                      </label>
                      <input
                        type="text"
                        value={formState.welcomeMessageSenderLabel ?? "QUANTA Executive Bureau"}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            welcomeMessageSenderLabel: e.target.value,
                          }))
                        }
                        onBlur={() =>
                          applyImmediatePatch(
                            { welcomeMessageSenderLabel: formState.welcomeMessageSenderLabel ?? "QUANTA Executive Bureau" },
                            "Updated welcome message sender label",
                            \`Sender: \${formState.welcomeMessageSenderLabel ?? "QUANTA Executive Bureau"}\`
                          )
                        }
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7]"
                        placeholder="e.g. QUANTA Executive Bureau"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Sender Department / Role
                      </label>
                      <select
                        value={formState.welcomeMessageSenderRole ?? "Executive"}
                        onChange={(e) => {
                          const val = e.target.value as "Executive" | "HR" | "System";
                          setFormState((prev) => ({ ...prev, welcomeMessageSenderRole: val }));
                          applyImmediatePatch(
                            { welcomeMessageSenderRole: val },
                            \`Updated welcome message sender role to \${val}\`,
                            \`Role: \${val}\`
                          );
                        }}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7]"
                      >
                        <option value="Executive">Executive Bureau</option>
                        <option value="HR">HR Directorate</option>
                        <option value="System">System Automated</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Welcome Message Subject / Title
                    </label>
                    <input
                      type="text"
                      value={formState.welcomeMessageTitle ?? "🎉 Welcome to QUANTA! Your Admission is Approved"}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          welcomeMessageTitle: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        applyImmediatePatch(
                          { welcomeMessageTitle: formState.welcomeMessageTitle ?? "🎉 Welcome to QUANTA! Your Admission is Approved" },
                          "Updated welcome message title",
                          \`Title: \${formState.welcomeMessageTitle ?? "🎉 Welcome to QUANTA! Your Admission is Approved"}\`
                        )
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7]"
                      placeholder="e.g. 🎉 Welcome to QUANTA! Your Admission is Approved"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Welcome Message Body
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Tip: use <code className="bg-slate-200 px-1 py-0.5 rounded text-[#0284C7]">{"{name}"}</code> for member's name
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formState.welcomeMessageBody ?? "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces."}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          welcomeMessageBody: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        applyImmediatePatch(
                          { welcomeMessageBody: formState.welcomeMessageBody ?? "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces." },
                          "Updated welcome message body",
                          "Welcome Message Body Saved"
                        )
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#0284C7] resize-y"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>`;

if (s.includes(targetString)) {
  s = s.replace(targetString, welcomeCard);
  fs.writeFileSync("src/app/admin/settings/page.tsx", s, "utf-8");
  console.log("Successfully patched admin settings page with editable welcome message");
} else {
  console.log("Target string not found in settings page");
}
