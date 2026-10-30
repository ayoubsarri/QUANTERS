import fs from 'fs';

let content = fs.readFileSync('src/app/(mobile)/welcome/page.tsx', 'utf8');

// 1. Wipe ?deactivated=true from address bar once displayed
const oldDeactivatedCheck = `      if (deactivated === "true") {
        setErrorMsg("Your session has ended because your account was removed or deactivated by administration.");
        setAuthOpen(true);
        setAuthMode("signin");
      }`;

const newDeactivatedCheck = `      if (deactivated === "true") {
        setErrorMsg("Your session has ended because your account was removed or deactivated by administration.");
        setAuthOpen(true);
        setAuthMode("signin");
        try {
          window.history.replaceState({}, "", "/welcome");
        } catch {}
      }`;

content = content.replace(oldDeactivatedCheck.replace(/\r?\n/g, '\r\n'), newDeactivatedCheck.replace(/\r?\n/g, '\r\n'));

// 2. In completeAuthenticatedTransition, immediately set auth store state and close auth modal
const oldCompleteTransition = `    if (!member) {
      router.push(redirectPath);
      return;
    }
    const alreadySaved = savedLogins.some(
      (item) => item.email.toLowerCase() === member.email.toLowerCase()
    );
    if (alreadySaved) {
      persistSavedLogin(member);
      router.push(redirectPath);
      return;
    }
    // Show "Save Login?" prompt AFTER login succeeds
    setPendingPostLogin({ member, redirectPath });`;

const newCompleteTransition = `    if (!member) {
      router.push(redirectPath);
      return;
    }

    const { adminRole } = resolveRoleAndRedirect(member);
    useQuantersStore.setState({
      isAuthenticated: true,
      currentMemberId: member.id,
      activeAdminRole: adminRole,
    });
    useQuantersStore.getState().saveToLocalCache();
    setAuthOpen(false);

    const alreadySaved = savedLogins.some(
      (item) => item.email.toLowerCase() === member.email.toLowerCase()
    );
    if (alreadySaved) {
      persistSavedLogin(member);
      router.push(redirectPath);
      return;
    }
    // Show "Save Login?" prompt AFTER login succeeds
    setPendingPostLogin({ member, redirectPath });`;

content = content.replace(oldCompleteTransition.replace(/\r?\n/g, '\r\n'), newCompleteTransition.replace(/\r?\n/g, '\r\n'));

fs.writeFileSync('src/app/(mobile)/welcome/page.tsx', content, 'utf8');
console.log('Successfully updated welcome page!');
