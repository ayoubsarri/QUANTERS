const fs = require('fs');
let code = fs.readFileSync('src/app/(mobile)/notifications/page.tsx', 'utf8');

const oldCheck = `  const isMessageReadByMe = (msg: ClubMessage) => {
    if (currentMemberId && Array.isArray(msg.readMemberIds)) {
      return msg.readMemberIds.includes(currentMemberId);
    }
    return Boolean(msg.archived || !msg.unread);
  };`;

const newCheck = `  const isMessageReadByMe = (msg: ClubMessage) => {
    if (Boolean(msg.archived)) return true;
    if (currentMemberId && Array.isArray(msg.readMemberIds)) {
      return msg.readMemberIds.includes(currentMemberId);
    }
    return Boolean(!msg.unread);
  };`;

code = code.replace(oldCheck, newCheck);

const oldCounts = `  const unreadCount = eligibleMessages.filter((m) => !isMessageReadByMe(m)).length;
  const archivedCount = eligibleMessages.filter((m) => isMessageReadByMe(m)).length;`;

const newCounts = `  const unreadCount = eligibleMessages.filter((m) => !isMessageReadByMe(m) && !m.archived).length;
  const archivedCount = eligibleMessages.filter((m) => isMessageReadByMe(m) || m.archived).length;`;

code = code.replace(oldCounts, newCounts);

const oldFiltered = `  const filteredMessages = eligibleMessages.filter((msg) => {
    const isRead = isMessageReadByMe(msg);
    const matchesTab =
      activeTab === "Inbox"
        ? !isRead
        : activeTab === "HR Notices"
        ? (msg.senderRole === "HR" || msg.senderLabel.includes("HR")) && !isRead
        : isRead;`;

const newFiltered = `  const filteredMessages = eligibleMessages.filter((msg) => {
    const isRead = isMessageReadByMe(msg) || Boolean(msg.archived);
    const matchesTab =
      activeTab === "Inbox"
        ? !isRead
        : activeTab === "HR Notices"
        ? (msg.senderRole === "HR" || msg.senderLabel.includes("HR") || msg.senderRole === "Executive") && !isRead
        : isRead;`;

code = code.replace(oldFiltered, newFiltered);

fs.writeFileSync('src/app/(mobile)/notifications/page.tsx', code, 'utf8');
console.log('Notifications page updated for auto-archive upon read!');
