import fs from "fs";

let content = fs.readFileSync("src/lib/store/useQuantersStore.ts", "utf8");

// 1. In loginWithGoogle:
const targetGoogleLogin = `  loginWithGoogle: (email, fullName, avatarUrl) => {
    const cleanEmail = email.trim().toLowerCase();
    const state = get();
    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);

    if (existing) {
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);`;

const replGoogleLogin = `  loginWithGoogle: (email, fullName, avatarUrl) => {
    const cleanEmail = email.trim().toLowerCase();
    const state = get();
    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);

    if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }
      const { adminRole, redirectPath } = resolveRoleAndRedirect(existing);`;

// 2. In registerAccount:
const targetRegisterAcc = `    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }`;

const replRegisterAcc = `    const existing = state.members.find((m) => m.email.toLowerCase() === cleanEmail);
    if (existing) {
      if (existing.status === "Removed") {
        return {
          ok: false,
          isDeleted: true,
          redirectPath: "/welcome",
          message: "YOUR_ACCOUNT_DELETED",
          member: existing,
        };
      }
      return {
        ok: false,
        redirectPath: "/welcome",
        message: "An account with this email address already exists. Please sign in instead.",
      };
    }`;

// Replace CRLF or LF safely
content = content.replace(/\r\n/g, "\n");
if (content.includes(targetGoogleLogin.replace(/\r\n/g, "\n"))) {
  content = content.replace(targetGoogleLogin.replace(/\r\n/g, "\n"), replGoogleLogin.replace(/\r\n/g, "\n"));
  console.log("Patched loginWithGoogle successfully");
} else {
  console.log("targetGoogleLogin not found");
}

if (content.includes(targetRegisterAcc.replace(/\r\n/g, "\n"))) {
  content = content.replace(targetRegisterAcc.replace(/\r\n/g, "\n"), replRegisterAcc.replace(/\r\n/g, "\n"));
  console.log("Patched registerAccount successfully");
} else {
  console.log("targetRegisterAcc not found");
}

fs.writeFileSync("src/lib/store/useQuantersStore.ts", content);
