import fs from "node:fs";

const storePath = "src/lib/store/useQuantersStore.ts";
let content = fs.readFileSync(storePath, "utf-8");

// 1. Add ensureWelcomeMessageDelivered to QuantersState if not present
if (!content.includes("ensureWelcomeMessageDelivered:")) {
  content = content.replace(
    /approveMemberAdmission:\s*\(payload:\s*\{[\s\S]*?\}\)\s*=>\s*void;/,
    `approveMemberAdmission: (payload: {
    memberId: string;
    actorName?: string;
    notes?: string;
  }) => void;
  ensureWelcomeMessageDelivered: (memberId: string) => void;`
  );
}

// 2. Replace the admissionNotice logic inside approveMemberAdmission
const oldAdmissionRegex = /const admissionNotice:\s*ClubMessage\s*=\s*\{[\s\S]*?stats:\s*\{[\s\S]*?\},?\s*\};[\s\S]*?messages:\s*\[admissionNotice,\s*\.\.\.state\.messages\],/;

const newAdmissionCode = `const welcomeEnabled = state.settings.welcomeMessageEnabled !== false;
      let newMessages = state.messages;

      if (welcomeEnabled) {
        const rawTitle = state.settings.welcomeMessageTitle || "🎉 Welcome to QUANTA! Your Admission is Approved";
        const rawBody =
          state.settings.welcomeMessageBody ||
          "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces.";
        const senderLabel = state.settings.welcomeMessageSenderLabel || actorName || "QUANTA Executive Bureau";
        const senderRole = state.settings.welcomeMessageSenderRole || "Executive";

        const formattedTitle = rawTitle.replace(/\\{name\\}/gi, member.fullName);
        const formattedBody = rawBody.replace(/\\{name\\}/gi, member.fullName);

        const admissionNotice: ClubMessage = {
          id: \`msg-adm-\${member.id}-\${Date.now()}\`,
          senderLabel,
          senderRole,
          recipientScope: member.fullName,
          priority: "Official notice",
          title: formattedTitle,
          body: formattedBody,
          timeAgo: "Just now",
          unread: true,
          channels: { inApp: true, email: true },
          stats: {
            totalRecipients: 1,
            inAppReadCount: 0,
            emailSentCount: 1,
            emailFailedCount: 0,
          },
          targetMemberId: member.id,
          readMemberIds: [],
          actionLink: "/home",
        };
        newMessages = [admissionNotice, ...state.messages];
      }

      return {
        members: state.members.map((m) =>
          m.id === memberId
            ? {
                ...m,
                status: targetStatus,
                statusSince: new Date().toISOString().slice(0, 10),
                onboardingTicks: {
                  ...m.onboardingTicks,
                  hrApproved: true,
                  hrApprovedAt: new Date().toISOString(),
                  hrApprovedBy: actorName,
                },
                statusHistory: [
                  {
                    id: \`sh-\${Date.now()}\`,
                    fromStatus: m.status,
                    toStatus: targetStatus,
                    reason: notes ? \`HR Admission Approved: \${notes}\` : "HR Admission Approved",
                    actorName,
                    date: new Date().toISOString().slice(0, 10),
                  },
                  ...m.statusHistory,
                ],
              }
            : m
        ),
        messages: newMessages,`;

if (oldAdmissionRegex.test(content)) {
  content = content.replace(oldAdmissionRegex, newAdmissionCode);
  console.log("Successfully replaced old admission notice logic in approveMemberAdmission");
} else {
  console.log("Could not find old admission notice regex");
}

// 3. Add ensureWelcomeMessageDelivered implementation right after approveMemberAdmission
if (!content.includes("ensureWelcomeMessageDelivered: (memberId: string) =>")) {
  const targetEnd = `approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {`;
  const insertCode = `
  ensureWelcomeMessageDelivered: (memberId: string) => {
    set((state) => {
      if (state.settings.welcomeMessageEnabled === false) return state;
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const isAdmitted =
        member.status === "Trainee" ||
        member.status === "Active" ||
        member.status === "Alumni" ||
        member.onboardingTicks?.hrApproved;
      if (!isAdmitted) return state;

      const alreadyDelivered = state.messages.some(
        (m) =>
          m.targetMemberId === memberId &&
          (m.id.includes("msg-adm-") || m.id.includes("msg-welcome-"))
      );
      if (alreadyDelivered) return state;

      const rawTitle = state.settings.welcomeMessageTitle || "🎉 Welcome to QUANTA! Your Admission is Approved";
      const rawBody =
        state.settings.welcomeMessageBody ||
        "Congratulations {name}! Your membership application and onboarding dossier have been formally reviewed and approved by the Executive Bureau. You now have full access to workshops, projects, quizzes, and community spaces.";
      const senderLabel = state.settings.welcomeMessageSenderLabel || "QUANTA Executive Bureau";
      const senderRole = state.settings.welcomeMessageSenderRole || "Executive";

      const formattedTitle = rawTitle.replace(/\\{name\\}/gi, member.fullName);
      const formattedBody = rawBody.replace(/\\{name\\}/gi, member.fullName);

      const welcomeNotice: ClubMessage = {
        id: \`msg-welcome-\${member.id}-\${Date.now()}\`,
        senderLabel,
        senderRole,
        recipientScope: member.fullName,
        priority: "Official notice",
        title: formattedTitle,
        body: formattedBody,
        timeAgo: "Just now",
        unread: true,
        channels: { inApp: true, email: true },
        stats: {
          totalRecipients: 1,
          inAppReadCount: 0,
          emailSentCount: 1,
          emailFailedCount: 0,
        },
        targetMemberId: member.id,
        readMemberIds: [],
        actionLink: "/home",
      };

      return {
        messages: [welcomeNotice, ...state.messages],
      };
    });
  },
`;
  // Insert before approveMemberAdmission
  content = content.replace(targetEnd, `${insertCode}\n  ${targetEnd}`);
  console.log("Successfully inserted ensureWelcomeMessageDelivered implementation");
}

fs.writeFileSync(storePath, content, "utf-8");
console.log("Updated useQuantersStore.ts successfully");
