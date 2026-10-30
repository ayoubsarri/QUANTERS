import fs from "fs";

const filePath = "src/lib/store/useQuantersStore.ts";
let content = fs.readFileSync(filePath, "utf8");

const oldTarget = `      return {
        settings: sanitizeSystemSettings({ ...state.settings, ...updates }),
        auditLogs: [audit, ...state.auditLogs],
      };
    }),
}));`;

const newTarget = `      return {
        settings: sanitizeSystemSettings({ ...state.settings, ...updates }),
        auditLogs: [audit, ...state.auditLogs],
      };
    });
    get().saveToLocalCache();
    get().syncWithServer(true).catch(() => {});
  },
}));`;

if (content.includes(oldTarget)) {
  content = content.replace(oldTarget, newTarget);
  console.log("Added saveToLocalCache and syncWithServer to updateSettings");
} else {
  const oldCRLF = oldTarget.replace(/\n/g, "\r\n");
  const newCRLF = newTarget.replace(/\n/g, "\r\n");
  if (content.includes(oldCRLF)) {
    content = content.replace(oldCRLF, newCRLF);
    console.log("Added saveToLocalCache and syncWithServer to updateSettings (CRLF)");
  } else {
    console.warn("Could not find oldTarget");
  }
}

fs.writeFileSync(filePath, content, "utf8");
console.log("Done!");
