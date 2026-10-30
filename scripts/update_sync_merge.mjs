import fs from 'fs';

let content = fs.readFileSync('src/lib/store/useQuantersStore.ts', 'utf8');

const oldCheck = `      // If this is the initial snapshot from the server, preserve active session member or un-synced items
      if (!prevMap) {
        if (id === localState.currentMemberId || (key === "members" && (localItem as Record<string, unknown>).status === "Trainee") || (!isPersistentDeletedId(key, id) && remoteList.length === 0)) {
          order.unshift(id);
          mergedById.set(id, localItem);
        }
        continue;
      }`;

const newCheck = `      // If this is the initial snapshot from the server, preserve all active, newly created local items that are not tombstoned
      if (!prevMap) {
        if (!isPersistentDeletedId(key, id)) {
          order.unshift(id);
          mergedById.set(id, localItem);
        }
        continue;
      }`;

content = content.replace(oldCheck.replace(/\r?\n/g, '\r\n'), newCheck.replace(/\r?\n/g, '\r\n'));
fs.writeFileSync('src/lib/store/useQuantersStore.ts', content, 'utf8');
console.log('Successfully fixed mergeRemoteWithUnsyncedLocal initial snapshot preservation!');
