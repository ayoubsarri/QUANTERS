"use client";

import React from "react";
import { FieldIconKey } from "@/lib/types/erp";
import {
  Terminal,
  Cpu,
  Telescope,
  Box,
  BarChart3,
  Brain,
  ShieldCheck,
  Globe,
  Bot,
  Atom,
  FlaskConical,
  Dna,
  Binary,
  Palette,
  Camera,
  FileText,
  Mic,
  Users,
  Truck,
  Lightbulb,
  Zap,
  Eye,
  Gem,
  HeartPulse,
  SunMedium,
  Wrench,
  Handshake,
  BookOpen,
  CalendarCheck2,
  Video,
  Headphones,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export type FieldCategory =
  | "Software & Tech"
  | "Engineering & Hardware"
  | "Science & Research"
  | "Creative & Media"
  | "Leadership & Operations";

export interface FieldIconMeta {
  key: FieldIconKey;
  label: string;
  category: FieldCategory;
  gradient: string;
  accent: string;
  bgTint: string;
  textColor: string;
  borderColor: string;
  code: string;
  icon: LucideIcon;
}

export const ALL_FIELD_ICONS: FieldIconMeta[] = [
  // Software & Tech
  {
    key: "python",
    label: "Python & Coding",
    category: "Software & Tech",
    gradient: "from-[#0D382A] to-[#0A261D]",
    accent: "#10B981",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    code: "PY",
    icon: Terminal,
  },
  {
    key: "web-dev",
    label: "Web & Mobile Dev",
    category: "Software & Tech",
    gradient: "from-[#0E334D] to-[#081F30]",
    accent: "#0EA5E9",
    bgTint: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-200",
    code: "WD",
    icon: Globe,
  },
  {
    key: "data",
    label: "Data Science & Stats",
    category: "Software & Tech",
    gradient: "from-[#102C53] to-[#0A1B33]",
    accent: "#3B82F6",
    bgTint: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    code: "DS",
    icon: BarChart3,
  },
  {
    key: "ai-ml",
    label: "AI & Neural Networks",
    category: "Software & Tech",
    gradient: "from-[#2C184D] to-[#1A0E2E]",
    accent: "#8B5CF6",
    bgTint: "bg-purple-50",
    textColor: "text-purple-600",
    borderColor: "border-purple-200",
    code: "AI",
    icon: Brain,
  },
  {
    key: "cybersecurity",
    label: "Cybersecurity & Defense",
    category: "Software & Tech",
    gradient: "from-[#4D1515] to-[#2E0B0B]",
    accent: "#EF4444",
    bgTint: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    code: "CS",
    icon: ShieldCheck,
  },

  // Engineering & Hardware
  {
    key: "arduino",
    label: "Arduino & IoT",
    category: "Engineering & Hardware",
    gradient: "from-[#0E3838] to-[#082424]",
    accent: "#14B8A6",
    bgTint: "bg-teal-50",
    textColor: "text-teal-600",
    borderColor: "border-teal-200",
    code: "IO",
    icon: Cpu,
  },
  {
    key: "robotics",
    label: "Robotics & Automation",
    category: "Engineering & Hardware",
    gradient: "from-[#0F354D] to-[#0A2030]",
    accent: "#06B6D4",
    bgTint: "bg-cyan-50",
    textColor: "text-cyan-600",
    borderColor: "border-cyan-200",
    code: "RB",
    icon: Bot,
  },
  {
    key: "electronics",
    label: "Electronics & PCB",
    category: "Engineering & Hardware",
    gradient: "from-[#14324D] to-[#0C1E30]",
    accent: "#0284C7",
    bgTint: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
    code: "EL",
    icon: Zap,
  },
  {
    key: "printing",
    label: "3D Printing & CAD",
    category: "Engineering & Hardware",
    gradient: "from-[#4D330E] to-[#2E1E08]",
    accent: "#F59E0B",
    bgTint: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    code: "3D",
    icon: Box,
  },
  {
    key: "mechanics",
    label: "Mechanics & Structures",
    category: "Engineering & Hardware",
    gradient: "from-[#222E38] to-[#141C22]",
    accent: "#64748B",
    bgTint: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
    code: "MC",
    icon: Wrench,
  },
  {
    key: "energy",
    label: "Renewable Energy & Power",
    category: "Engineering & Hardware",
    gradient: "from-[#45360A] to-[#292006]",
    accent: "#EAB308",
    bgTint: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    code: "EN",
    icon: SunMedium,
  },

  // Science & Research
  {
    key: "astronomy",
    label: "Astronomy & Astrophysics",
    category: "Science & Research",
    gradient: "from-[#191C4D] to-[#0E102E]",
    accent: "#6366F1",
    bgTint: "bg-indigo-50",
    textColor: "text-indigo-600",
    borderColor: "border-indigo-200",
    code: "AS",
    icon: Telescope,
  },
  {
    key: "quantum",
    label: "Quantum Physics",
    category: "Science & Research",
    gradient: "from-[#28134D] to-[#180A2E]",
    accent: "#7C3AED",
    bgTint: "bg-violet-50",
    textColor: "text-violet-600",
    borderColor: "border-violet-200",
    code: "QT",
    icon: Atom,
  },
  {
    key: "chemistry",
    label: "Chemistry & Materials Lab",
    category: "Science & Research",
    gradient: "from-[#4D153A] to-[#2E0B22]",
    accent: "#EC4899",
    bgTint: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-200",
    code: "CH",
    icon: FlaskConical,
  },
  {
    key: "biotech",
    label: "Biotechnology & Genetics",
    category: "Science & Research",
    gradient: "from-[#23450E] to-[#142A08]",
    accent: "#84CC16",
    bgTint: "bg-lime-50",
    textColor: "text-lime-700",
    borderColor: "border-lime-200",
    code: "BT",
    icon: Dna,
  },
  {
    key: "mathematics",
    label: "Mathematics & Modeling",
    category: "Science & Research",
    gradient: "from-[#4D2D0E] to-[#2E1A08]",
    accent: "#F97316",
    bgTint: "bg-orange-50",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
    code: "MT",
    icon: Binary,
  },
  {
    key: "optics",
    label: "Optics & Photonics",
    category: "Science & Research",
    gradient: "from-[#0E3A4D] to-[#08222E]",
    accent: "#0891B2",
    bgTint: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-300",
    code: "OP",
    icon: Eye,
  },
  {
    key: "materials",
    label: "Materials Science & Nanotech",
    category: "Science & Research",
    gradient: "from-[#33302D] to-[#1E1C1A]",
    accent: "#78716C",
    bgTint: "bg-stone-100",
    textColor: "text-stone-700",
    borderColor: "border-stone-300",
    code: "MS",
    icon: Gem,
  },
  {
    key: "health",
    label: "Biophysics & Health Sciences",
    category: "Science & Research",
    gradient: "from-[#4D0F1F] to-[#2E0812]",
    accent: "#E11D48",
    bgTint: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    code: "HS",
    icon: HeartPulse,
  },
  {
    key: "scientific-writing",
    label: "LaTeX & Scientific Writing",
    category: "Science & Research",
    gradient: "from-[#1F2937] to-[#111827]",
    accent: "#94A3B8",
    bgTint: "bg-slate-100",
    textColor: "text-slate-800",
    borderColor: "border-slate-300",
    code: "LX",
    icon: FileText,
  },

  // Creative & Media
  {
    key: "ui-ux",
    label: "UI/UX & Visual Design",
    category: "Creative & Media",
    gradient: "from-[#47124D] to-[#2B0A2E]",
    accent: "#D946EF",
    bgTint: "bg-fuchsia-50",
    textColor: "text-fuchsia-600",
    borderColor: "border-fuchsia-200",
    code: "UX",
    icon: Palette,
  },
  {
    key: "media-photo",
    label: "Photography & Studio",
    category: "Creative & Media",
    gradient: "from-[#4D1525] to-[#2E0B15]",
    accent: "#F43F5E",
    bgTint: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    code: "MD",
    icon: Camera,
  },
  {
    key: "video",
    label: "Video Production & Motion",
    category: "Creative & Media",
    gradient: "from-[#35104D] to-[#1E092E]",
    accent: "#A855F7",
    bgTint: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    code: "VD",
    icon: Video,
  },
  {
    key: "audiovisual",
    label: "Audio Engineering & Podcasting",
    category: "Creative & Media",
    gradient: "from-[#2C104D] to-[#19092E]",
    accent: "#8B5CF6",
    bgTint: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    code: "AV",
    icon: Headphones,
  },

  // Leadership & Operations
  {
    key: "public-speaking",
    label: "Public Speaking & Pitching",
    category: "Leadership & Operations",
    gradient: "from-[#45300B] to-[#291C06]",
    accent: "#D97706",
    bgTint: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    code: "PS",
    icon: Mic,
  },
  {
    key: "leadership",
    label: "Leadership & Project Management",
    category: "Leadership & Operations",
    gradient: "from-[#423207] to-[#261D04]",
    accent: "#EAB308",
    bgTint: "bg-yellow-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200",
    code: "LD",
    icon: Users,
  },
  {
    key: "entrepreneurship",
    label: "Innovation & Startups",
    category: "Leadership & Operations",
    gradient: "from-[#472D0B] to-[#2B1B06]",
    accent: "#F59E0B",
    bgTint: "bg-amber-50",
    textColor: "text-amber-600",
    borderColor: "border-amber-200",
    code: "IN",
    icon: Lightbulb,
  },
  {
    key: "logistics",
    label: "Logistics & Supply Chain",
    category: "Leadership & Operations",
    gradient: "from-[#102D4D] to-[#0A1B2E]",
    accent: "#2563EB",
    bgTint: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    code: "LG",
    icon: Truck,
  },
  {
    key: "sponsorship",
    label: "Sponsorship & Partnerships",
    category: "Leadership & Operations",
    gradient: "from-[#0E3D2A] to-[#082419]",
    accent: "#059669",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    code: "SP",
    icon: Handshake,
  },
  {
    key: "documentation",
    label: "Documentation & Archives",
    category: "Leadership & Operations",
    gradient: "from-[#17204D] to-[#0E132E]",
    accent: "#4F46E5",
    bgTint: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    code: "DC",
    icon: BookOpen,
  },
  {
    key: "event-ops",
    label: "Event Staging & Operations",
    category: "Leadership & Operations",
    gradient: "from-[#11254D] to-[#0A162E]",
    accent: "#1D4ED8",
    bgTint: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    code: "EV",
    icon: CalendarCheck2,
  },
];

export function resolveFieldKey(raw?: string): FieldIconKey {
  if (!raw) return "python";
  const r = raw.toLowerCase();
  if (r.includes("astro") || r.includes("telescope") || r.includes("space")) return "astronomy";
  if (r.includes("python") || r.includes("code2") || r.includes("coding") || r.includes("script")) return "python";
  if (r.includes("arduino") || r.includes("iot")) return "arduino";
  if (r.includes("3d") || r.includes("print") || r.includes("cad")) return "printing";
  if (r.includes("data") || r.includes("chart") || r.includes("stat")) return "data";
  if (r.includes("ai") || r.includes("neural") || r.includes("brain") || r.includes("deep learn")) return "ai-ml";
  if (r.includes("cyber") || r.includes("shield") || r.includes("sec") || r.includes("hack")) return "cybersecurity";
  if (r.includes("web") || r.includes("app") || r.includes("frontend") || r.includes("backend")) return "web-dev";
  if (r.includes("robot") || r.includes("bot") || r.includes("mechatron")) return "robotics";
  if (r.includes("quantum") || r.includes("orbit") || r.includes("atom")) return "quantum";
  if (r.includes("chem") || r.includes("safety") || r.includes("flask") || r.includes("lab")) return "chemistry";
  if (r.includes("bio") || r.includes("dna") || r.includes("gene")) return "biotech";
  if (r.includes("math") || r.includes("sigma") || r.includes("algebra")) return "mathematics";
  if (r.includes("ui") || r.includes("ux") || r.includes("design") || r.includes("figma")) return "ui-ux";
  if (r.includes("media") || r.includes("photo") || r.includes("camera")) return "media-photo";
  if (r.includes("latex") || r.includes("research") || r.includes("writ") || r.includes("comm") || r.includes("paper"))
    return "scientific-writing";
  if (r.includes("speak") || r.includes("mic") || r.includes("pitch")) return "public-speaking";
  if (r.includes("lead") || r.includes("award") || r.includes("team") || r.includes("user")) return "leadership";
  if (r.includes("logist") || r.includes("pack") || r.includes("truck")) return "logistics";
  if (r.includes("innov") || r.includes("light") || r.includes("start") || r.includes("venture")) return "entrepreneurship";
  if (r.includes("elec") || r.includes("cpu") || r.includes("chip") || r.includes("circuit")) return "electronics";
  if (r.includes("optic") || r.includes("laser") || r.includes("lens") || r.includes("photon")) return "optics";
  if (r.includes("mater") || r.includes("nano") || r.includes("solid")) return "materials";
  if (r.includes("health") || r.includes("med") || r.includes("biophys") || r.includes("clinic")) return "health";
  if (r.includes("energy") || r.includes("solar") || r.includes("power") || r.includes("green")) return "energy";
  if (r.includes("mech") || r.includes("force") || r.includes("motor") || r.includes("gear")) return "mechanics";
  if (r.includes("sponsor") || r.includes("partner") || r.includes("fund")) return "sponsorship";
  if (r.includes("doc") || r.includes("archive")) return "documentation";
  if (r.includes("event") || r.includes("stage") || r.includes("operat")) return "event-ops";
  if (r.includes("video") || r.includes("film") || r.includes("motion") || r.includes("clip")) return "video";
  if (r.includes("audio") || r.includes("sound") || r.includes("podcast")) return "audiovisual";
  return "python";
}

interface FieldIconProps {
  field: FieldIconKey | string;
  size?: number;
  boxed?: boolean;
  className?: string;
  colored?: boolean;
}

export function FieldIcon({
  field,
  size = 24,
  boxed = false,
  className = "",
  colored = false,
}: FieldIconProps) {
  const key = resolveFieldKey(field);
  const meta = ALL_FIELD_ICONS.find((f) => f.key === key) || ALL_FIELD_ICONS[0];
  const IconComp = meta.icon || Sparkles;

  if (!boxed) {
    const colorClass = colored ? meta.textColor : "";
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${colorClass} ${className}`}
        style={{ width: size, height: size }}
      >
        <IconComp style={{ width: size, height: size }} strokeWidth={2} />
      </span>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-b ${meta.gradient} border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.18)] shrink-0 overflow-hidden group ${className}`}
      style={{ width: size + 16, height: size + 16 }}
      title={meta.label}
    >
      {/* Subtle ambient glow matching domain accent */}
      <div
        className="absolute inset-0 opacity-20 blur-sm pointer-events-none transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: meta.accent }}
      />
      <div className="relative z-10 transition-transform duration-200 group-hover:scale-110 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        <IconComp style={{ width: size, height: size }} strokeWidth={2.1} />
      </div>
    </div>
  );
}
