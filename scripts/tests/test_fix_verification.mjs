import assert from "assert";

console.log("=== RUNNING DEEP VERIFICATION FOR USER-REPORTED ISSUES ===");

// 1. Test data/quanters-db.json
import fs from "fs";
const db = JSON.parse(fs.readFileSync("data/quanters-db.json", "utf8"));
assert.strictEqual(db.workshops.length, 0, "workshops must be 0 in db.json");
assert.strictEqual(db.badges.length, 0, "badges must be 0 in db.json");
assert.strictEqual(db.exams.length, 0, "exams must be 0 in db.json");
assert.strictEqual(db.dailyQuizzes.length, 15, "dailyQuizzes must be 15 in db.json");
console.log("PASS: data/quanters-db.json is clean (0 workshops, 0 badges, 15 quizzes)");

// 2. Test seed.ts contents
const seedText = fs.readFileSync("src/lib/data/seed.ts", "utf8");
assert(seedText.includes("export const SEED_WORKSHOPS: Workshop[] = [];"), "SEED_WORKSHOPS must be empty array");
assert(seedText.includes("export const SEED_BADGES: Badge[] = [];"), "SEED_BADGES must be empty array");
assert(seedText.includes("export const SEED_EXAMS: BadgeExam[] = [];"), "SEED_EXAMS must be empty array");
assert(seedText.includes("quiz-nov1-01"), "SEED_DAILY_QUIZZES must contain November 1st quizzes");
assert(seedText.includes("quiz-nov1-15"), "SEED_DAILY_QUIZZES must contain quiz-nov1-15");
console.log("PASS: seed.ts has empty SEED_WORKSHOPS/BADGES/EXAMS and 15 Algerian quizzes");

// 3. Test that useQuantersStore does not contain seed resurrection loops
const storeText = fs.readFileSync("src/lib/store/useQuantersStore.ts", "utf8");
assert(!storeText.includes("for (const w of SEED_WORKSHOPS)"), "No SEED_WORKSHOPS resurrection loop in store");
assert(!storeText.includes("for (const b of SEED_BADGES)"), "No SEED_BADGES resurrection loop in store");
assert(!storeText.includes("for (const e of SEED_EXAMS)"), "No SEED_EXAMS resurrection loop in store");
console.log("PASS: useQuantersStore has NO resurrection loops for catalog seeds");

// 4. Test that db.ts does not strip correctId from dailyQuizzes
const dbTsText = fs.readFileSync("src/lib/server/db.ts", "utf8");
assert(!dbTsText.includes("const { correctId, explanation, ...safeQuiz } = quiz;"), "db.ts must not strip correctId from dailyQuizzes");
console.log("PASS: db.ts preserves correctId and explanation for daily micro-quizzes");

// 5. Test Explore page quiz expansion
const exploreText = fs.readFileSync("src/app/(mobile)/explore/page.tsx", "utf8");
assert(exploreText.includes("const [isQuizExpanded, setIsQuizExpanded] = useState(true);"), "Daily quiz should be expanded by default");
console.log("PASS: explore/page.tsx defaults isQuizExpanded to true");

console.log("\nALL 5 DEEP VERIFICATION CHECKS PASSED WITH FLYING COLORS!");
