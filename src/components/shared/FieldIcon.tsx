"use client";

import React from "react";
import { FieldIconKey } from "@/lib/types/erp";
import {
  // Existing
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

  // New Domain Icons
  Orbit,
  Microscope,
  Crown,
  Scale,
  ScrollText,
  Coins,
  Flame,
  Cloud,
  CircuitBoard,
  Scan,
  GitBranch,
  Layers,
  Kanban,
  HardDrive,
  Moon,
  Tent,
  Presentation,
  BookOpenCheck,
  MessageSquareQuote,
  HeartHandshake,
  Share2,
  Sliders,
  Compass,
  Radio,
  Leaf,
  Activity,
  Code2,
  Database,
  ShieldAlert,
  Smartphone,
  Trophy,
  LucideIcon,
} from "lucide-react";

export const FIELD_CATEGORIES = [
  "Software & Tech",
  "Science & Research",
  "Engineering & Hardware",
  "Club Activities & Events",
  "Leadership & Operations",
  "Soft Skills & Community",
  "Creative & Media",
] as const;

export type FieldCategory = (typeof FIELD_CATEGORIES)[number];

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
  // ==========================================
  // 1. Software & Tech (Coding & Hard Tech)
  // ==========================================
  {
    key: "python",
    label: "Python & Scientific Computing",
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
    key: "competitive-programming",
    label: "Competitive Programming & ICPC",
    category: "Software & Tech",
    gradient: "from-[#3D2505] to-[#241502]",
    accent: "#F59E0B",
    bgTint: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-300",
    code: "CP",
    icon: Code2,
  },
  {
    key: "web-dev",
    label: "Web & Full-Stack Engineering",
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
    key: "mobile-dev",
    label: "Mobile App Engineering",
    category: "Software & Tech",
    gradient: "from-[#161C4A] to-[#0D1130]",
    accent: "#6366F1",
    bgTint: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-300",
    code: "MD",
    icon: Smartphone,
  },
  {
    key: "data",
    label: "Data Science & Statistical Modeling",
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
    key: "deep-learning",
    label: "Deep Learning & Transformers",
    category: "Software & Tech",
    gradient: "from-[#321147] to-[#1E092C]",
    accent: "#A855F7",
    bgTint: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    code: "DL",
    icon: Layers,
  },
  {
    key: "computer-vision",
    label: "Computer Vision & OpenCV",
    category: "Software & Tech",
    gradient: "from-[#08303B] to-[#041C24]",
    accent: "#06B6D4",
    bgTint: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-300",
    code: "CV",
    icon: Scan,
  },
  {
    key: "cybersecurity",
    label: "Cybersecurity & Network Defense",
    category: "Software & Tech",
    gradient: "from-[#4D1515] to-[#2E0B0B]",
    accent: "#EF4444",
    bgTint: "bg-rose-50",
    textColor: "text-rose-600",
    borderColor: "border-rose-200",
    code: "CS",
    icon: ShieldCheck,
  },
  {
    key: "cloud-devops",
    label: "Cloud Architecture & DevOps",
    category: "Software & Tech",
    gradient: "from-[#082845] to-[#041628]",
    accent: "#0284C7",
    bgTint: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
    code: "CD",
    icon: Cloud,
  },
  {
    key: "database-sql",
    label: "Databases & Data Engineering",
    category: "Software & Tech",
    gradient: "from-[#093330] to-[#051F1D]",
    accent: "#14B8A6",
    bgTint: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-300",
    code: "DB",
    icon: Database,
  },
  {
    key: "git-open-source",
    label: "Git & Open-Source Collaboration",
    category: "Software & Tech",
    gradient: "from-[#451230] to-[#29091C]",
    accent: "#EC4899",
    bgTint: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-300",
    code: "OS",
    icon: GitBranch,
  },

  // ==========================================
  // 2. Science & Research (Pure STEM)
  // ==========================================
  {
    key: "astronomy",
    label: "Astronomy & Stargazing",
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
    key: "astrophysics",
    label: "Astrophysics & Cosmology",
    category: "Science & Research",
    gradient: "from-[#072445] to-[#031326]",
    accent: "#38BDF8",
    bgTint: "bg-sky-50",
    textColor: "text-sky-600",
    borderColor: "border-sky-300",
    code: "AP",
    icon: Orbit,
  },
  {
    key: "quantum",
    label: "Quantum Physics & Computing",
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
    label: "Chemistry & Molecular Synthesis",
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
    label: "Biotechnology & Bioinformatics",
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
    key: "genetics",
    label: "Genetics & Molecular Biology",
    category: "Science & Research",
    gradient: "from-[#083626] to-[#042016]",
    accent: "#10B981",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    code: "GN",
    icon: Microscope,
  },
  {
    key: "mathematics",
    label: "Mathematics & Analytical Modeling",
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
    label: "Optics & Laser Photonics",
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
    key: "spectroscopy",
    label: "Spectroscopy & Crystallography",
    category: "Science & Research",
    gradient: "from-[#2E0F4F] to-[#1A082E]",
    accent: "#9333EA",
    bgTint: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    code: "SP",
    icon: Radio,
  },
  {
    key: "neuroscience",
    label: "Neuroscience & Cognitive Science",
    category: "Science & Research",
    gradient: "from-[#063324] to-[#031F15]",
    accent: "#059669",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    code: "NS",
    icon: Activity,
  },
  {
    key: "microbiology",
    label: "Microbiology & Bio-Lab Techniques",
    category: "Science & Research",
    gradient: "from-[#083B1A] to-[#042410]",
    accent: "#16A34A",
    bgTint: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    code: "MB",
    icon: Microscope,
  },
  {
    key: "renewable-energy",
    label: "Solar & Renewable Energy",
    category: "Science & Research",
    gradient: "from-[#423205] to-[#261D02]",
    accent: "#EAB308",
    bgTint: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
    code: "RE",
    icon: SunMedium,
  },
  {
    key: "environmental-science",
    label: "Earth & Climate Science",
    category: "Science & Research",
    gradient: "from-[#093B18] to-[#05240E]",
    accent: "#22C55E",
    bgTint: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-300",
    code: "ES",
    icon: Leaf,
  },
  {
    key: "scientific-writing",
    label: "LaTeX & Scientific Publishing",
    category: "Science & Research",
    gradient: "from-[#1F2937] to-[#111827]",
    accent: "#94A3B8",
    bgTint: "bg-slate-100",
    textColor: "text-slate-800",
    borderColor: "border-slate-300",
    code: "LX",
    icon: FileText,
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

  // ==========================================
  // 3. Engineering & Hardware (Hard Skills)
  // ==========================================
  {
    key: "arduino",
    label: "Arduino & Microcontrollers",
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
    label: "Robotics & Autonomous Systems",
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
    label: "Electronics & Circuit Design",
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
    key: "circuit-design",
    label: "PCB Routing & KiCad Hardware",
    category: "Engineering & Hardware",
    gradient: "from-[#073826] to-[#032116]",
    accent: "#059669",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    code: "CD",
    icon: CircuitBoard,
  },
  {
    key: "printing",
    label: "3D Printing & Rapid Prototyping",
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
    key: "cad-modeling",
    label: "Parametric CAD & Fusion 360",
    category: "Engineering & Hardware",
    gradient: "from-[#3D1E05] to-[#261202]",
    accent: "#F97316",
    bgTint: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    code: "CA",
    icon: Compass,
  },
  {
    key: "mechanics",
    label: "Mechanics & Structural Prototyping",
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
    key: "iot-embedded",
    label: "Embedded Systems & ESP32",
    category: "Engineering & Hardware",
    gradient: "from-[#092B47] to-[#051A2C]",
    accent: "#0284C7",
    bgTint: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
    code: "EM",
    icon: HardDrive,
  },
  {
    key: "sensors-telemetry",
    label: "Sensors & Real-Time Telemetry",
    category: "Engineering & Hardware",
    gradient: "from-[#0E284A] to-[#08182D]",
    accent: "#3B82F6",
    bgTint: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    code: "ST",
    icon: Radio,
  },
  {
    key: "energy",
    label: "Power Systems & Energy Harvesting",
    category: "Engineering & Hardware",
    gradient: "from-[#45360A] to-[#292006]",
    accent: "#EAB308",
    bgTint: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    code: "EN",
    icon: SunMedium,
  },

  // ==========================================
  // 4. Club Activities & Workshops
  // ==========================================
  {
    key: "hackathon",
    label: "Hackathons & Sprint Build",
    category: "Club Activities & Events",
    gradient: "from-[#470D1F] to-[#290711]",
    accent: "#F43F5E",
    bgTint: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-300",
    code: "HK",
    icon: Flame,
  },
  {
    key: "stargazing",
    label: "Stargazing & Astro-Camp Expeditions",
    category: "Club Activities & Events",
    gradient: "from-[#091B38] to-[#040D1D]",
    accent: "#38BDF8",
    bgTint: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
    code: "SG",
    icon: Moon,
  },
  {
    key: "science-fair",
    label: "Science Fair & Public Outreach",
    category: "Club Activities & Events",
    gradient: "from-[#261047] to-[#150829]",
    accent: "#8B5CF6",
    bgTint: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    code: "SF",
    icon: Tent,
  },
  {
    key: "seminar-hosting",
    label: "Academic Seminars & Keynotes",
    category: "Club Activities & Events",
    gradient: "from-[#0A2645] to-[#051629]",
    accent: "#0284C7",
    bgTint: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
    code: "SM",
    icon: Presentation,
  },
  {
    key: "journal-club",
    label: "Journal Club & Paper Review",
    category: "Club Activities & Events",
    gradient: "from-[#093631] to-[#041F1C]",
    accent: "#0D9488",
    bgTint: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-300",
    code: "JC",
    icon: BookOpenCheck,
  },
  {
    key: "science-olympiad",
    label: "Science Olympiads & Contests",
    category: "Club Activities & Events",
    gradient: "from-[#3D2C04] to-[#241A02]",
    accent: "#EAB308",
    bgTint: "bg-amber-50",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    code: "SO",
    icon: Trophy,
  },
  {
    key: "field-trip",
    label: "Scientific Field Expeditions",
    category: "Club Activities & Events",
    gradient: "from-[#083623] to-[#041F14]",
    accent: "#10B981",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    code: "FT",
    icon: Compass,
  },

  // ==========================================
  // 5. Leadership & Operations
  // ==========================================
  {
    key: "club-presidency",
    label: "Club Presidency & Bureau",
    category: "Leadership & Operations",
    gradient: "from-[#422C05] to-[#261A02]",
    accent: "#F59E0B",
    bgTint: "bg-amber-50",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    code: "PR",
    icon: Crown,
  },
  {
    key: "leadership",
    label: "Department & Team Leadership",
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
    key: "legal-charter",
    label: "Internal Law & Governance",
    category: "Leadership & Operations",
    gradient: "from-[#3D2205] to-[#241402]",
    accent: "#D97706",
    bgTint: "bg-amber-50",
    textColor: "text-amber-800",
    borderColor: "border-amber-300",
    code: "LC",
    icon: Scale,
  },
  {
    key: "treasury-finance",
    label: "Treasury & Budget Management",
    category: "Leadership & Operations",
    gradient: "from-[#083621] to-[#041F13]",
    accent: "#10B981",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    code: "TF",
    icon: Coins,
  },
  {
    key: "project-management",
    label: "Project Management & Agile Sprints",
    category: "Leadership & Operations",
    gradient: "from-[#0C294D] to-[#061830]",
    accent: "#3B82F6",
    bgTint: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    code: "PM",
    icon: Kanban,
  },
  {
    key: "partnership-sponsorship",
    label: "Corporate & Academic Partnerships",
    category: "Leadership & Operations",
    gradient: "from-[#083626] to-[#042016]",
    accent: "#059669",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    code: "PS",
    icon: Handshake,
  },
  {
    key: "sponsorship",
    label: "Sponsorship & Fundraising",
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
    key: "entrepreneurship",
    label: "Innovation & Tech Ventures",
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
  {
    key: "crisis-management",
    label: "Crisis Management & Safety Protocols",
    category: "Leadership & Operations",
    gradient: "from-[#420C1C] to-[#26060F]",
    accent: "#E11D48",
    bgTint: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-300",
    code: "CM",
    icon: ShieldAlert,
  },

  // ==========================================
  // 6. Soft Skills & Community
  // ==========================================
  {
    key: "public-speaking",
    label: "Public Speaking & Pitch Defense",
    category: "Soft Skills & Community",
    gradient: "from-[#45300B] to-[#291C06]",
    accent: "#D97706",
    bgTint: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    code: "PS",
    icon: Mic,
  },
  {
    key: "debate-speech",
    label: "Scientific Debate & Dialectics",
    category: "Soft Skills & Community",
    gradient: "from-[#261047] to-[#150829]",
    accent: "#8B5CF6",
    bgTint: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    code: "DS",
    icon: MessageSquareQuote,
  },
  {
    key: "peer-mentorship",
    label: "Peer Mentorship & Buddying",
    category: "Soft Skills & Community",
    gradient: "from-[#420E2C] to-[#260719]",
    accent: "#EC4899",
    bgTint: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-300",
    code: "PM",
    icon: HeartHandshake,
  },
  {
    key: "science-communication",
    label: "Science Vulgarisation & Articles",
    category: "Soft Skills & Community",
    gradient: "from-[#082845] to-[#041628]",
    accent: "#0284C7",
    bgTint: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
    code: "SC",
    icon: Share2,
  },
  {
    key: "team-collaboration",
    label: "Inter-Department Teamwork",
    category: "Soft Skills & Community",
    gradient: "from-[#083626] to-[#042016]",
    accent: "#10B981",
    bgTint: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-300",
    code: "TC",
    icon: Users,
  },
  {
    key: "negotiation-diplomacy",
    label: "Diplomacy & Conflict Mediation",
    category: "Soft Skills & Community",
    gradient: "from-[#161C4A] to-[#0D1130]",
    accent: "#6366F1",
    bgTint: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-300",
    code: "ND",
    icon: Scale,
  },

  // ==========================================
  // 7. Creative & Media
  // ==========================================
  {
    key: "ui-ux",
    label: "UI/UX & Product Design",
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
    label: "Photography & Studio Production",
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
    label: "Cinematography & Video Motion",
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
  {
    key: "stage-sound-lighting",
    label: "Amphitheatre Sound & Lighting",
    category: "Creative & Media",
    gradient: "from-[#072F47] to-[#031B2A]",
    accent: "#0EA5E9",
    bgTint: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-300",
    code: "SL",
    icon: Sliders,
  },
  {
    key: "scientific-illustration",
    label: "Scientific Illustration & Posters",
    category: "Creative & Media",
    gradient: "from-[#420E2C] to-[#260719]",
    accent: "#EC4899",
    bgTint: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-300",
    code: "SI",
    icon: Sparkles,
  },
];

export function resolveFieldKey(raw?: string): FieldIconKey {
  if (!raw) return "python";
  const r = raw.trim().toLowerCase();

  // Direct match with any registered key
  const directMatch = ALL_FIELD_ICONS.find((f) => f.key === r);
  if (directMatch) return directMatch.key;

  // Specific multi-word matching
  if (r.includes("deep learn") || r.includes("transformer") || r.includes("llm")) return "deep-learning";
  if (r.includes("competit") || r.includes("icpc") || r.includes("leetcode") || r.includes("codeforces"))
    return "competitive-programming";
  if (r.includes("computer vision") || r.includes("opencv") || r.includes("yolo") || r.includes("object detect"))
    return "computer-vision";
  if (r.includes("mobile") || r.includes("android") || r.includes("flutter") || r.includes("ios") || r.includes("react native"))
    return "mobile-dev";
  if (r.includes("cloud") || r.includes("devops") || r.includes("docker") || r.includes("kubernetes") || r.includes("k8s") || r.includes("server"))
    return "cloud-devops";
  if (r.includes("database") || r.includes("sql") || r.includes("postgres") || r.includes("mongodb"))
    return "database-sql";
  if (r.includes("git") || r.includes("open-source") || r.includes("github") || r.includes("gitlab"))
    return "git-open-source";

  // Activities & Workshops
  if (r.includes("hackathon") || r.includes("code sprint") || r.includes("48h")) return "hackathon";
  if (r.includes("stargaz") || r.includes("astro-camp") || r.includes("night sky") || r.includes("telescope camp"))
    return "stargazing";
  if (r.includes("science fair") || r.includes("expo") || r.includes("booth") || r.includes("outreach") || r.includes("busking"))
    return "science-fair";
  if (r.includes("seminar") || r.includes("keynote") || r.includes("lecture") || r.includes("symposium") || r.includes("colloquium"))
    return "seminar-hosting";
  if (r.includes("journal club") || r.includes("paper review") || r.includes("literature review"))
    return "journal-club";
  if (r.includes("olympiad") || r.includes("contest") || r.includes("tournament")) return "science-olympiad";
  if (r.includes("field trip") || r.includes("expedition") || r.includes("excursion") || r.includes("visit"))
    return "field-trip";

  // Leadership & Governance
  if (r.includes("president") || r.includes("presidency") || r.includes("executive bureau")) return "club-presidency";
  if (r.includes("internal law") || r.includes("charter") || r.includes("statute") || r.includes("legal") || r.includes("bylaw"))
    return "legal-charter";
  if (r.includes("treasur") || r.includes("budget") || r.includes("finance") || r.includes("grant") || r.includes("fund"))
    return "treasury-finance";
  if (r.includes("project manage") || r.includes("kanban") || r.includes("scrum") || r.includes("sprint"))
    return "project-management";
  if (r.includes("crisis") || r.includes("safety protocol") || r.includes("emergency")) return "crisis-management";
  if (r.includes("partnership") || r.includes("mou") || r.includes("institutional")) return "partnership-sponsorship";
  if (r.includes("sponsor") || r.includes("fundrais")) return "sponsorship";
  if (r.includes("innov") || r.includes("venture") || r.includes("startup") || r.includes("incubat")) return "entrepreneurship";
  if (r.includes("lead") || r.includes("head") || r.includes("co-manager") || r.includes("manager")) return "leadership";
  if (r.includes("logist") || r.includes("supply") || r.includes("pack")) return "logistics";
  if (r.includes("doc") || r.includes("archive") || r.includes("record")) return "documentation";
  if (r.includes("event") || r.includes("staging") || r.includes("operat")) return "event-ops";

  // Soft Skills & Community
  if (r.includes("debate") || r.includes("dialectic") || r.includes("rhetoric") || r.includes("discourse"))
    return "debate-speech";
  if (r.includes("mentor") || r.includes("buddy") || r.includes("tutor") || r.includes("guidance"))
    return "peer-mentorship";
  if (r.includes("vulgaris") || r.includes("popularis") || r.includes("journalism") || r.includes("science comm"))
    return "science-communication";
  if (r.includes("synergy") || r.includes("teamwork") || r.includes("collaborat")) return "team-collaboration";
  if (r.includes("diplomacy") || r.includes("conflict") || r.includes("negotiat") || r.includes("mediat"))
    return "negotiation-diplomacy";
  if (r.includes("speak") || r.includes("pitch") || r.includes("presentation") || r.includes("mic")) return "public-speaking";

  // STEM & Science
  if (r.includes("astrophys") || r.includes("cosmolog") || r.includes("black hole") || r.includes("exoplanet"))
    return "astrophysics";
  if (r.includes("astro") || r.includes("telescope") || r.includes("space") || r.includes("orbit")) return "astronomy";
  if (r.includes("spectro") || r.includes("xrd") || r.includes("ftir") || r.includes("raman") || r.includes("crystallograph"))
    return "spectroscopy";
  if (r.includes("neuro") || r.includes("bci") || r.includes("cognitive")) return "neuroscience";
  if (r.includes("microbio") || r.includes("bacteria") || r.includes("cell culture")) return "microbiology";
  if (r.includes("gene") || r.includes("dna") || r.includes("crispr") || r.includes("bioinfo")) return "genetics";
  if (r.includes("biotech") || r.includes("bio")) return "biotech";
  if (r.includes("quantum") || r.includes("qubit")) return "quantum";
  if (r.includes("solar") || r.includes("photovolt") || r.includes("clean energy") || r.includes("renewable"))
    return "renewable-energy";
  if (r.includes("climate") || r.includes("environment") || r.includes("ecolog") || r.includes("earth"))
    return "environmental-science";
  if (r.includes("latex") || r.includes("paper") || r.includes("publish") || r.includes("scientific writing"))
    return "scientific-writing";
  if (r.includes("optic") || r.includes("laser") || r.includes("photon")) return "optics";
  if (r.includes("mater") || r.includes("nano") || r.includes("solid state")) return "materials";
  if (r.includes("chem") || r.includes("flask") || r.includes("reagent") || r.includes("lab safety") || r.includes("safety"))
    return "chemistry";
  if (r.includes("math") || r.includes("algebra") || r.includes("calculus") || r.includes("sigma") || r.includes("model"))
    return "mathematics";
  if (r.includes("health") || r.includes("biophys") || r.includes("med")) return "health";

  // Engineering & Hardware
  if (r.includes("pcb") || r.includes("kicad") || r.includes("circuit") || r.includes("routing") || r.includes("solder"))
    return "circuit-design";
  if (r.includes("cad") || r.includes("fusion") || r.includes("solidworks") || r.includes("parametric"))
    return "cad-modeling";
  if (r.includes("embedded") || r.includes("esp32") || r.includes("stm32") || r.includes("microcontroller") || r.includes("rtos") || r.includes("firmware"))
    return "iot-embedded";
  if (r.includes("sensor") || r.includes("telemetry") || r.includes("transducer") || r.includes("daq"))
    return "sensors-telemetry";
  if (r.includes("arduino")) return "arduino";
  if (r.includes("robot") || r.includes("bot") || r.includes("mechatron") || r.includes("rover") || r.includes("drone"))
    return "robotics";
  if (r.includes("3d") || r.includes("print") || r.includes("slic")) return "printing";
  if (r.includes("elec") || r.includes("chip") || r.includes("hardware")) return "electronics";
  if (r.includes("mech") || r.includes("motor") || r.includes("gear")) return "mechanics";
  if (r.includes("energy") || r.includes("power")) return "energy";

  // Creative & Media
  if (r.includes("sound") || r.includes("light") || r.includes("amphi") || r.includes("acoust"))
    return "stage-sound-lighting";
  if (r.includes("illustrat") || r.includes("infograph") || r.includes("poster") || r.includes("vector"))
    return "scientific-illustration";
  if (r.includes("ui") || r.includes("ux") || r.includes("figma") || r.includes("interface")) return "ui-ux";
  if (r.includes("photo") || r.includes("camera") || r.includes("studio")) return "media-photo";
  if (r.includes("video") || r.includes("film") || r.includes("cinema") || r.includes("motion")) return "video";
  if (r.includes("audio") || r.includes("podcast")) return "audiovisual";

  // Coding general fallbacks
  if (r.includes("python") || r.includes("code") || r.includes("program") || r.includes("script")) return "python";
  if (r.includes("ai") || r.includes("neural") || r.includes("brain")) return "ai-ml";
  if (r.includes("data") || r.includes("stat")) return "data";
  if (r.includes("cyber") || r.includes("sec") || r.includes("hack")) return "cybersecurity";
  if (r.includes("web") || r.includes("app")) return "web-dev";

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
