import fs from "fs";

let content = fs.readFileSync("src/app/(mobile)/welcome/page.tsx", "utf8").replace(/\r\n/g, "\n");

// 1. Add state variable
const stateTarget = "  const [showContactSupport, setShowContactSupport] = useState(false);";
const stateRepl = `  const [showContactSupport, setShowContactSupport] = useState(false);
  const [accountDeletedModalOpen, setAccountDeletedModalOpen] = useState(false);`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateRepl);
  console.log("Added accountDeletedModalOpen state");
}

// 2. URL param check
const deactivatedTarget = `      } else if (deactivated === "true") {
        setErrorMsg("Your session has ended because your account was removed or deactivated by administration.");
        setAuthOpen(true);
        setAuthMode("signin");`;

const deactivatedRepl = `      } else if (deactivated === "true") {
        setAccountDeletedModalOpen(true);`;

if (content.includes(deactivatedTarget)) {
  content = content.replace(deactivatedTarget, deactivatedRepl);
  console.log("Updated deactivated URL param handling");
}

// 3. In handleEmailSignIn:
const emailSignInTarget1 = `      let res = loginWithEmail(validEmail.normalized, password, true);
      if (!res.ok) {
        await pullExactUpdatesFromServer().catch(() => {});
        res = loginWithEmail(validEmail.normalized, password, true);
      }`;

const emailSignInRepl1 = `      let res = loginWithEmail(validEmail.normalized, password, true);
      if (!res.ok) {
        if ((res as any).isDeleted) {
          setSignInLoading(false);
          setAccountDeletedModalOpen(true);
          return;
        }
        await pullExactUpdatesFromServer().catch(() => {});
        res = loginWithEmail(validEmail.normalized, password, true);
      }
      if (!res.ok && (res as any).isDeleted) {
        setSignInLoading(false);
        setAccountDeletedModalOpen(true);
        return;
      }`;

if (content.includes(emailSignInTarget1)) {
  content = content.replace(emailSignInTarget1, emailSignInRepl1);
  console.log("Patched emailSignInTarget1");
}

const emailSignInTarget2 = `    let res = loginWithEmail(validEmail.normalized, password);
    if (!res.ok) {
      await pullExactUpdatesFromServer().catch(() => {});
      res = loginWithEmail(validEmail.normalized, password);
    }`;

const emailSignInRepl2 = `    let res = loginWithEmail(validEmail.normalized, password);
    if (!res.ok) {
      if ((res as any).isDeleted) {
        setSignInLoading(false);
        setAccountDeletedModalOpen(true);
        return;
      }
      await pullExactUpdatesFromServer().catch(() => {});
      res = loginWithEmail(validEmail.normalized, password);
    }
    if (!res.ok && (res as any).isDeleted) {
      setSignInLoading(false);
      setAccountDeletedModalOpen(true);
      return;
    }`;

if (content.includes(emailSignInTarget2)) {
  content = content.replace(emailSignInTarget2, emailSignInRepl2);
  console.log("Patched emailSignInTarget2");
}

// 4. In handleRegister:
const regCheckTarget = `      const existingInErp = members.find((m) => m.email.toLowerCase() === validEmail.normalized);
      if (existingInErp && existingInErp.status !== "Removed") {
        setRegisterLoading(false);
        setErrorMsg("An active account with this email address already exists. Please sign in instead.");
        return;
      }`;

const regCheckRepl = `      const existingInErp = members.find((m) => m.email.toLowerCase() === validEmail.normalized);
      if (existingInErp && existingInErp.status === "Removed") {
        setRegisterLoading(false);
        setAccountDeletedModalOpen(true);
        return;
      }
      if (existingInErp && existingInErp.status !== "Removed") {
        setRegisterLoading(false);
        setErrorMsg("An active account with this email address already exists. Please sign in instead.");
        return;
      }`;

if (content.includes(regCheckTarget)) {
  content = content.replace(regCheckTarget, regCheckRepl);
  console.log("Patched regCheckTarget");
}

const regStoreTarget = `    setRegisterLoading(false);
    if (!res.ok) {
      setErrorMsg(res.message || "Could not complete account creation.");
      return;
    }`;

const regStoreRepl = `    setRegisterLoading(false);
    if (!res.ok) {
      if ((res as any).isDeleted) {
        setAccountDeletedModalOpen(true);
        return;
      }
      setErrorMsg(res.message || "Could not complete account creation.");
      return;
    }`;

