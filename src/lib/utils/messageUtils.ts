import { ClubMessage, Department, Member, ScientificTeam } from "@/lib/types/erp";

/**
 * Validates whether a club message is valid and eligible to be seen by a specific member.
 * Ensures:
 * 1. Corrupted/empty messages (without title and without body) are filtered out.
 * 2. Personal individual letters (msg.targetMemberId) are STRICTLY private to that recipient member.
 *    (Prevents Super Admins & other members from having their inbox flooded with individual admission letters).
 * 3. Broadcasts ("everyone", "all members", "whole club") are delivered to active members.
 * 4. Department and team notices are routed to the appropriate department/team members and administrative leadership.
 */
export function isMessageEligibleForRecipient(
  msg: ClubMessage,
  currentMember?: Member | null,
  options?: {
    isSuperOrExecutive?: boolean;
    departments?: Department[];
    teams?: ScientificTeam[];
  }
): boolean {
  if (!msg) return false;

  // Guard against corrupted or completely empty messages
  const hasTitle = Boolean(msg.title && msg.title.trim().length > 0);
  const hasBody = Boolean(msg.body && msg.body.trim().length > 0);
  if (!hasTitle && !hasBody) {
    return false;
  }

  // 1. Personal individual messages (targetMemberId):
  // Must ONLY be delivered to the exact recipient member.
  if (msg.targetMemberId) {
    return Boolean(currentMember && msg.targetMemberId === currentMember.id);
  }

  // If no member is logged in, cannot view broadcast messages
  if (!currentMember) {
    return false;
  }

  // 2. Administrative Leadership can view all non-personal club announcements & department dispatches
  if (options?.isSuperOrExecutive) {
    return true;
  }

  // 3. Broadcast to all members
  const scope = (msg.recipientScope || "").trim().toLowerCase();
  if (
    !scope ||
    scope.includes("everyone") ||
    scope.includes("all members") ||
    scope.includes("all active") ||
    scope.includes("whole club") ||
    scope.includes("general")
  ) {
    return true;
  }

  // 4. Exact member full name matching
  if (currentMember.fullName && scope === currentMember.fullName.trim().toLowerCase()) {
    return true;
  }

  // 5. Department targeting
  if (msg.targetDepartmentId && currentMember.departmentId) {
    if (msg.targetDepartmentId === currentMember.departmentId) return true;
  }
  if (options?.departments && currentMember.departmentId) {
    const dept = options.departments.find((d) => d.id === currentMember.departmentId);
    if (dept && scope === dept.name.trim().toLowerCase()) {
      return true;
    }
  }

  // 6. Team targeting
  if (msg.targetTeamId && options?.teams) {
    const team = options.teams.find((t) => t.id === msg.targetTeamId);
    if (team?.memberIds?.includes(currentMember.id)) {
      return true;
    }
  }
  if (options?.teams) {
    const matchingTeam = options.teams.find((t) => t.name.trim().toLowerCase() === scope);
    if (matchingTeam?.memberIds?.includes(currentMember.id)) {
      return true;
    }
  }

  // 7. Trainee / Probationary scope
  if (scope.includes("trainee")) {
    return (
      currentMember.status === "Trainee" ||
      Boolean((currentMember.roles as string[])?.includes("Trainee"))
    );
  }

  return false;
}
