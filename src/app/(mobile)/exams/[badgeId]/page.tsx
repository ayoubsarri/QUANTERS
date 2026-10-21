"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Sparkles,
} from "lucide-react";
import { MobileAppShell } from "@/components/mobile/MobileAppShell";
import { FieldIcon } from "@/components/shared/FieldIcon";
import { useQuantersStore } from "@/lib/store/useQuantersStore";

type ExamPhase = "lobby" | "running" | "result";

export default function BadgeExamPage() {
  const params = useParams<{ badgeId: string }>();
  const router = useRouter();
  const badgeId = params?.badgeId || "exam-astrophysics";

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
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

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
      if (selectedAnswers[q.id] === q.correctIndex) {
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
      <div className="flex-1 flex flex-col px-5 pt-2 pb-6 animate-rise">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              if (phase === "running") {
                setPhase("lobby");
              } else {
                router.push("/exams");
              }
            }}
            className="flex items-center gap-2 text-slate-900 hover:text-[#1D63EB] active:scale-[0.98] transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[18px] font-extrabold tracking-tight">
              {phase === "running" ? "Exit to Lobby" : "All Exams"}
            </span>
          </button>

          {phase === "running" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-extrabold tabular-nums shadow-xs">
              <Clock className="w-3.5 h-3.5 text-[#29D2FF]" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1D63EB] text-[10px] font-extrabold uppercase tracking-wider">
              Online Exam
            </span>
          )}
        </div>

        {/* PHASE 1: PRE-EXAM LOBBY */}
        {phase === "lobby" && (
          <div className="flex-1 flex flex-col justify-between space-y-4 animate-rise">
            <div className="space-y-4">
              {/* Hero Badge Card with FieldIcon */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_6px_24px_rgba(9,25,47,0.05)] flex items-center gap-4">
                <FieldIcon
                  field={exam.iconName || exam.title}
                  size={36}
                  boxed
                />

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-slate-900 leading-snug truncate">
                    {exam.title}
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {linkedBadge
                      ? `Badge: ${linkedBadge.name}`
                      : "Skill Qualification Exam"}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1D63B8] border border-sky-200/80 text-[11px] font-extrabold">
                      {exam.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-extrabold tabular-nums">
                      +{exam.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              {/* 2×2 Metrics Box */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_6px_24px_rgba(9,25,47,0.05)]">
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Duration
                    </span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block tabular-nums">
                      {exam.durationMinutes} minutes
                    </span>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Questions
                    </span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block tabular-nums">
                      {exam.totalQuestionsCount} MCQs
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Passing Score
                    </span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block tabular-nums">
                      {exam.passingScorePercent}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Attempts
                    </span>
                    <span className="text-sm font-black text-slate-900 mt-0.5 block tabular-nums">
                      {exam.attemptsUsed}/{exam.maxAttempts}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rules Bulleted Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_6px_24px_rgba(9,25,47,0.05)] space-y-2.5">
                <h3 className="text-xs font-black text-slate-900">
                  Assessment Rules &amp; Integrity:
                </h3>
                <ul className="space-y-2">
                  {exam.rules.map((rule, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 text-xs font-medium text-slate-600"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1D63EB] shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Assessment Notice Card */}
              <div className="p-4 rounded-3xl bg-blue-50/80 backdrop-blur-md border border-blue-200/70 flex items-start gap-3 shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#1D63EB] shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  <span className="font-bold text-slate-900">
                    Interactive Assessment Ready:
                  </span>{" "}
                  Includes {exam.questions.length} representative MCQs for{" "}
                  <span className="font-semibold">{exam.title}</span> with
                  instant auto-grading and badge unlock celebration.
                </p>
              </div>
            </div>

            {/* Full-Width Royal Blue Start Exam Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartExam}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:shadow-lg active:scale-[0.98] text-white font-black text-xs shadow-[0_6px_20px_rgba(29,99,235,0.35)] transition cursor-pointer"
              >
                Start Exam
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: INTERACTIVE TIMED MCQ RUNNER */}
        {phase === "running" && currentQuestion && (
          <div className="flex-1 flex flex-col justify-between space-y-4 animate-rise">
            <div className="space-y-4">
              {/* Progress Header */}
              <div className="p-4 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_6px_24px_rgba(9,25,47,0.05)] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-800 tabular-nums">
                    Question {currentQuestionIdx + 1} of {exam.questions.length}
                  </span>
                  <span className="text-[11px] font-bold text-[#1D63EB] tabular-nums">
                    {answeredCount}/{exam.questions.length} Answered
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950/20 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1D63EB] to-[#38E4FF] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Question Pills */}
                <div className="flex items-center gap-1.5 pt-1">
                  {exam.questions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQuestionIdx;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQuestionIdx(idx)}
                        className={`flex-1 py-1 rounded-full text-[11px] font-extrabold active:scale-[0.98] transition tabular-nums cursor-pointer ${
                          isCurrent
                            ? "bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white shadow-2xs"
                            : isAnswered
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        Q{idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Question Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_6px_24px_rgba(9,25,47,0.05)] space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-blue-50 text-[#1D63EB] border border-blue-200/60 flex items-center justify-center shrink-0 mt-0.5">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                <div className="space-y-2.5">
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
                        className={`w-full p-4 rounded-2xl border text-left active:scale-[0.99] transition flex items-center gap-3.5 cursor-pointer ${
                          selected
                            ? "bg-blue-50/90 border-[#1D63EB] ring-2 ring-[#1D63EB]/20 shadow-xs"
                            : "bg-white/80 backdrop-blur-md border-white/90 hover:bg-white hover:border-slate-300 shadow-2xs"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center shrink-0 ${
                            selected
                              ? "bg-[#1D63EB] text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 border border-slate-200/60"
                          }`}
                        >
                          {optionLetter}
                        </span>
                        <span
                          className={`text-xs font-semibold leading-snug ${
                            selected ? "text-slate-950 font-bold" : "text-slate-700"
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
            <div className="space-y-2.5 pt-2">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() =>
                    setCurrentQuestionIdx((i) => Math.max(0, i - 1))
                  }
                  className="h-11 rounded-full bg-white border border-slate-200 text-xs font-extrabold text-slate-700 disabled:opacity-40 active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
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
                    className="h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
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
                    className="h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold active:scale-[0.98] inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Finish &amp; Grade</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmitExam}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] hover:shadow-lg active:scale-[0.98] text-white font-black text-xs shadow-[0_6px_20px_rgba(29,99,235,0.35)] transition cursor-pointer"
              >
                Submit Exam ({answeredCount}/{exam.questions.length} Answered)
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: EXAM RESULT SUMMARY */}
        {phase === "result" && (
          <div className="flex-1 flex flex-col justify-between space-y-4 animate-rise">
            <div className="space-y-4">
              <div
                className={`p-6 rounded-3xl border text-center space-y-3 shadow-xl backdrop-blur-xl ${
                  passed
                    ? "bg-emerald-50/90 border-emerald-200"
                    : "bg-amber-50/90 border-amber-200"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                    passed
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {passed ? (
                    <Award className="w-7 h-7" />
                  ) : (
                    <AlertCircle className="w-7 h-7" />
                  )}
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      passed
                        ? "bg-emerald-200/80 text-emerald-950"
                        : "bg-amber-200/80 text-amber-950"
                    }`}
                  >
                    {passed
                      ? "Exam Passed · Badge Unlocked"
                      : "Below Passing Threshold"}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
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
              <div className="p-4 sm:p-5 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 shadow-[0_6px_24px_rgba(9,25,47,0.05)] space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Question Review
                </h3>
                {exam.questions.map((q, idx) => {
                  const userPick = selectedAnswers[q.id];
                  const isCorrect = userPick === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-2xl bg-white/80 border border-slate-200/70 text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800">
                          Q{idx + 1}. {q.question}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                            isCorrect
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Correct Answer: {q.options[q.correctIndex]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleStartExam}
                className="h-11 rounded-full bg-white border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Exam</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/exams")}
                className="h-11 rounded-full bg-gradient-to-r from-[#1D63EB] to-[#0A4CC7] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>All Exams</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileAppShell>
  );
}
