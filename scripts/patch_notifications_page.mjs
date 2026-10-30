import fs from "fs";

let code = fs.readFileSync("src/app/(mobile)/notifications/page.tsx", "utf8");

const oldHookBlock = `  const messages = useQuantersStore((s) => s.messages);
  const markMessageRead = useQuantersStore((s) => s.markMessageRead);
  const unarchiveMessage = useQuantersStore((s) => s.unarchiveMessage);
  const archiveAllReadMessages = useQuantersStore(
    (s) => s.archiveAllReadMessages
  );`;

const newHookBlock = `  const messages = useQuantersStore((s) => s.messages);
  const markMessageRead = useQuantersStore((s) => s.markMessageRead);
  const unarchiveMessage = useQuantersStore((s) => s.unarchiveMessage);
  const archiveAllReadMessages = useQuantersStore(
    (s) => s.archiveAllReadMessages
  );
  const currentMemberId = useQuantersStore((s) => s.currentMemberId);
  const members = useQuantersStore((s) => s.members);
  const teams = useQuantersStore((s) => s.teams);
  const departments = useQuantersStore((s) => s.departments);
  const activeAdminRole = useQuantersStore((s) => s.activeAdminRole);

  const currentMember = members.find((m) => m.id === currentMemberId);
  const isSuperOrExecutive =
    activeAdminRole === "Super Admin" ||
    activeAdminRole === "HR Head" ||
    activeAdminRole === "Executive" ||
    Boolean(currentMember?.roles?.some((r) => ["Super Admin", "Executive", "HR Head"].includes(r)));

  const isEligibleRecipient = (msg: ClubMessage) => {
    if (isSuperOrExecutive) return true;
    if (!currentMember) return true;

    const scope = (msg.recipientScope || "").toLowerCase();
    if (
      scope.includes("everyone") ||
      scope.includes("all members") ||
      scope.includes("all active") ||
      scope.includes("whole club")
    ) {
      return true;
    }

    if (msg.targetMemberId) {
      return msg.targetMemberId === currentMember.id;
    }
    if (scope === currentMember.fullName.toLowerCase()) {
      return true;
    }

    if (msg.targetDepartmentId) {
      return msg.targetDepartmentId === currentMember.departmentId;
    }
    const memberDept = departments.find((d) => d.id === currentMember.departmentId);
    if (memberDept && scope === memberDept.name.toLowerCase()) {
      return true;
    }

    if (msg.targetTeamId) {
      const team = teams.find((t) => t.id === msg.targetTeamId);
      return Boolean(team?.memberIds?.includes(currentMember.id));
    }
    const matchingTeam = teams.find((t) => t.name.toLowerCase() === scope);
    if (matchingTeam) {
      return Boolean(matchingTeam.memberIds?.includes(currentMember.id));
    }

    if (scope.includes("trainee")) {
      return currentMember.status === "Trainee" || currentMember.roles.includes("Trainee");
    }

    return false;
  };

  const isMessageReadByMe = (msg: ClubMessage) => {
    if (currentMemberId && Array.isArray(msg.readMemberIds)) {
      if (msg.readMemberIds.includes(currentMemberId)) return true;
    }
    return Boolean(msg.archived || !msg.unread);
  };`;

const oldFilterBlock = `  const unreadCount = messages.filter((m) => !m.archived && m.unread).length;
  const archivedCount = messages.filter((m) => m.archived || !m.unread).length;

  const selectedMessage =
    messages.find((m) => m.id === selectedMessageId) || null;

  const filteredMessages = messages.filter((msg) => {
    const matchesTab =
      activeTab === "Inbox"
        ? !msg.archived && msg.unread
        : activeTab === "HR Notices"
        ? msg.senderRole === "HR" || msg.senderLabel.includes("HR")
        : Boolean(msg.archived || !msg.unread);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      msg.title.toLowerCase().includes(q) ||
      msg.body.toLowerCase().includes(q) ||
      msg.senderLabel.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });`;

const newFilterBlock = `  const eligibleMessages = messages.filter(isEligibleRecipient);
  const unreadCount = eligibleMessages.filter((m) => !isMessageReadByMe(m)).length;
  const archivedCount = eligibleMessages.filter((m) => isMessageReadByMe(m)).length;

  const selectedMessage =
    messages.find((m) => m.id === selectedMessageId) || null;

  const filteredMessages = eligibleMessages.filter((msg) => {
    const isRead = isMessageReadByMe(msg);
    const matchesTab =
      activeTab === "Inbox"
        ? !isRead
        : activeTab === "HR Notices"
        ? (msg.senderRole === "HR" || msg.senderLabel.includes("HR")) && !isRead
        : isRead;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      msg.title.toLowerCase().includes(q) ||
      msg.body.toLowerCase().includes(q) ||
      msg.senderLabel.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });`;

const oldOpenBlock = `  const handleOpenMessage = (msg: ClubMessage) => {
    const wasUnread = msg.unread || !msg.archived;
    markMessageRead(msg.id);
    setSelectedMessageId(msg.id);`;

const newOpenBlock = `  const handleOpenMessage = (msg: ClubMessage) => {
    const wasUnread = !isMessageReadByMe(msg);
    markMessageRead(msg.id, currentMemberId);
    setSelectedMessageId(msg.id);`;

const replaceAll = (haystack, oldStr, newStr) => {
  if (haystack.includes(oldStr)) return haystack.replace(oldStr, newStr);
  const oldCRLF = oldStr.replace(/\n/g, "\r\n");
  const newCRLF = newStr.replace(/\n/g, "\r\n");
  if (haystack.includes(oldCRLF)) return haystack.replace(oldCRLF, newCRLF);
  return null;
};

let res = replaceAll(code, oldHookBlock, newHookBlock);
if (res) {
  code = res;
  res = replaceAll(code, oldFilterBlock, newFilterBlock);
  if (res) {
    code = res;
    res = replaceAll(code, oldOpenBlock, newOpenBlock);
    if (res) {
      code = res;
      fs.writeFileSync("src/app/(mobile)/notifications/page.tsx", code, "utf8");
      console.log("✓ Successfully patched notifications page with granular targeting and per-member read status!");
    } else {
      console.error("Failed to replace open block");
    }
  } else {
    console.error("Failed to replace filter block");
  }
} else {
  console.error("Failed to replace hook block");
}