if (content.includes(regStoreTarget)) {
  content = content.replace(regStoreTarget, regStoreRepl);
  console.log("Patched regStoreTarget");
}

// 5. In handleGoogleAuth:
const googleAuthTarget = `          if (!res.ok) {
            await pullExactUpdatesFromServer().catch(() => {});
            res = loginWithGoogle(
              popupRes.email,
              popupRes.fullName,
              popupRes.avatarUrl
            );
          }`;

const googleAuthRepl = `          if (!res.ok) {
            if ((res as any).isDeleted) {
              setGoogleLoading(false);
              setAccountDeletedModalOpen(true);
              return;
            }
            await pullExactUpdatesFromServer().catch(() => {});
            res = loginWithGoogle(
              popupRes.email,
              popupRes.fullName,
              popupRes.avatarUrl
            );
          }
          if (!res.ok && (res as any).isDeleted) {
            setGoogleLoading(false);
            setAccountDeletedModalOpen(true);
            return;
          }`;

if (content.includes(googleAuthTarget)) {
  content = content.replace(googleAuthTarget, googleAuthRepl);
  console.log("Patched googleAuthTarget");
}

// 6. In handleSavedAccountLogin:
const savedAccountTarget = `  const handleSavedAccountLogin = async (saved: SavedLoginEntry) => {`;
const savedAccountRepl = `  const handleSavedAccountLogin = async (saved: SavedLoginEntry) => {
    const mem = members.find((m) => m.email.toLowerCase() === saved.email.toLowerCase());
    if (mem && mem.status === "Removed") {
      setAccountDeletedModalOpen(true);
      return;
    }`;

if (content.includes(savedAccountTarget)) {
  content = content.replace(savedAccountTarget, savedAccountRepl);
  console.log("Patched savedAccountTarget");
}

// 7. Append the Account Deleted Modal before the last closing </div>
const modalMarkup = `      {/* ACCOUNT DEACTIVATED & DELETED MODAL (WITH NANO BANANA MASCOT) */}
      {accountDeletedModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#08101E] border border-rose-500/30 shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-6 text-center text-white space-y-4 animate-rise relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Mascot Container */}
            <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-rose-500/40 shadow-[0_12px_28px_rgba(244,63,94,0.2)] bg-[#040A14]">
              <img
                src="/brand/mascot_account_deleted.png"
                alt="Account Retired Mascot"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08101E]/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Title & Badge */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                {lang === "ar" ? "حساب مستبعد ومحذوف" : "Account Deactivated & Deleted"}
              </span>
              <h3 className="font-display text-lg font-black tracking-tight text-white mt-1">
                {lang === "ar" ? "تم إيقاف هذا الحساب نهائياً" : "Your Account is Deleted"}
              </h3>
            </div>

            {/* Explanatory Notice */}
            <p className="text-xs text-slate-300 leading-relaxed font-sans px-2">
              {lang === "ar"
                ? "تم نقل حساب عضويتك إلى سجل الأعضاء السابقين (مستبعد) من قبل المكتب التنفيذي. وفقاً للقوانين الداخلية للنادي، تم تعطيل الحساب نهائياً ولا يمكن تسجيل الدخول أو إعادة التسجيل بهذا البريد الإلكتروني."
                : "Your QUANTA membership account was moved to Former Members (Removed) by the Executive Bureau. In accordance with internal bylaws, this account is permanently deactivated and this email address cannot be used to register again."}
            </p>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <a
                href="mailto:quantaclubdz@gmail.com?subject=QUANTA%20Account%20Removal%20Inquiry"
                className="w-full h-10 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:brightness-110 text-white font-display font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98]"
              >
                <span>{lang === "ar" ? "مراسلة الإدارة التنفيذية" : "Contact HR / Executive Bureau"}</span>
              </a>

              <button
                type="button"
                onClick={() => setAccountDeletedModalOpen(false)}
                className="w-full h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-display font-bold text-xs transition cursor-pointer"
              >
                {lang === "ar" ? "إغلاق" : "Dismiss"}
              </button>
            </div>
          </div>
        </div>
      )}
`;

const lastDivIndex = content.lastIndexOf("</div>\n  );");
if (lastDivIndex !== -1) {
  content = content.slice(0, lastDivIndex) + modalMarkup + "\n    " + content.slice(lastDivIndex);
  console.log("Appended Account Deleted Modal to welcome page");
}

fs.writeFileSync("src/app/(mobile)/welcome/page.tsx", content);
