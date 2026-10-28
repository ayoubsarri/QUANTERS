"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Monitor,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useQuantersStore } from "@/lib/store/useQuantersStore";
import { QuantersVectorWordmark } from "@/components/shared/QuantaLogo";
import { Member } from "@/lib/types/erp";
import {
  checkFirebaseGoogleRedirectResult,
  createFirebaseEmailPasswordUser,
  getFirebaseAuth,
  sendFirebasePasswordReset,
  signInWithFirebaseEmailPassword,
  signInWithFirebaseGooglePopup,
} from "@/lib/firebase/auth";
import {
  checkLoginLockout,
  clearFailedLoginAttempts,
  evaluatePasswordStrength,
  generateStrongPassword,
  recordFailedLoginAttempt,
  TERMS_AND_PRIVACY_DATA,
  validateEmail,
} from "@/lib/utils/authSecurity";

function GoogleLogoSvg({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z"
      />
    </svg>
  );
}

interface SavedLoginEntry {
  email: string;
  fullName: string;
  avatarUrl: string;
  roleLabel: string;
}

const SAVED_LOGINS_STORAGE_KEY = "quanters_saved_logins_v1";

/**
 * True 0.0ms Seamless Loop Video Player (Zero Decoder Reset Delay)
 * Pre-rolls the standby video 450ms before the current video ends so its decoder pipeline
 * is running at full framerate. Handover occurs smoothly 60ms before end without native loop
 * attribute resets or black frame stalls.
 */
