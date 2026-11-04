"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  Clock,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

type ExamPhase = "lobby" | "running" | "result";

export default function BadgeExamPage() {
  const params = useParams<{ badgeId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const rawBadgeId = params?.badgeId || "";
  const pathLastSegment = (pathname || "").split("/").filter(Boolean).pop() || "";
  const badgeId =
    rawBadgeId && rawBadgeId !== "exam"
      ? rawBadgeId
      : pathLastSegment || rawBadgeId;

  const exams = useQuantersStore((s) => s.exams);
  const badges = useQuantersStore((s) => s.badges);
  const completeBadgeExam = useQuantersStore((s) => s.completeBadgeExam);

  // Match exam by exam.id === badgeId || exam.badgeId === badgeId, fallback to exams[0]
  const exam =
    exams.find((e) => e.id === badgeId || e.badgeId === badgeId) || exams[0];
  const linkedBadge = badges.find((b) => b.id === exam?.badgeId);

  const [phase, setPhase] = useState<ExamPhase>("lobby");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    {}
  );
  const [secondsRemaining, setSecondsRemaining] = useState(
    (exam?.durationMinutes || 60) * 60
  );
  const [finalScorePercent, setFinalScorePercent] = useState<number>(0);

  // Live countdown timer while exam is running
  useEffect(() => {
    if (phase !== "running") return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Auto-submit when countdown time expires
  useEffect(() => {
    if (phase === "running" && secondsRemaining === 0) {
      handleSubmitExam();
    }
  }, [secondsRemaining, phase]);

  if (!exam) {
    return (
      <MobileAppShell>
        <div className="p-6 text-center">
          <p className="text-sm font-bold text-slate-700">Exam not found.</p>
        </div>
      </MobileAppShell>
    );
  }

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleStartExam = () => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setSecondsRemaining(exam.durationMinutes * 60);
    setPhase("running");
  };

  const handleSelectOption = (qId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitExam = () => {
    const totalQuestions = exam.questions.length;
    let correctCount = 0;
    exam.questions.forEach((q) => {
      if (q.correctIndex !== undefined && selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });
    const computedPercent =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    setFinalScorePercent(computedPercent);
    completeBadgeExam(exam.id, computedPercent);
    setPhase("result");
  };

  const currentQuestion = exam.questions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(
    ((currentQuestionIdx + 1) / exam.questions.length) * 100
  );
  const passed = finalScorePercent >= exam.passingScorePercent;

  return (
    <MobileAppShell>
      <div className="flex-1 flex flex-col px-4 sm:px-5 pt-2 pb-6 animate-rise">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-3.5">
          <button
            type="button"
            onClick={() => {
              if (phase === "running") {
                setPhase("lobby");
              } else {
                router.push("/exams");
              }
            }}
            className="flex items-center gap-2 text-[#0F1E36] hover:text-[#182C4E] active:scale-[0.98] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-display text-base font-black tracking-tight">
              {phase === "running" ? "Exit to Lobby" : "All Exams"}
            </span>
          </button>

          {phase === "running" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 text-white text-xs font-mono font-extrabold tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] text-[10px] font-extrabold uppercase tracking-wider">
              Online Exam
            </span>
          )}
        </div>

        {/* PHASE 1: PRE-EXAM LOBBY */}
        {phase === "lobby" && (
          <div className="flex-1 flex flex-col justify-between space-y-3.5 animate-rise">
            <div className="space-y-3.5">
              {/* Hero Badge Card with FieldIcon */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
                <FieldIcon
                  field={exam.iconName || exam.title}
                  size={34}
                  boxed
                />

                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-[#0F1E36] leading-snug">
                    {exam.title}
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {linkedBadge
                      ? `Badge: ${linkedBadge.name}`
                      : "Skill Qualification Exam"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#0284C7] border border-[#D5E3F5] text-[10.5px] font-extrabold">
                      {exam.level}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] font-mono text-[10.5px] font-extrabold tabular-nums">
                      +{exam.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* 2×2 Metrics Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                  <div className="border-b border-slate-100 pb-2.5">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Duration
                    </span>
                    <span className="text-sm font-black text-[#0F1E36] mt-0.5 block tabular-nums">
                      {exam.durationMinutes} minutes
                    </span>
                  </div>

                  <div className="border-b border-slate-100 pb-2.5">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Questions
                    </span>
                    <span className="text-sm font-black text-[#0F1E36] mt-0.5 block tabular-nums">
                      {exam.totalQuestionsCount} MCQs
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Passing Score
                    </span>
                    <span className="text-sm font-black text-[#0F1E36] mt-0.5 block tabular-nums">
                      {exam.passingScorePercent}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Attempts
                    </span>
                    <span className="text-sm font-black text-[#0F1E36] mt-0.5 block tabular-nums">
                      {exam.attemptsUsed}/{exam.maxAttempts}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rules Bulleted Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <h3 className="text-xs font-black text-[#0F1E36]">
                  Assessment Rules &amp; Integrity:
                </h3>
                <ul className="space-y-1.5">
                  {exam.rules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-xs font-medium text-slate-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#0284C7] shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Assessment Notice Card */}
              <div className="p-3.5 rounded-xl bg-[#F0F6FF] border border-[#D5E3F5] flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#182C4E] leading-relaxed font-medium">
                  <span className="font-bold text-[#0F1E36]">
                    Interactive Assessment Ready:
                  </span>{" "}
                  Includes {exam.questions.length} representative MCQs for{" "}
                  <span className="font-semibold">{exam.title}</span> with
                  instant auto-grading and badge unlock celebration.
                </p>
              </div>
            </div>

            {/* Start Exam Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full h-11 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 active:scale-[0.98] text-white font-display font-black text-xs transition cursor-pointer"
              >
                Start Exam
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: INTERACTIVE TIMED MCQ RUNNER */}
        {phase === "running" && currentQuestion && (
          <div className="flex-1 flex flex-col justify-between space-y-3.5 animate-rise">
            <div className="space-y-3.5">
              {/* Progress Header */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#0F1E36] tabular-nums">
                    Question {currentQuestionIdx + 1} of {exam.questions.length}
                  </span>
                  <span className="text-[11px] font-bold text-[#0284C7] tabular-nums">
                    {answeredCount}/{exam.questions.length} Answered
                  </span>
                </div>
                <div className="w-full h-2 rounded-lg bg-[#F0F6FF] overflow-hidden border border-[#D5E3F5]">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-[#182C4E] to-[#0284C7] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Question Pills */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {exam.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIdx;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-extrabold active:scale-[0.98] transition tabular-nums cursor-pointer ${
                          isCurrent
                            ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white border border-[#2B4875]/60"
                            : isAnswered
                            ? "bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5]"
                            : "bg-[#F8FAFC] text-slate-500 border border-slate-200/80"
                        }`}
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F0F6FF] text-[#182C4E] border border-[#D5E3F5] flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4 text-[#0284C7]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0F1E36] leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                <div className="space-y-2">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const selected =
                      selectedAnswers[currentQuestion.id] === optIdx;
                    const optionLetter = String.fromCharCode(65 + optIdx);
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          handleSelectOption(currentQuestion.id, optIdx)
                        }
                        className={`w-full p-3.5 rounded-xl border text-left active:scale-[0.99] transition flex items-center gap-3 cursor-pointer ${
                          selected
                            ? "bg-[#F0F6FF] border-[#182C4E] ring-1 ring-[#182C4E]/20"
                            : "bg-white border-slate-200/90 hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                            selected
                              ? "bg-gradient-to-b from-[#182C4E] to-[#101F38] text-white"
                              : "bg-[#F8FAFC] text-slate-700 border border-slate-200"
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span
                          className={`text-xs font-semibold leading-snug ${
                            selected ? "text-[#0F1E36] font-bold" : "text-slate-700"
                          }`}
                        >
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigation & Submit Exam Footer */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() =>
                    setCurrentQuestionIdx((i) => Math.max(0, i - 1))
                  }
                  className="h-10 rounded-lg bg-white border border-slate-200/90 text-xs font-extrabold text-slate-700 disabled:opacity-40 active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                {currentQuestionIdx < exam.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIdx((i) =>
                        Math.min(exam.questions.length - 1, i + 1)
                      )
                    }
                    className="h-10 rounded-lg bg-[#0F1E36] hover:bg-[#182C4E] text-white text-xs font-extrabold active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleSubmitExam();
                    }}
                    className="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Finish &amp; Grade</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmitExam}
                className="w-full h-11 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 hover:opacity-95 active:scale-[0.98] text-white font-display font-black text-xs transition cursor-pointer"
              >
                Submit Exam ({answeredCount}/{exam.questions.length} Answered)
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: EXAM RESULT SUMMARY */}
        {phase === "result" && (
          <div className="flex-1 flex flex-col justify-between space-y-4 animate-rise">
            <div className="space-y-3.5">
              <div
                className={`p-5 rounded-xl border text-center space-y-2.5 shadow-xs ${
                  passed
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${
                    passed
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {passed ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      passed
                        ? "bg-emerald-200/80 text-emerald-950"
                        : "bg-amber-200/80 text-amber-950"
                    }`}
                  >
                    {passed
                      ? "Exam Passed · Badge Unlocked"
                      : "Below Passing Threshold"}
                  </span>
                  <h2 className="text-2xl font-black text-[#0F1E36] mt-1 tabular-nums">
                    {finalScorePercent}% Score
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Passing mark required: {exam.passingScorePercent}% ·{" "}
                    {passed
                      ? `+${exam.xpReward} XP Awarded`
                      : "Try again to unlock"}
                  </p>
                </div>
              </div>

              {/* Answer Breakdown */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-black text-[#182C4E] uppercase tracking-wider">
                  Question Review
                </h3>
                {exam.questions.map((q, idx) => {
                  const userPick = selectedAnswers[q.id];
                  const isCorrect = userPick === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200/90 text-xs space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#0F1E36]">
                          Q{idx + 1}. {q.question}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      {q.correctIndex !== undefined && (
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Correct Answer: {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStartExam}
                className="h-10 rounded-lg bg-white border border-slate-200/90 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Exam</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/exams")}
                className="h-10 rounded-lg bg-gradient-to-b from-[#182C4E] to-[#101F38] border border-[#2B4875]/60 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#7DD3FC]" />
                <span>All Exams</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileAppShell>
  );
}
