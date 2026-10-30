import fs from 'node:fs';

let content = fs.readFileSync('src/lib/store/useQuantersStore.ts', 'utf8');

// Normalize line endings for replacement search
const targetSnippet = `  approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {
    set((state) => {
      const member = state.members.find((m) => m.id === memberId);`;

const replacementSnippet = `  approveMemberAdmission: ({ memberId, actorName = "HR Directorate", notes }) => {
    set((state) => {
      const currentActor = state.members.find((m) => m.id === state.currentMemberId);
      const isPrivileged = Boolean(
        currentActor &&
        (currentActor.roles.some((r) => ["Super Admin", "Executive", "HR Head"].includes(r)) ||
        ["quantaclubdz@gmail.com", "ayoubsarri1@gmail.com", "hr.quanta@univ-alger.dz"].includes(currentActor.email.toLowerCase()))
      );
      if (!isPrivileged) {
        console.warn("[Security Guard] Unauthorized admission approval rejected.");
        return state;
      }
      const member = state.members.find((m) => m.id === memberId);`;

if (content.includes(targetSnippet)) {
  content = content.replace(targetSnippet, replacementSnippet);
} else {
  // Try CRLF
  const targetCRLF = targetSnippet.replace(/\n/g, '\r\n');
  const replacementCRLF = replacementSnippet.replace(/\n/g, '\r\n');
  content = content.replace(targetCRLF, replacementCRLF);
}

fs.writeFileSync('src/lib/store/useQuantersStore.ts', content, 'utf8');
console.log('Successfully patched useQuantersStore with admission security guard.');
