import fs from "node:fs";

let s = fs.readFileSync("src/lib/store/useQuantersStore.ts", "utf-8");

const impl = `  ensureWelcomeMessageDelivered: (memberId: string) => {
    set((state) => {
      if (state.settings.welcomeMessageEnabled === false) return state;
      const member = state.members.find((m) => m.id === memberId);
      if (!member) return state;

      const isAdmitted =
        member.status === "Trainee" ||
        member.status === "Active" ||
        member.status === "Alumni" ||
        Boolean(member.onboardingTicks?.hrApproved);
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
  },\n\n  `;

if (!s.includes("ensureWelcomeMessageDelivered: (memberId: string) => {")) {
  s = s.replace(
    'approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {',
    `${impl}approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {`
  );
  fs.writeFileSync("src/lib/store/useQuantersStore.ts", s, "utf-8");
  console.log("Successfully inserted ensureWelcomeMessageDelivered");
} else {
  console.log("Already exists");
}
