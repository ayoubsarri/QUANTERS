import fs from "fs";

let content = fs.readFileSync("src/app/admin/settings/page.tsx", "utf8").replace(/\r\n/g, "\n");

// 1. Add fields to formState initialization
const formStateTarget = `    weeklyWorkloadCapHours: settings.weeklyWorkloadCapHours ?? 6,`;
const formStateRepl = `    weeklyWorkloadCapHours: settings.weeklyWorkloadCapHours ?? 6,
    taskGracePeriodHours: settings.taskGracePeriodHours ?? 24,
    examRetakeCooldownHours: settings.examRetakeCooldownHours ?? 24,
    hapticAudioFeedbackEnabled: settings.hapticAudioFeedbackEnabled ?? true,
    communityWebhookUrl: settings.communityWebhookUrl ?? "",`;

if (content.includes(formStateTarget)) {
  content = content.replace(formStateTarget, formStateRepl);
  console.log("Added new fields to formState initialization");
}

// 2. Add UI rows in Section 3 after row 4
const section3RowTarget = `            {/* Row 4: Weekly Student Workload Cap (Hours) */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
                  Weekly Student Workload Cap (Hours)
                </div>
                <p className="text-[11px] text-slate-500">
                  Recommended weekly club commitment ceiling per student (3 to 10 hrs)
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={formState.weeklyWorkloadCapHours ?? 6}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      weeklyWorkloadCapHours: Math.max(3, Math.min(10, Number(e.target.value))),
                    })
                  }
                  className="w-16 px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-slate-200/90 font-mono text-xs font-extrabold text-[#0F1E36] text-center tabular-nums"
                />
                <span className="text-[11px] font-mono font-bold text-slate-400">hrs/wk</span>
              </div>
            </div>`;

const section3RowRepl = `            {/* Row 4: Weekly Student Workload Cap (Hours) */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
                  Weekly Student Workload Cap (Hours)
                </div>
                <p className="text-[11px] text-slate-500">
                  Recommended weekly club commitment ceiling per student (3 to 10 hrs)
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min={3}
                  max={10}
                  value={formState.weeklyWorkloadCapHours ?? 6}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      weeklyWorkloadCapHours: Math.max(3, Math.min(10, Number(e.target.value))),
                    })
                  }
                  className="w-16 px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-slate-200/90 font-mono text-xs font-extrabold text-[#0F1E36] text-center tabular-nums"
                />
                <span className="text-[11px] font-mono font-bold text-slate-400">hrs/wk</span>
              </div>
            </div>

            {/* Row 5: Task Submission Grace Period */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
                  Task Submission Grace Period
                </div>
                <p className="text-[11px] text-slate-500">
                  Permitted deadline buffer before late penalty is applied
                </p>
              </div>

              <select
                value={formState.taskGracePeriodHours ?? 24}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    taskGracePeriodHours: Number(e.target.value),
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-slate-200/90 font-mono text-xs font-bold text-[#0F1E36]"
              >
                <option value={0}>0h (Strict Deadline)</option>
                <option value={12}>12 Hours Buffer</option>
                <option value={24}>24 Hours (Standard)</option>
                <option value={48}>48 Hours (Relaxed)</option>
              </select>
            </div>

            {/* Row 6: Badge Exam Retake Cooldown */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
                  Badge Exam Retake Cooldown
                </div>
                <p className="text-[11px] text-slate-500">
                  Mandatory preparation pause after a failed examination attempt
                </p>
              </div>

              <select
                value={formState.examRetakeCooldownHours ?? 24}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    examRetakeCooldownHours: Number(e.target.value),
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-slate-200/90 font-mono text-xs font-bold text-[#0F1E36]"
              >
                <option value={0}>Instant (Practice Mode)</option>
                <option value={24}>24 Hours Cooldown</option>
                <option value={48}>48 Hours Cooldown</option>
                <option value={72}>3 Days Cooldown</option>
                <option value={168}>7 Days (Rigorous)</option>
              </select>
            </div>

            {/* Row 7: In-App Audio & Haptic Feedback */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F1E36]">
                  In-App Audio Chimes &amp; Haptic Pulse
                </div>
                <p className="text-[11px] text-slate-500">
                  Subtle sound cues and mobile vibrations on XP gains &amp; badges
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormState({
                    ...formState,
                    hapticAudioFeedbackEnabled: !(formState.hapticAudioFeedbackEnabled ?? true),
                  })
                }
                className={\`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 \${
                  (formState.hapticAudioFeedbackEnabled ?? true) ? "bg-[#0284C7]" : "bg-slate-300"
                }\`}
              >
                <div
                  className={\`w-5 h-5 rounded-full bg-white transition-transform \${
                    (formState.hapticAudioFeedbackEnabled ?? true) ? "translate-x-4" : "translate-x-0"
                  }\`}
                />
              </button>
            </div>

            {/* Row 8: Community Discord / Webhook Broadcast URL */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="text-xs font-bold text-[#0F1E36]">
                Community Announcement Webhook URL
              </div>
              <p className="text-[11px] text-slate-500">
                Syncs published workshops and official notices to Discord / Telegram / Slack
              </p>
              <input
                type="url"
                value={formState.communityWebhookUrl ?? ""}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    communityWebhookUrl: e.target.value,
                  })
                }
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-[#F4F7FB] border border-slate-200/90 focus:bg-white transition"
              />
            </div>`;

if (content.includes(section3RowTarget)) {
  content = content.replace(section3RowTarget, section3RowRepl);
  console.log("Added new governance options to section 3 in settings page");
}

fs.writeFileSync("src/app/admin/settings/page.tsx", content);
