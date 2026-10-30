import fs from "fs";

let code = fs.readFileSync("src/app/admin/messages/page.tsx", "utf8");

const oldCode = `    sendClubMessage({
      recipientScope: selectedTarget,
      priority,
      title: title.trim(),
      body: body.trim(),
      inApp,
      email,
    });`;

const newCode = `    let targetMemberId: string | undefined;
    let targetDepartmentId: string | undefined;
    let targetTeamId: string | undefined;

    if (recipientType === "Department") {
      const dept = departments.find((d) => d.name === selectedTarget || d.id === selectedTarget);
      targetDepartmentId = dept?.id;
    } else if (recipientType === "Specific Member") {
      const member = sortedMembers.find((m) => m.fullName === selectedTarget || m.id === selectedTarget);
      targetMemberId = member?.id;
    } else if (recipientType === "Scientific Team") {
      const team = teams.find((t) => t.name === selectedTarget || t.id === selectedTarget);
      targetTeamId = team?.id;
    }

    sendClubMessage({
      recipientScope: selectedTarget,
      priority,
      title: title.trim(),
      body: body.trim(),
      inApp,
      email,
      targetMemberId,
      targetDepartmentId,
      targetTeamId,
    });`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync("src/app/admin/messages/page.tsx", code, "utf8");
  console.log("Successfully patched admin messages targeting (LF)!");
} else {
  const oldCRLF = oldCode.replace(/\n/g, "\r\n");
  const newCRLF = newCode.replace(/\n/g, "\r\n");
  if (code.includes(oldCRLF)) {
    code = code.replace(oldCRLF, newCRLF);
    fs.writeFileSync("src/app/admin/messages/page.tsx", code, "utf8");
    console.log("Successfully patched admin messages targeting (CRLF)!");
  } else {
    console.error("Could not find target in src/app/admin/messages/page.tsx");
  }
}
