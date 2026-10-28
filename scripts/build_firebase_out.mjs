import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const routeFile = path.join(process.cwd(), "src", "app", "api", "erp", "route.ts");
const backupFile = path.join(process.cwd(), "route.ts.bak");

try {
  console.log("1. Building Firebase Hosting static export (out/)...");
  if (fs.existsSync(routeFile)) {
    fs.renameSync(routeFile, backupFile);
  }
  execSync("npx next build", {
    stdio: "inherit",
    env: { ...process.env, FIREBASE_STATIC_EXPORT: "1" },
  });
  console.log("✓ Static export generated in out/");
} finally {
  if (fs.existsSync(backupFile)) {
    fs.renameSync(backupFile, routeFile);
  }
}

console.log("2. Building full Next.js server bundle (.next/)...");
execSync("npx next build", {
  stdio: "inherit",
});
console.log("✓ Both out/ (Firebase Hosting) and .next/ (Node Server) built successfully!");