function SeamlessLoopVideo({
  src = "/brand/welcome_loop.mp4",
  className = "",
  isActive = true,
}: {
  src?: string;
  poster?: string;
  className?: string;
  isActive?: boolean;
}) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vA = videoARef.current;
    const vB = videoBRef.current;
    if (!vA || !vB || !isActive) {
      if (vA) vA.pause();
      if (vB) vB.pause();
      return;
    }

    let active = 0; // 0 for vA, 1 for vB
    let isHandingOver = false;
    let handoverTimer: number | undefined;
    let rafId: number | undefined;

    vA.style.zIndex = "10";
    vA.style.opacity = "1";
    vB.style.zIndex = "20";
    vB.style.opacity = "0";

    vA.currentTime = 0;
    vB.currentTime = 0;
    vB.pause();
    vA.play().catch(() => {});

    const tick = () => {
      if (document.hidden) {
        return;
      }
      const curr = active === 0 ? vA : vB;
      const next = active === 0 ? vB : vA;

      if (curr && next && curr.duration && !Number.isNaN(curr.duration)) {
        const remaining = curr.duration - curr.currentTime;

        // Initiate zero-delay continuous handover 100ms before current video ends
        if (remaining <= 0.10 && !isHandingOver) {
          isHandingOver = true;
          next.style.zIndex = "20";
          curr.style.zIndex = "10";
          next.currentTime = 0;
          next.play().then(() => {
            next.style.opacity = "1";
            handoverTimer = window.setTimeout(() => {
              curr.pause();
              curr.currentTime = 0;
              curr.style.opacity = "0";
              curr.style.zIndex = "10";
              next.style.zIndex = "10";
              active = active === 0 ? 1 : 0;
              isHandingOver = false;
            }, 80);
          }).catch(() => {
            isHandingOver = false;
          });
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        vA.pause();
        vB.pause();
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else {
        const curr = active === 0 ? vA : vB;
        curr.play().catch(() => {});
        if (!rafId) rafId = window.requestAnimationFrame(tick);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (handoverTimer) window.clearTimeout(handoverTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      vA.pause();
      vB.pause();
      vA.removeAttribute("src");
      vA.load();
      vB.removeAttribute("src");
      vB.load();
    };
  }, [src, isActive]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <video
        ref={videoARef}
        src={src}
        poster="/brand/welcome_keyframe_1.webp"
        preload={isActive ? "auto" : "none"}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-75 ease-out"
        style={{ opacity: 1, zIndex: 10 }}
      />
      <video
        ref={videoBRef}
        src={src}
        preload={isActive ? "auto" : "none"}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-75 ease-out"
        style={{ opacity: 0, zIndex: 20 }}
      />
    </div>
  );
}

export default function WelcomeSplashPage() {
  const router = useRouter();

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const {
    departments,
    teams,
    members,
    loginWithEmail,
    loginWithGoogle,
    registerAccount,
    changeMemberPassword,
    syncWithServer,
    pullExactUpdatesFromServer,
  } = useQuantersStore();

  // In-page Login Drawer state
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "register" | "recovery">("signin");
  const [showContactSupport, setShowContactSupport] = useState(false);

  // Auth form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [registerAsAlumni, setRegisterAsAlumni] = useState(false);
  const [savedLogins, setSavedLogins] = useState<SavedLoginEntry[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [termsModalOpen, setTermsModalOpen] = useState<"terms" | "privacy" | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Forgot Password & Self-Service Account Recovery state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<"search" | "sent" | "google">("search");
  const [matchedMember, setMatchedMember] = useState<Member | null>(null);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState<{
    type: "success" | "error" | "google_account";
    message: string;
  } | null>(null);
  const [copiedRecoveryEmail, setCopiedRecoveryEmail] = useState<string | null>(
    null
  );

  // Post-Login "Save Login?" prompt state (Appears AFTER successful login!)
  const [pendingPostLogin, setPendingPostLogin] = useState<{
    member: Member;
    redirectPath: string;
  } | null>(null);

  // Download App state & native install prompt capture
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [appDownloadedToast, setAppDownloadedToast] = useState(false);

  // Hydrate saved logins from localStorage (Quick Access ONLY for saved logins)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_LOGINS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedLogins(
            parsed.filter(
              (item) => item && typeof item.email === "string" && item.fullName
            )
          );
        }
      }
    } catch {
      // ignore storage errors
    }

    // Initialize lockout state if active
    const lockout = checkLoginLockout();
    if (lockout.isLocked) {
      setLockoutRemaining(lockout.remainingSeconds);
    }
  }, []);

  // Live countdown for security lockout
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Live countdown for password reset resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const deriveMemberRoleBadge = (m?: {
    id: string;
    status?: string;
    departmentId?: string;
  }): string => {
    if (!m) return "Member";
    if (m.status === "Alumni") return "Alumni";
    const managedDept = departments.find((d) => d.headMemberId === m.id);
    if (managedDept) return `${managedDept.shortName} Manager`;
    const subDept = departments.find((d) => d.coManagerMemberId === m.id);
    if (subDept) return `${subDept.shortName} Sub-Manager`;
    const ledTeam = teams.find((t) => !t.archived && t.leaderMemberId === m.id);
    if (ledTeam) return "Team Leader";
    const dept = departments.find((d) => d.id === m.departmentId);
    return dept ? dept.shortName : "Member";
  };

  const persistSavedLogin = (memberObj?: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    status?: string;
    departmentId?: string;
  }) => {
    if (!memberObj) return;
    try {
      const entry: SavedLoginEntry = {
        email: memberObj.email,
        fullName: memberObj.fullName,
        avatarUrl: memberObj.avatarUrl,
        roleLabel: deriveMemberRoleBadge(memberObj),
      };
      const updated = [
        entry,
        ...savedLogins.filter(
          (item) => item.email.toLowerCase() !== entry.email.toLowerCase()
        ),
      ].slice(0, 6);
      setSavedLogins(updated);
      window.localStorage.setItem(
        SAVED_LOGINS_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // ignore storage errors
    }
  };

  const removeSavedLogin = (targetEmail: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = savedLogins.filter(
        (item) => item.email.toLowerCase() !== targetEmail.toLowerCase()
      );
      setSavedLogins(updated);
      window.localStorage.setItem(
        SAVED_LOGINS_STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleDownloadAppClick = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice?.outcome === "accepted") {
          setAppDownloadedToast(true);
          window.setTimeout(() => setAppDownloadedToast(false), 3500);
        }
        setDeferredInstallPrompt(null);
        return;
      } catch {
        // Fallback to Download App modal
      }
    }
    setShowDownloadModal(true);
  };

  const completeAuthenticatedTransition = async (
    member: Member | undefined,
    redirectPath: string
  ) => {
    await syncWithServer(true);
    if (!member) {
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
    setPendingPostLogin({ member, redirectPath });
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Rate-limiting lockout check
    const lockout = checkLoginLockout();
    if (lockout.isLocked) {
      setLockoutRemaining(lockout.remainingSeconds);
      setErrorMsg(
        `Security Lockout: Too many failed attempts. Please wait ${lockout.remainingSeconds}s before trying again.`
      );
      return;
    }

    // 2. Strict RFC 5322 Email Validation
    const validEmail = validateEmail(email);
    if (!validEmail.isValid) {
      setErrorMsg(validEmail.error || "Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setSignInLoading(true);

    if (members.length === 0) {
      await pullExactUpdatesFromServer().catch(() => {});
    }

    // 3. Attempt native Firebase Auth login
    const fbRes = await signInWithFirebaseEmailPassword(validEmail.normalized, password);
    if (fbRes.ok) {
      clearFailedLoginAttempts();
      // Firebase Auth cryptographically verified the password on Google servers
      let res = loginWithEmail(validEmail.normalized);
      if (!res.ok) {
        await pullExactUpdatesFromServer().catch(() => {});
        res = loginWithEmail(validEmail.normalized);
      }
      setSignInLoading(false);
      if (res.ok) {
        await completeAuthenticatedTransition(res.member, res.redirectPath);
        return;
      }
    }

    // 4. Fallback: Authenticate against club ERP credential digest
    let res = loginWithEmail(validEmail.normalized, password);
    if (!res.ok) {
      await pullExactUpdatesFromServer().catch(() => {});
      res = loginWithEmail(validEmail.normalized, password);
    }

    if (res.ok) {
      clearFailedLoginAttempts();
      // Provision non-anonymous Firebase Auth account before syncing state
      if (password.length >= 8) {
        await createFirebaseEmailPasswordUser(validEmail.normalized, password).catch(() => {});
      }
      setSignInLoading(false);
      await completeAuthenticatedTransition(res.member, res.redirectPath);
      return;
    }

    // 5. Authentication failed -> record attempt for brute-force shield
    setSignInLoading(false);
    const shield = recordFailedLoginAttempt();
    if (shield.isLocked) {
      setLockoutRemaining(shield.remainingSeconds);
      setErrorMsg(
        `Security Lockout: 5 failed attempts. Access paused for ${shield.remainingSeconds}s.`
      );
    } else {
      setErrorMsg(
        res.message || "Invalid email or password. Please verify your credentials or use password recovery."
      );
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please provide your full legal name.");
      return;
    }

    const validEmail = validateEmail(email);
    if (!validEmail.isValid) {
      setErrorMsg(validEmail.error || "Please enter a valid university or personal email address.");
      return;
    }

    const pwdEval = evaluatePasswordStrength(password);
    if (!pwdEval.isValid) {
      setErrorMsg(`Password requirements: ${pwdEval.feedback}`);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your confirmation password.");
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg("You must review and accept the QUANTERS Terms of Service and Privacy Policy to create an account.");
      return;
    }

    setRegisterLoading(true);

    // 1. Create in Firebase Auth
    const fbCreateRes = await createFirebaseEmailPasswordUser(validEmail.normalized, password);
    if (!fbCreateRes.ok && fbCreateRes.errorCode === "auth/email-already-in-use") {
      const existingInErp = members.find((m) => m.email.toLowerCase() === validEmail.normalized);
      if (existingInErp) {
        setRegisterLoading(false);
        if (existingInErp.status === "Removed") {
          setErrorMsg("This account was previously removed from active membership. Please contact hr.quanta@univ-alger.dz for reinstatement.");
        } else {
          setErrorMsg("An account with this email address already exists. Please sign in instead.");
        }
        return;
      }
      // If the account was permanently deleted/released from the ERP, reuse or verify Firebase Auth session:
      await signInWithFirebaseEmailPassword(validEmail.normalized, password).catch(() => {});
    }

    // 2. Create in ERP state
    const res = registerAccount({
      fullName: fullName.trim(),
      email: validEmail.normalized,
      password,
      isAlumni: registerAsAlumni,
    });

    setRegisterLoading(false);
    if (!res.ok) {
      setErrorMsg(res.message || "Could not complete account creation.");
      return;
    }

    await completeAuthenticatedTransition(res.member, res.redirectPath);
  };

  const handleFindAccount = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = forgotPasswordEmail.trim().toLowerCase();
    const validEmail = validateEmail(query);
    if (!validEmail.isValid) {
      setForgotPasswordStatus({
        type: "error",
        message: validEmail.error || "Please enter a valid registered email address.",
      });
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordStatus(null);

    // Refresh members from server if empty
    let list = members;
    if (list.length === 0) {
      await pullExactUpdatesFromServer().catch(() => {});
      list = useQuantersStore.getState().members;
    }

    // Strictly match by email
    let found = list.find((m) => m.email.toLowerCase() === validEmail.normalized);
    if (!found) {
      await pullExactUpdatesFromServer().catch(() => {});
      list = useQuantersStore.getState().members;
      found = list.find((m) => m.email.toLowerCase() === validEmail.normalized);
    }

    setMatchedMember(found || null);

    // If this account signs in via Google, guide to Google Sign-In
    if (found && (found.authProvider === "google" || !found.passwordHash)) {
      setForgotPasswordLoading(false);
      setForgotStep("google");
      setForgotPasswordStatus({
        type: "google_account",
        message: `${found.fullName} (${found.email}) signs in securely via Google Workspace. Please use the button below to sign in.`,
      });
      return;
    }

    // Dispatch official Firebase Auth password reset email
    const resetRes = await sendFirebasePasswordReset(validEmail.normalized);
    setForgotPasswordLoading(false);

    if (resetRes.success) {
      setForgotStep("sent");
      setResendCooldown(60);
      setForgotPasswordStatus({
        type: "success",
        message: `An official password recovery link has been dispatched to ${validEmail.normalized}. Please check your inbox and spam folder.`,
      });
    } else {
      setForgotPasswordStatus({
        type: "error",
        message: resetRes.message || "Unable to dispatch recovery email. Please verify spelling or contact HR administration.",
      });
    }
  };

  const handleFirebasePasswordReset = handleFindAccount;

  const handleNativeFirebaseGooglePopup = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleLoading(true);
    try {
      const popupRes = await signInWithFirebaseGooglePopup();
      if (popupRes.ok && popupRes.email) {
        const res = loginWithGoogle(
          popupRes.email,
          popupRes.fullName,
          popupRes.avatarUrl
        );
        await completeAuthenticatedTransition(res.member, res.redirectPath);
      } else if (!popupRes.cancelled && popupRes.message) {
        setErrorMsg(popupRes.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle Google Redirect fallback result if returning from mobile OAuth redirect
  useEffect(() => {
    let active = true;
    checkFirebaseGoogleRedirectResult().then(async (redirectRes) => {
      if (!active || !redirectRes.ok || !redirectRes.email) return;
      setAuthOpen(true);
      const res = loginWithGoogle(
        redirectRes.email,
        redirectRes.fullName,
        redirectRes.avatarUrl
      );
      await completeAuthenticatedTransition(res.member, res.redirectPath);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSavedAccountLogin = async (saved: SavedLoginEntry) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const activeFbUser = getFirebaseAuth()?.currentUser;
    if (
      activeFbUser &&
      !activeFbUser.isAnonymous &&
      activeFbUser.email?.toLowerCase() === saved.email.toLowerCase()
    ) {
      const res = loginWithEmail(saved.email);
      if (res.ok) {
        await syncWithServer();
        router.push(res.redirectPath);
        return;
      }
    }
    setEmail(saved.email);
  };

  return (
    <div className="min-h-dvh w-full bg-[#030812] text-white relative overflow-hidden select-none flex flex-col justify-between">
      {/* =====================================================================
          1. AMBIENT VIDEO BACKDROP
         ===================================================================== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <SeamlessLoopVideo
          src="/brand/welcome_loop.mp4"
          isActive={!isDesktop}
          className={`lg:hidden transition-all duration-500 ${
            authOpen
              ? "scale-[1.04] brightness-[0.36] blur-[4px]"
              : "scale-[1.01]"
          }`}
        />

        <img
          src="/brand/welcome_keyframe_1.webp"
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
          className={`hidden lg:block absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            authOpen
              ? "scale-110 blur-2xl brightness-[0.2]"
              : "scale-110 blur-2xl brightness-[0.24]"
          }`}
        />

        <div className="hidden lg:block absolute inset-0 bg-quanta-grid-dark opacity-30" />

        <div className="lg:hidden absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#030812]/90 via-[#030812]/40 to-transparent" />
        <div
          className={`lg:hidden absolute inset-x-0 bottom-0 transition-all duration-500 ${
            authOpen
              ? "h-full bg-[#030812]/65"
              : "h-64 bg-gradient-to-t from-[#030812] via-[#030812]/80 to-transparent"
          }`}
        />
      </div>

      {/* =====================================================================
          2. RESPONSIVE STAGE CONTAINER
         ===================================================================== */}
      <div className="relative z-10 w-full max-w-[440px] lg:max-w-[1140px] mx-auto min-h-dvh px-5 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-8 flex flex-col lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center justify-between lg:justify-center">
        {/* LEFT COLUMN (PC ONLY): Uncropped 9:16 Cinema Portal (Clean, unoccluded video with zero bottom headers or dark overlay fades) */}
        <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
          <div className="relative w-full max-w-[380px] aspect-[9/16] max-h-[84dvh] rounded-2xl overflow-hidden border border-white/15 bg-[#040B18] shadow-[0_28px_90px_rgba(0,0,0,0.85)]">
            <SeamlessLoopVideo
              src="/brand/welcome_loop.mp4"
              isActive={isDesktop}
            />
          </div>
        </div>

        {/* RIGHT / MAIN COLUMN (Phone Full Screen & PC Right 7 Columns) */}
        <div className="w-full flex-1 lg:col-span-7 flex flex-col justify-between lg:justify-center min-h-[calc(100dvh-2.5rem)] lg:min-h-0 lg:my-auto lg:space-y-6">
          {/* A. TOP BRAND LOCKUP: STRICT FLUSH-LEFT ALIGNMENT ON DESKTOP & CENTER-LOWER ON MOBILE PORTAL */}
          <header className={`w-full space-y-2 sm:space-y-2.5 transition-all duration-500 ease-out ${authOpen ? "pt-1 sm:pt-2" : ""}`}>
            <div className={`w-full flex transition-all duration-500 ease-out ${
              authOpen
                ? "justify-center text-center lg:justify-start lg:text-left translate-y-3.5 lg:translate-y-0"
                : "justify-start text-left"
            }`}>
              <div className={`inline-flex flex-col select-none transition-all duration-500 ease-out ${
                authOpen
                  ? "items-center text-center lg:items-start lg:text-left"
                  : "items-start text-left"
              }`}>
                <QuantersVectorWordmark
                  className={`w-auto drop-shadow-[0_2px_16px_rgba(0,0,0,0.92)] transition-all duration-500 ease-out ${
                    authOpen
                      ? "h-7 sm:h-8 md:h-10 lg:h-12 max-w-[190px] sm:max-w-[230px] md:max-w-[280px] lg:max-w-[340px]"
                      : "h-8 xs:h-9 sm:h-10 md:h-12 lg:h-14 max-w-[210px] xs:max-w-[240px] sm:max-w-[280px] md:max-w-[340px] lg:max-w-[400px]"
                  }`}
                />
                <div
                  className={`inline-flex items-center gap-1.5 sm:gap-2 transition-all duration-300 ${
                    authOpen
                      ? "mt-1 justify-center lg:justify-start"
                      : "mt-1.5 sm:mt-2 justify-start text-left"
                  }`}
                >
                  <span className="font-display text-[10.5px] xs:text-[11px] sm:text-xs md:text-[13px] font-black tracking-[0.18em] text-[#38E4FF] uppercase leading-none whitespace-nowrap">
                    BY QUANTA
                  </span>
                  <span className="text-white/25 font-mono text-[10px] sm:text-xs leading-none">·</span>
                  <span className="font-mono text-[9px] xs:text-[9.5px] sm:text-[10.5px] md:text-xs font-bold tracking-[0.12em] text-slate-300 uppercase leading-none whitespace-nowrap">
                    UNIVERSITY OF ALGIERS 1
                  </span>
                </div>
              </div>
            </div>

            {!authOpen && (
              <div className="space-y-0">
                <div className="flex items-center justify-between border-y border-white/15 py-2 px-0.5 text-xs font-display font-extrabold tracking-[0.14em] uppercase whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  <span className="text-slate-200">DISCOVER</span>
                  <span className="text-white/25">/</span>
                  <span className="text-[#38E4FF]">LEARN</span>
                  <span className="text-white/25">/</span>
                  <span className="text-slate-200">PROVE</span>
                  <span className="text-white/25">/</span>
                  <span className="text-slate-200">BELONG</span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAppClick}
                  className="w-full flex items-center justify-between gap-2 border-b border-white/12 py-2 px-0.5 active:scale-[0.99] transition-all cursor-pointer group drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                >
                  <span className="font-editorial italic text-base sm:text-lg text-slate-200 group-hover:text-white transition-colors whitespace-nowrap leading-none">
                    Available for phone &amp; desktop
                  </span>

                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-[0.12em] uppercase text-[#38E4FF] group-hover:text-white transition-colors whitespace-nowrap">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="animate-download-bob text-[#38E4FF] group-hover:text-[#FFE500] transition-colors shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 2V10.5M8 10.5L4.8 7.3M8 10.5L11.2 7.3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.5 13.2H13.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="border-b border-[#38E4FF]/55 group-hover:border-white pb-0.5">
                      Download App
                    </span>
                  </span>
                </button>
              </div>
            )}
          </header>

          {/* B. CENTER STAGE */}
          {!authOpen ? (
            <div className="my-auto py-4 lg:py-0 lg:my-0">
              <div className="hidden lg:block space-y-3.5 max-w-[540px] animate-rise">
                <h1 className="font-display font-black text-3xl xl:text-[42px] tracking-[-0.03em] text-white leading-[1.08]">
                  More than a club,{" "}
                  <span className="block font-editorial italic font-normal text-[#38E4FF] text-4xl xl:text-[50px] tracking-normal mt-1">
                    a scientific journey.
                  </span>
                </h1>

                <p className="text-sm text-slate-300/90 leading-relaxed max-w-[460px]">
                  Join hands-on workshops, verify laboratory and technical skills,
                  collaborate across scientific teams, and build your academic
                  track record at the University of Algiers 1.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 w-full cursor-pointer lg:hidden"
              onClick={() => setAuthOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* C. BOTTOM INTERACTIVE DOCK */}
          <footer className="w-full space-y-3.5 lg:space-y-4">
            {!authOpen ? (
              <div className="w-full space-y-3.5 animate-rise">
                {/* Phone Editorial Statement right above Start button */}
                <div className="lg:hidden px-0.5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                  <p className="font-display font-black text-xl sm:text-2xl tracking-[-0.02em] text-white leading-tight">
                    More than a club,{" "}
                    <span className="font-editorial italic font-normal text-[#38E4FF] text-[26px] sm:text-3xl">
                      a scientific journey.
                    </span>
                  </p>
                </div>

                {/* Primary Bottom Start Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthOpen(true);
                    setPendingPostLogin(null);
                  }}
                  className="w-full h-14 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#061326] shadow-[0_16px_40px_rgba(0,0,0,0.75)] active:scale-[0.99] transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display font-black text-lg tracking-tight text-[#061326]">
                      Start
                    </span>
                    <span className="h-4 w-px bg-slate-300" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                      Member Portal
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-[#07162E] group-hover:bg-[#1D63EB] text-[#38E4FF] group-hover:text-white flex items-center justify-center transition">
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {/* Institutional Partner Emblems (Clean, Spacious & White Logo) */}
                <div className="pt-2">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2.5" />
                  <div className="flex items-center justify-between px-2 sm:px-3">
                    <img
                      src="/brand/univ_quanta_asset2.png"
                      alt="Quanta Scientific Club"
                      className="h-6 sm:h-7 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
                    />
                    <span className="h-6 sm:h-7 w-px bg-white/20 shrink-0 mx-2 sm:mx-3" />
                    <img
                      src="/brand/QUANTERS_white_logo.svg"
                      alt="Faculty of Sciences - University of Algiers 1"
                      className="h-8 sm:h-9 lg:h-10 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                    />
                  </div>
                </div>
              </div>
            ) : pendingPostLogin ? (
              /* ==============================================================
                 POST-LOGIN "SAVE LOGIN?" STEP (Appears AFTER Login Succeeds)
                 ============================================================== */
              <div
                data-modal="true"
                role="dialog"
                aria-label="Save Login for Quick Access"
                className="w-full bg-gradient-to-b from-[#132441]/95 via-[#0E1B31]/98 to-[#091324]/98 backdrop-blur-2xl border border-[#38BDF8]/45 rounded-2xl p-4 sm:p-5 shadow-[0_24px_64px_rgba(3,8,18,0.88)] space-y-3.5 text-left animate-rise"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.12em] text-emerald-300">
                      Signed In Successfully
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(pendingPostLogin.redirectPath)}
                    aria-label="Skip saving login"
                    className="w-7 h-7 rounded-lg bg-[#0B1528] hover:bg-[#182C4E] border border-[#2B4875] text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Signed-in Account Preview */}
                <div className="p-3 rounded-xl bg-[#081223] border border-[#2B4875]/80 flex items-center gap-3">
                  <img
                    src={pendingPostLogin.member.avatarUrl}
                    alt={pendingPostLogin.member.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-[#38BDF8]/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-display font-black text-white truncate">
                      {pendingPostLogin.member.fullName}
                    </p>
                    <p className="text-[11px] font-mono text-[#7DD3FC] truncate">
                      {deriveMemberRoleBadge(pendingPostLogin.member)} ·{" "}
                      {pendingPostLogin.member.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display text-sm sm:text-base font-black text-white">
                    Save login on this device?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Add your account to{" "}
                    <span className="text-[#7DD3FC] font-semibold">
                      Quick Access
                    </span>{" "}
                    so you can sign in with one tap next time you open QUANTERS.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => router.push(pendingPostLogin.redirectPath)}
                    className="h-10 rounded-xl bg-[#081223] hover:bg-[#11203A] border border-[#2B4875] text-slate-300 hover:text-white font-display font-bold text-xs transition cursor-pointer"
                  >
                    Not Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      persistSavedLogin(pendingPostLogin.member);
                      router.push(pendingPostLogin.redirectPath);
                    }}
                    className="h-10 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#182C4E] hover:brightness-110 border border-[#38BDF8]/45 text-white font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_8px_24px_rgba(2,132,199,0.3)] transition cursor-pointer"
                  >
                    <BookmarkCheck className="w-4 h-4 text-[#7DD3FC]" />
                    <span>Save Login</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ==============================================================
                 STATE B: In-Page Login, Google OAuth, Registration & Password Box
                 ============================================================== */
              <div
                data-modal="true"
                role="dialog"
                aria-label="Member Sign In"
                className="w-full bg-gradient-to-b from-[#091527]/98 via-[#060F1E]/98 to-[#040A14]/99 backdrop-blur-3xl border border-[#38BDF8]/35 hover:border-[#38BDF8]/50 rounded-2xl p-5 sm:p-6 shadow-[0_28px_80px_rgba(2,6,18,0.96),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-3.5 text-left animate-rise transition-all"
              >
                {/* Header (Clean, Zero Redundant Box Badges) */}
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/8">
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                      {authMode === "signin"
                        ? "Member Authentication"
                        : authMode === "recovery"
                        ? "Reset Password"
                        : "Create New Account"}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {authMode === "signin"
                        ? "Sign in to access your QUANTA club portal"
                        : authMode === "recovery"
                        ? "Enter your email to receive recovery instructions"
                        : "Register your credentials to join QUANTERS"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthOpen(false);
                      setShowForgotPassword(false);
                    }}
                    aria-label="Close login panel"
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#38BDF8]/50 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modern Clean Tabs (No Clunky Boxes) */}
                <div className="flex items-center gap-5 sm:gap-6 border-b border-white/10 pt-1 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`text-sm font-display font-black tracking-wide transition-colors cursor-pointer relative pb-1 ${
                      authMode === "signin"
                        ? "text-white after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-[#38E4FF]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`text-sm font-display font-black tracking-wide transition-colors cursor-pointer relative pb-1 ${
                      authMode === "register"
                        ? "text-white after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-[#38E4FF]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Create Account
                  </button>
                  {authMode === "recovery" && (
                    <button
                      type="button"
                      className="text-sm font-display font-black tracking-wide text-white relative pb-1 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-[#38E4FF]"
                    >
                      Reset Password
                    </button>
                  )}
                </div>

                {/* Saved Login: simple, clean, no nested boxes, only member name */}
                {savedLogins.length > 0 && authMode === "signin" && (
                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Saved Login
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {savedLogins.map((saved) => (
                        <div
                          key={saved.email}
                          onClick={() => handleSavedAccountLogin(saved)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSavedAccountLogin(saved);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#101F38] hover:bg-[#182C4E] border border-[#2B4875]/70 text-white text-xs font-bold transition cursor-pointer group shadow-xs"
                        >
                          <img
                            src={saved.avatarUrl}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#38BDF8]/40"
                          />
                          <span className="truncate max-w-[150px]">{saved.fullName}</span>
                          <button
                            type="button"
                            onClick={(e) => removeSavedLogin(saved.email, e)}
                            aria-label={`Remove saved login for ${saved.fullName}`}
                            className="text-slate-400 hover:text-white p-0.5 -mr-0.5 cursor-pointer"
                            title="Remove saved login"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold text-center">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-200 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {authMode === "recovery" ? (
                  <div className="space-y-3.5 animate-rise">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#0284C7]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38E4FF] shrink-0">
                          <KeyRound className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <h3 className="font-display font-black text-sm text-white leading-tight">
                            Account Security &amp; Password Reset
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            {forgotStep === "search"
                              ? "Enter your registered university or personal email"
                              : forgotStep === "sent"
                              ? "Secure recovery link dispatched"
                              : "Google Sign-In recovery"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signin");
                          setForgotStep("search");
                          setMatchedMember(null);
                          setForgotPasswordStatus(null);
                        }}
                        className="text-xs font-mono font-bold text-[#38E4FF] hover:underline cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                    </div>

                      {/* STEP 1: Search Account & Dispatch Official Reset Email */}
                      {forgotStep === "search" && (
                        <form onSubmit={handleFindAccount} noValidate className="space-y-2.5">
                          <div>
                            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                              Registered Email Address
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-[#7DD3FC] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                              <input
                                type="email"
                                required
                                value={forgotPasswordEmail}
                                onChange={(e) => {
                                  setForgotPasswordEmail(e.target.value);
                                  if (forgotPasswordStatus) setForgotPasswordStatus(null);
                                }}
                                placeholder="name@univ-alger.dz"
                                className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#081223] border border-white/15 focus:border-[#38BDF8] text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#38BDF8]/40"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={forgotPasswordLoading}
                            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#182C4E] hover:brightness-110 border border-[#38BDF8]/45 text-white font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(2,132,199,0.3)] transition cursor-pointer disabled:opacity-50"
                          >
                            {forgotPasswordLoading ? (
                              <span>Dispatching recovery link...</span>
                            ) : (
                              <>
                                <KeyRound className="w-3.5 h-3.5 text-[#7DD3FC]" />
                                <span>Send Password Reset Link</span>
                              </>
                            )}
                          </button>
                        </form>
                      )}

                      {/* STEP 2: Recovery Link Dispatched Confirmation Card */}
                      {forgotStep === "sent" && (
                        <div className="space-y-3.5 animate-rise">
                          <div className="p-4 rounded-xl bg-[#08162C] border border-emerald-500/40 text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mx-auto">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h4 className="font-display font-black text-sm text-white">
                              Recovery Link Dispatched
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              An official password reset link has been dispatched to:
                            </p>
                            <div className="font-mono text-xs font-bold text-[#38BDF8] bg-[#030914] py-1.5 px-3 rounded-lg border border-white/10 inline-block">
                              {forgotPasswordEmail.trim().toLowerCase()}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                              Please check your inbox (and spam folder) within the next hour. Follow the secure link to set your new password.
                            </p>
                          </div>

                          {matchedMember && (
                            <div className="p-3 rounded-xl bg-[#081223] border border-white/10 flex items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={matchedMember.avatarUrl || "/brand/logo_quanta_opt.webp"}
                                  alt={matchedMember.fullName}
                                  className="w-8 h-8 rounded-lg object-cover border border-[#38BDF8]/40 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="text-xs font-extrabold text-white truncate">
                                    {matchedMember.fullName}
                                  </div>
                                  <div className="text-[10px] font-mono text-emerald-400">
                                    Verified Club Member
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={resendCooldown > 0 || forgotPasswordLoading}
                              onClick={() => handleFindAccount()}
                              className="flex-1 h-9 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                              <span>
                                {resendCooldown > 0
                                  ? `Resend in ${resendCooldown}s`
                                  : "Resend Link"}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowForgotPassword(false);
                                setForgotStep("search");
                              }}
                              className="px-4 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs font-semibold transition cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2B: Google-Registered Account */}
                      {forgotStep === "google" && matchedMember && (
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs space-y-1">
                            <div className="font-extrabold flex items-center gap-1.5 text-amber-300">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>Google Account Identified</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              <strong>{matchedMember.fullName}</strong> ({matchedMember.email}) signs in securely via Google. You do not need a password.
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={googleLoading}
                            onClick={handleNativeFirebaseGooglePopup}
                            className="w-full h-11 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 font-display font-extrabold text-xs text-[#071731] active:scale-[0.99] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
                          >
                            <GoogleLogoSvg className="w-4 h-4" />
                            <span>
                              {googleLoading ? "Connecting to Google..." : `Sign in as ${matchedMember.fullName}`}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Status Feedback Banner */}
                      {forgotPasswordStatus && (
                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed border ${
                            forgotPasswordStatus.type === "success"
                              ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
                              : forgotPasswordStatus.type === "google_account"
                              ? "bg-amber-500/15 border-amber-400/40 text-amber-200"
                              : "bg-rose-500/15 border-rose-400/40 text-rose-200"
                          }`}
                        >
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            {forgotPasswordStatus.type === "success" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : forgotPasswordStatus.type === "google_account" ? (
                              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span>
                              {forgotPasswordStatus.type === "success"
                                ? "Success"
                                : forgotPasswordStatus.type === "google_account"
                                ? "Google Account"
                                : "Notice"}
                            </span>
                          </div>
                          <p>{forgotPasswordStatus.message}</p>
                        </div>
                      )}

                      {/* Compact Professional Support Section */}
                      <div className="pt-2.5 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setShowContactSupport((prev) => !prev)}
                          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-[#38BDF8]" />
                            <span>Contact Club Administration</span>
                          </span>
                          <span className="text-[11px] font-mono text-[#38BDF8]">
                            {showContactSupport ? "Hide" : "View Channels"}
                          </span>
                        </button>

                        {showContactSupport && (
                          <div className="mt-2 p-3 rounded-xl bg-[#081223] border border-white/10 space-y-2.5 animate-rise">
                            <div className="flex items-center justify-between text-xs gap-2">
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Club Governance Desk</div>
                                <a href="mailto:quantaclubdz@gmail.com" className="font-mono text-xs text-[#38BDF8] hover:underline font-bold">
                                  quantaclubdz@gmail.com
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    navigator.clipboard.writeText("quantaclubdz@gmail.com");
                                    setCopiedRecoveryEmail("quantaclubdz@gmail.com");
                                    setTimeout(() => setCopiedRecoveryEmail(null), 2000);
                                  } catch {}
                                }}
                                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold text-white transition cursor-pointer"
                              >
                                {copiedRecoveryEmail === "quantaclubdz@gmail.com" ? "Copied" : "Copy"}
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-xs gap-2 pt-2 border-t border-white/5">
                              <div>
                                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">HR Bureau Desk</div>
                                <a href="mailto:hr.quanta@univ-alger.dz" className="font-mono text-xs text-[#38BDF8] hover:underline font-bold">
                                  hr.quanta@univ-alger.dz
                                </a>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    navigator.clipboard.writeText("hr.quanta@univ-alger.dz");
                                    setCopiedRecoveryEmail("hr.quanta@univ-alger.dz");
                                    setTimeout(() => setCopiedRecoveryEmail(null), 2000);
                                  } catch {}
                                }}
                                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-mono font-bold text-white transition cursor-pointer"
                              >
                                {copiedRecoveryEmail === "hr.quanta@univ-alger.dz" ? "Copied" : "Copy"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("signin");
                          setForgotStep("search");
                          setMatchedMember(null);
                          setForgotPasswordStatus(null);
                        }}
                        className="w-full h-9 rounded-xl bg-[#182C4E] hover:brightness-110 border border-[#38BDF8]/35 text-white font-display font-bold text-xs transition cursor-pointer"
                      >
                        Back to Sign In
                      </button>
                    </div>
                  ) : authMode === "signin" ? (
                    <div className="space-y-2.5">
                      <form onSubmit={handleEmailSignIn} noValidate className="space-y-2.5">
                        <div>
                          <label
                            htmlFor="signin-email"
                            className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                          >
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-[#7DD3FC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              id="signin-email"
                              type="email"
                              name="email"
                              autoComplete="username"
                              aria-label="Email Address"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="name@univ-alger.dz"
                              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#030914]/90 text-sm border border-white/15 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] focus:bg-[#051124] transition shadow-inner"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label
                              htmlFor="signin-password"
                              className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300"
                            >
                              Password
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setErrorMsg(null);
                                setAuthMode("recovery");
                                setForgotStep("search");
                              }}
                              className="text-[11px] font-mono font-bold text-[#38E4FF] hover:underline transition cursor-pointer"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <KeyRound className="w-4 h-4 text-[#7DD3FC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              id="signin-password"
                              type={showPassword ? "text" : "password"}
                              name="password"
                              autoComplete="current-password"
                              aria-label="Password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Password"
                              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#030914]/90 text-sm border border-white/15 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] focus:bg-[#051124] transition shadow-inner"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {lockoutRemaining > 0 && (
                          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Too many attempts. Lockout active for {lockoutRemaining}s</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={signInLoading || lockoutRemaining > 0}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] font-display font-extrabold text-sm via-[#0369A1] to-[#1D4ED8] hover:brightness-110 border border-[#38BDF8]/50 text-white font-display font-extrabold text-xs tracking-wider uppercase shadow-[0_8px_24px_rgba(2,132,199,0.38)] active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span>{signInLoading ? "Authenticating..." : "Sign In"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <p className="text-[10px] text-slate-400 text-center pt-1 leading-relaxed">
                          By signing in, you agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setTermsModalOpen("terms")}
                            className="text-[#38BDF8] hover:underline font-semibold cursor-pointer"
                          >
                            Terms of Service
                          </button>{" "}
                          and{" "}
                          <button
                            type="button"
                            onClick={() => setTermsModalOpen("privacy")}
                            className="text-[#38BDF8] hover:underline font-semibold cursor-pointer"
                          >
                            Privacy Policy
                          </button>
                          .
                        </p>
                      </form>

                      {/* Divider + Continue with Google */}
                      <div className="flex items-center gap-3 py-1">
                        <span className="h-px flex-1 bg-white/10" />
                        <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400">
                          OR
                        </span>
                        <span className="h-px flex-1 bg-white/10" />
                      </div>

                      <button
                        type="button"
                        disabled={googleLoading}
                        onClick={handleNativeFirebaseGooglePopup}
                        className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 font-display font-extrabold text-xs text-[#071731] active:scale-[0.99] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
                      >
                        <GoogleLogoSvg className="w-4 h-4" />
                        <span>
                          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                    <form onSubmit={handleRegister} noValidate className="space-y-2.5">
                      {/* Clean Role Tabs */}
                      <div className="flex items-center gap-5 border-b border-white/10 pb-2">
                        <button
                          type="button"
                          onClick={() => setRegisterAsAlumni(false)}
                          className={`text-xs font-display font-bold transition-colors cursor-pointer relative pb-0.5 ${
                            !registerAsAlumni
                              ? "text-white after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-[#38E4FF]"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Student Member
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterAsAlumni(true)}
                          className={`text-xs font-display font-bold transition-colors cursor-pointer relative pb-0.5 ${
                            registerAsAlumni
                              ? "text-white after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-[#38E4FF]"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          QUANTA Alumni
                        </button>
                      </div>

                      <div>
                        <label
                          htmlFor="register-fullname"
                          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                        >
                          Full Legal Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#7DD3FC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="register-fullname"
                            type="text"
                            name="name"
                            autoComplete="name"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Full Legal Name"
                            className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#030914]/90 text-sm border border-white/15 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] focus:bg-[#051124] transition shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="register-email"
                          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#7DD3FC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="register-email"
                            type="email"
                            name="email"
                            autoComplete="username email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@univ-alger.dz"
                            className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#030914]/90 text-sm border border-white/15 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] focus:bg-[#051124] transition shadow-inner"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="register-password"
                          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                        >
                          Password (min. 8 characters)
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-[#7DD3FC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            name="new-password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters (letters & numbers)"
                            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#030914]/90 text-sm border border-white/15 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] focus:bg-[#051124] transition shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Real-time Password Strength Meter */}
                        {password.length > 0 && (() => {
                          const evalRes = evaluatePasswordStrength(password);
                          return (
                            <div className="space-y-1 pt-1.5">
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="text-slate-400">Security Strength:</span>
                                <span
                                  className={`font-bold ${
                                    evalRes.score <= 1
                                      ? "text-rose-400"
                                      : evalRes.score === 2
                                      ? "text-amber-400"
                                      : evalRes.score === 3
                                      ? "text-sky-400"
                                      : "text-emerald-400"
                                  }`}
                                >
                                  {evalRes.label}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-1 h-1">
                                {[1, 2, 3, 4].map((stepNum) => (
                                  <div
                                    key={stepNum}
                                    className={`rounded-full transition-all duration-300 ${
                                      evalRes.score >= stepNum
                                        ? evalRes.score <= 1
                                          ? "bg-rose-500"
                                          : evalRes.score === 2
                                          ? "bg-amber-500"
                                          : evalRes.score === 3
                                          ? "bg-sky-400"
                                          : "bg-emerald-400"
                                        : "bg-white/10"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div>
                        <label
                          htmlFor="register-confirm-password"
                          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-[#7DD3FC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirm-password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#030914]/90 text-sm border border-white/15 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none focus:border-[#38BDF8] focus:bg-[#051124] transition shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {confirmPassword.length > 0 && (
                          <div className="pt-1 text-[10px] font-mono flex items-center gap-1">
                            {password === confirmPassword ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3" /> Passwords match
                              </span>
                            ) : (
                              <span className="text-rose-400 font-bold">
                                Passwords do not match
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Terms of Service & Privacy Policy Consent */}
                      <label className="flex items-start gap-2.5 pt-1 text-[11px] text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 rounded border-white/20 bg-slate-900 text-[#0284C7] focus:ring-[#38BDF8] shrink-0"
                        />
                        <span className="leading-tight text-slate-400">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setTermsModalOpen("terms")}
                            className="text-[#38BDF8] hover:underline font-semibold"
                          >
                            QUANTERS Terms of Service
                          </button>{" "}
                          and{" "}
                          <button
                            type="button"
                            onClick={() => setTermsModalOpen("privacy")}
                            className="text-[#38BDF8] hover:underline font-semibold"
                          >
                            Privacy Policy
                          </button>
                          .
                        </span>
                      </label>

                      {/* Primary Create Account Button */}
                      <button
                        type="submit"
                        disabled={registerLoading}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0284C7] font-display font-extrabold text-sm via-[#0369A1] to-[#1D4ED8] hover:brightness-110 border border-[#38BDF8]/50 text-white font-display font-extrabold text-xs tracking-wider uppercase shadow-[0_8px_24px_rgba(2,132,199,0.38)] active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{registerLoading ? "Creating Account..." : "Create Account"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>

                    {/* Divider + Sign up with Google: Identical to Sign In */}
                    <div className="flex items-center gap-3 py-1.5">
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400">
                        OR
                      </span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <button
                      type="button"
                      disabled={googleLoading}
                      onClick={handleNativeFirebaseGooglePopup}
                      className="w-full h-12 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 font-display font-extrabold text-xs text-[#071731] active:scale-[0.99] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
                    >
                      <GoogleLogoSvg className="w-4 h-4" />
                      <span>
                        {googleLoading ? "Connecting to Google..." : "Sign up with Google"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {authOpen && (
              <div className="hidden lg:block pt-1">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />
                <div className="flex items-center justify-between px-2">
                  <img
                    src="/brand/univ_quanta_asset2.png"
                    alt="Quanta Scientific Club"
                    className="h-6 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                  />
                  <span className="h-6 w-px bg-white/20 shrink-0 mx-2" />
                  <img
                    src="/brand/QUANTERS_white_logo.svg"
                    alt="Faculty of Sciences - University of Algiers 1"
                    className="h-8 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]"
                  />
                </div>
              </div>
            )}
          </footer>
        </div>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      {termsModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setTermsModalOpen(null)}
        >
          <div
            className="w-full max-w-[500px] max-h-[85vh] bg-[#07152B] border border-[#38BDF8]/40 rounded-2xl p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)] flex flex-col text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0284C7]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white leading-tight">
                    {termsModalOpen === "terms"
                      ? TERMS_AND_PRIVACY_DATA.terms.title
                      : TERMS_AND_PRIVACY_DATA.privacy.title}
                  </h3>
                  <p className="text-[11px] font-mono text-[#7DD3FC] mt-0.5">
                    {TERMS_AND_PRIVACY_DATA[termsModalOpen].lastUpdated}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs text-slate-300 leading-relaxed">
              {TERMS_AND_PRIVACY_DATA[termsModalOpen].sections.map((sec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/8 space-y-1">
                  <h4 className="font-display font-bold text-white text-xs">
                    {sec.heading}
                  </h4>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed">
                    {sec.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setTermsModalOpen(null)}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#182C4E] hover:brightness-110 text-white font-display font-extrabold text-xs transition cursor-pointer"
              >
                Close &amp; Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download App Modal */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="w-full max-w-[380px] bg-[#07152B] border border-[#38E4FF]/30 rounded-2xl p-5 shadow-[0_24px_80px_rgba(0,0,0,0.85)] space-y-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#38E4FF]/15 border border-[#38E4FF]/35 flex items-center justify-center text-[#38E4FF] shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white leading-tight">
                    Download QUANTERS App
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Get instant home-screen &amp; desktop access
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close download dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-[#38E4FF] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs font-display font-bold text-white">
                    On Phone (Android &amp; iOS)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tap your browser menu or Share icon and select{" "}
                    <span className="text-[#38E4FF] font-semibold">
                      Install App
                    </span>{" "}
                    or{" "}
                    <span className="text-[#38E4FF] font-semibold">
                      Add to Home Screen
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Monitor className="w-4 h-4 text-[#38E4FF] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs font-display font-bold text-white">
                    On Computer (Windows &amp; Mac)
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click the{" "}
                    <span className="text-[#38E4FF] font-semibold">
                      Install QUANTERS
                    </span>{" "}
                    icon in the right side of your address bar.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDownloadModal(false);
                  setAppDownloadedToast(true);
                  window.setTimeout(() => setAppDownloadedToast(false), 3200);
                }}
                className="flex-1 h-10 rounded-xl bg-[#38E4FF] hover:bg-[#60ECFF] text-[#041022] font-display font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Got It · Ready to Install</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {appDownloadedToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#071B36]/95 border border-[#38E4FF]/40 text-white text-xs font-display font-bold shadow-xl">
          <Check className="w-4 h-4 text-[#38E4FF]" />
          <span>QUANTERS App ready on your device</span>
        </div>
      )}
    </div>
  );
}
