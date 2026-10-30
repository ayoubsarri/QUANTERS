import React from "react";
import { Member } from "@/lib/types/erp";
import { isSuperAdminEmail } from "@/lib/firebase/config";

/**
 * Checks if a member profile belongs to the Super Admin or system account.
 */
export function isSuperAdminMember(m?: (Partial<Member> & { id?: string; email?: string; roles?: string[] }) | null): boolean {
  if (!m) return false;
  if (m.id === "mem-super-quanta") return true;
  if (Array.isArray(m.roles) && m.roles.includes("Super Admin")) return true;
  if (m.email && isSuperAdminEmail(m.email)) return true;
  return false;
}

/**
 * Checks if a member profile is an active student / regular club member eligible
 * for task assignments, badge awards, merit points, and monthly honours.
 * Excludes Super Admin / Executive governance accounts and deactivated accounts.
 */
export function isAssignableMember(m?: Member | null): boolean {
  if (!m) return false;
  if (isSuperAdminMember(m)) return false;
  if (m.status === "Removed") return false;
  return true;
}

/**
 * Sorts members alphabetically A -> Z by fullName so keyboard letter navigation is natural.
 */
export function sortMembersByName<T extends Pick<Member, "fullName">>(list: T[]): T[] {
  return [...list].sort((a, b) => a.fullName.localeCompare(b.fullName));
}

/**
 * Handles keyboard letter press (A-Z) on a controlled <select> or custom member picker
 * to immediately jump to (and cycle through) members whose fullName starts with that letter.
 */
export function handleMemberSelectKeyDown<T extends Pick<Member, "id" | "fullName">>(
  e: React.KeyboardEvent,
  members: T[],
  currentSelectedOrCallback: string | ((id: string) => void),
  maybeOnSelectMemberId?: (id: string) => void
) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key;
  if (!key || key.length !== 1 || !/^[a-zA-Z]$/.test(key)) return;

  const onSelectMemberId =
    typeof currentSelectedOrCallback === "function"
      ? currentSelectedOrCallback
      : maybeOnSelectMemberId;
  if (!onSelectMemberId) return;

  const selectValue =
    typeof currentSelectedOrCallback === "string"
      ? currentSelectedOrCallback
      : (e.currentTarget as HTMLSelectElement | null)?.value || "";

  const letter = key.toLowerCase();
  const sorted = sortMembersByName(members);
  const matches = sorted.filter((m) => m.fullName.trim().toLowerCase().startsWith(letter));
  if (matches.length === 0) return;

  e.preventDefault();
  const currentIdx = matches.findIndex(
    (m) => m.id === selectValue || m.fullName === selectValue
  );
  const nextMatch = matches[(currentIdx + 1) % matches.length];
  if (nextMatch) {
    onSelectMemberId(nextMatch.id);
  }
}

/**
 * Handles keyboard letter press (A-Z) inside a scrollable container of member rows/checkboxes.
 * Scrolls the matching member item (with data-member-name="...") into view and focuses its input/button.
 */
export function handleMemberListContainerKeyDown(
  e: React.KeyboardEvent<HTMLElement>,
  _members?: unknown,
  _onToggle?: (id: string) => void
) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const target = e.target as HTMLElement;
  if (
    target &&
    (target.tagName === "INPUT" && (target as HTMLInputElement).type === "text" ||
      target.tagName === "TEXTAREA")
  ) {
    return;
  }

  const key = e.key;
  if (!key || key.length !== 1 || !/^[a-zA-Z]$/.test(key)) return;

  const letter = key.toLowerCase();
  const container = e.currentTarget;
  const items = Array.from(
    container.querySelectorAll<HTMLElement>("[data-member-name]")
  );
  if (items.length === 0) return;

  const matchingItems = items.filter((el) =>
    (el.getAttribute("data-member-name") || "").trim().toLowerCase().startsWith(letter)
  );
  if (matchingItems.length === 0) return;

  e.preventDefault();
  const activeEl = document.activeElement as HTMLElement | null;
  const currentIdx = matchingItems.findIndex(
    (item) => item === activeEl || item.contains(activeEl)
  );
  const nextItem = matchingItems[(currentIdx + 1) % matchingItems.length];
  if (nextItem) {
    nextItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const focusable =
      nextItem.querySelector<HTMLElement>("input, button, [tabindex]") || nextItem;
    focusable.focus({ preventScroll: true });
  }
}

/**
 * Reliable cross-browser clipboard copy with synchronous textarea fallback.
 */
export async function copyToClipboardReliable(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to execCommand fallback
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
