const fs = require('fs');
let code = fs.readFileSync('src/lib/store/useQuantersStore.ts', 'utf8');
const oldImpl = 'markMessageRead: (messageId) =>\r\n    set((state) => ({\r\n      messages: state.messages.map((m) =>\r\n        m.id === messageId\r\n          ? {\r\n              ...m,\r\n              unread: false,\r\n              archived: true,\r\n              stats: { ...m.stats, inAppReadCount: m.stats.inAppReadCount + (m.unread ? 1 : 0) },\r\n            }\r\n          : m\r\n      ),\r\n    })),';

const newImpl = `markMessageRead: (messageId, memberId) => {
    set((state) => {
      const curMember = memberId || state.currentMemberId;
      return {
        messages: state.messages.map((m) => {
          if (m.id !== messageId) return m;
          const reads = Array.isArray(m.readMemberIds) ? [...m.readMemberIds] : [];
          if (curMember && !reads.includes(curMember)) {
            reads.push(curMember);
          }
          return {
            ...m,
            unread: false,
            archived: true,
            readMemberIds: reads,
            stats: {
              ...m.stats,
              inAppReadCount: (m.stats?.inAppReadCount || 0) + (m.unread ? 1 : 0),
            },
          };
        }),
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },`;

if (code.includes(oldImpl)) {
  code = code.replace(oldImpl, newImpl);
  fs.writeFileSync('src/lib/store/useQuantersStore.ts', code, 'utf8');
  console.log('markMessageRead updated successfully!');
} else {
  console.error('oldImpl not found');
}
