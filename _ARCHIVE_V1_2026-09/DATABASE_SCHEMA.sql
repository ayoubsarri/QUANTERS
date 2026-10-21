-- ============================================================================
-- QUANTERS ENTERPRISE RELATIONAL SCHEMA SPECIFICATION
-- Platform: QUANTERS Mobile Ecosystem & Admin Operations Platform (QAMP)
-- Institutional Owner: QUANTA Scientific Club (النادي العلمي كوانتا)
-- Affiliation: Faculty of Sciences, University of Algiers 1 Benyoucef Benkhedda
-- Database Engine: PostgreSQL 16+ with PostGIS & pgcrypto
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUM DEFINITIONS
-- ============================================================================

CREATE TYPE member_role_enum AS ENUM (
    'GUEST',           -- Unregistered / Guest browser
    'MEMBER',          -- Standard Quanter (Student)
    'OPERATIONS_LEAD', -- Active member on mission/project
    'CELL_LEAD',       -- Leader of a specialized cell (Logistics, Media, Tech, HR, etc.)
    'INSTRUCTOR',      -- Workshop/Session Instructor
    'BUREAU_MEMBER',   -- Executive Bureau (President, VP, Secretary General)
    'SUPER_ADMIN'      -- IT Platform Administrator
);

CREATE TYPE event_status_enum AS ENUM (
    'DRAFT',                -- Proposal in progress by organizer
    'SUBMITTED',            -- Submitted for review
    'UNDER_REVIEW',         -- Scientific & logistical evaluation
    'REVISIONS_REQUESTED',  -- Academic revisions required
    'APPROVED',             -- Bureau & academic approval granted
    'SCHEDULED',            -- Venue & amphitheatre reservation locked
    'REGISTRATION_OPEN',    -- Public portal open for seat reservation
    'ACTIVE_NOW',           -- Dynamic QR check-in window active
    'IN_RETRO',             -- Event concluded; feedback & reports underway
    'COMPLETED',            -- Reports validated; Sparks minted
    'ARCHIVED',             -- Formally sealed into Annual Activity Ledger
    'CANCELLED'             -- Cancelled due to force majeure
);

CREATE TYPE mission_status_enum AS ENUM (
    'DRAFT',                -- Task defined by cell lead
    'OPEN',                 -- Available for member application/matching
    'ASSIGNED',             -- Member matched via KYC-AMM algorithm
    'CONFIRMED',            -- Member confirmed operational slot
    'IN_PROGRESS',          -- On duty (QR check-in validated)
    'PENDING_VERIFICATION', -- Shift ended; deliverable/PoW submitted
    'VALIDATED',            -- Deliverable approved by cell lead
    'REWARDED',             -- Sparks & verified hours credited
    'NO_SHOW',              -- Absent without excuse (cooldown applied)
    'CANCELLED'             -- Mission cancelled by lead
);

CREATE TYPE assessment_path_enum AS ENUM (
    'PRACTICAL_PROJECT',    -- Track A: Workshop attendance + GitHub repo
    'TIMED_EXAM'            -- Track B: Proctored technical examination
);

CREATE TYPE assessment_status_enum AS ENUM (
    'ELIGIBLE',             -- Prerequisites cleared
    'SUBMITTED',            -- Project repo or exam answers uploaded
    'UNDER_REVIEW',         -- Code analysis / AST plagiarism screening
    'GRADING',              -- Double-blind peer rubric scoring
    'PASSED',               -- Scored >= threshold
    'REMEDIATE',            -- Eligible for 1 remediation attempt
    'FAILED',               -- Final failure (14-day study cooldown)
    'DISQUALIFIED',         -- AST plagiarism / cheating confirmed
    'CERTIFIED'             -- Cryptographic W3C Open Badge minted
);

-- ============================================================================
-- 2. CORE RELATIONAL TABLES
-- ============================================================================

-- Table 1: CELLS (Executive Cells & Scientific Divisions)
CREATE TABLE cells (
    cell_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) UNIQUE NOT NULL, -- 'SCI_CS', 'SCI_PHYS', 'SCI_BIO', 'LOGISTICS', 'MEDIA', 'TECH', 'HR'
    name_ar VARCHAR(128) NOT NULL,
    name_en VARCHAR(128) NOT NULL,
    description TEXT,
    is_scientific BOOLEAN DEFAULT FALSE,
    lead_member_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: MEMBERS (Students, Operations Cadres, Executives)
CREATE TABLE members (
    member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_matricule_masked VARCHAR(16) NOT NULL, -- e.g. '2023****849'
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    faculty VARCHAR(128) DEFAULT 'Faculty of Sciences',
    department VARCHAR(128) NOT NULL, -- 'Computer Science', 'Physics', 'Mathematics', 'Biology', 'Chemistry'
    academic_level VARCHAR(32) NOT NULL, -- 'L1', 'L2', 'L3', 'M1', 'M2', 'Doctorate'
    primary_cell_id UUID REFERENCES cells(cell_id) ON DELETE SET NULL,
    role member_role_enum DEFAULT 'MEMBER',
    
    -- Gamification & Engagement Metrics
    sparks_balance INT DEFAULT 0 CHECK (sparks_balance >= 0),
    level INT DEFAULT 1 CHECK (level BETWEEN 1 AND 30),
    active_streak_days INT DEFAULT 0 CHECK (active_streak_days >= 0),
    archimedes_shields INT DEFAULT 1 CHECK (archimedes_shields BETWEEN 0 AND 2),
    last_activity_date DATE,
    buddy_partner_id UUID REFERENCES members(member_id) ON DELETE SET NULL,
    
    -- Credited Operational Experience
    total_credited_hours NUMERIC(6, 2) DEFAULT 0.00 CHECK (total_credited_hours >= 0),
    is_exam_freeze BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cells ADD CONSTRAINT fk_cell_lead FOREIGN KEY (lead_member_id) 
    REFERENCES members(member_id) ON DELETE SET NULL;

-- Table 3: MEMBER_AVAILABILITY_SLOTS (Student KYC 5x9 Academic Timetable Grid)
CREATE TABLE member_availability_slots (
    slot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 4), -- 0 = Sunday, 4 = Thursday (Algerian University Week)
    start_time TIME NOT NULL, -- e.g. '08:00:00'
    end_time TIME NOT NULL,   -- e.g. '09:30:00'
    is_available BOOLEAN DEFAULT TRUE,
    is_recurring BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (member_id, day_of_week, start_time)
);

-- Table 4: EVENTS (Workshops, Hackathons, Scientific Symposia)
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'WORKSHOP', 'CONFERENCE', 'HACKATHON', 'CAMP', 'SOLIDARITY'
    abstract TEXT NOT NULL,
    division_code VARCHAR(32) NOT NULL, -- 'SCI_CS', 'SCI_PHYS', 'SCI_CHEM', 'SCI_MATH', 'SCI_BIO'
    target_audience VARCHAR(128) DEFAULT 'Students of Science & Technology',
    lead_organizer_id UUID NOT NULL REFERENCES members(member_id),
    cell_id UUID REFERENCES cells(cell_id),
    status event_status_enum DEFAULT 'DRAFT' NOT NULL,
    venue_name VARCHAR(128) NOT NULL, -- 'Amphi Ibn Badis', 'Amphi A', 'Amphi B', 'Lab 01'
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    waitlist_capacity INT DEFAULT 50,
    base_sparks INT DEFAULT 100 CHECK (base_sparks >= 0),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    deanship_approval_ref VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: SESSIONS (Multi-Session Breakdown & Projector TOTP Keys)
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    session_number INT NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    instructor_name VARCHAR(128) NOT NULL,
    instructor_member_id UUID REFERENCES members(member_id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    totp_secret_key VARCHAR(64) NOT NULL, -- 15s rotating dynamic TOTP QR seed
    is_kiosk_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: REGISTRATIONS (Student Workshop RSVPs & Waitlists)
CREATE TABLE registrations (
    registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'CONFIRMED' NOT NULL, -- 'CONFIRMED', 'WAITLISTED', 'CANCELLED'
    waitlist_position INT,
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, member_id)
);

-- Table 7: ATTENDANCE_RECORDS (Member Scans Dynamic Projector QR)
CREATE TABLE attendance_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    entry_scan_at TIMESTAMPTZ NOT NULL,
    exit_scan_at TIMESTAMPTZ,
    is_geofence_verified BOOLEAN DEFAULT TRUE,
    sparks_awarded INT DEFAULT 0,
    is_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, member_id)
);

-- Table 8: MISSION_TASKS (Institutional Operations Pool)
CREATE TABLE mission_tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(event_id) ON DELETE SET NULL,
    cell_id UUID NOT NULL REFERENCES cells(cell_id),
    creator_lead_id UUID NOT NULL REFERENCES members(member_id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    operational_domain VARCHAR(64) NOT NULL, -- 'LOGISTICS', 'MEDIA', 'TECH', 'PROTOCOL'
    required_slots INT DEFAULT 1 CHECK (required_slots > 0),
    filled_slots INT DEFAULT 0 CHECK (filled_slots >= 0),
    status mission_status_enum DEFAULT 'OPEN' NOT NULL,
    start_window TIMESTAMPTZ NOT NULL,
    end_window TIMESTAMPTZ NOT NULL,
    base_sparks INT DEFAULT 150 CHECK (base_sparks > 0),
    credited_hours NUMERIC(4, 2) DEFAULT 2.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 9: VOLUNTEER_ASSIGNMENTS (Member Operational Deliverables)
CREATE TABLE volunteer_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES mission_tasks(task_id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    status mission_status_enum DEFAULT 'ASSIGNED' NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMPTZ,
    checked_in_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,
    evaluator_lead_id UUID REFERENCES members(member_id),
    quality_score INT CHECK (quality_score BETWEEN 1 AND 5),
    evaluation_feedback TEXT,
    proof_of_work_uri VARCHAR(512),
    sparks_granted INT DEFAULT 0,
    hours_logged NUMERIC(4, 2) DEFAULT 0.00,
    is_buddy_paired BOOLEAN DEFAULT FALSE,
    UNIQUE (task_id, member_id)
);

-- Table 10: SKILL_BADGES (Competencies & Micro-Credentials)
CREATE TABLE skill_badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curating_cell_id UUID NOT NULL REFERENCES cells(cell_id),
    code VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    badge_level VARCHAR(32) DEFAULT 'INTERMEDIATE', -- 'FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'MASTERY'
    image_uri VARCHAR(512) NOT NULL,
    min_attendance_percentage NUMERIC(5, 2) DEFAULT 80.00,
    passing_score NUMERIC(5, 2) DEFAULT 70.00,
    json_ld_schema JSONB NOT NULL, -- W3C Open Badges v3.0 metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 11: BADGE_ASSESSMENTS (Assessments, Exams & Minted Credentials)
CREATE TABLE badge_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id UUID NOT NULL REFERENCES skill_badges(badge_id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(event_id) ON DELETE SET NULL,
    path assessment_path_enum NOT NULL,
    status assessment_status_enum DEFAULT 'ELIGIBLE' NOT NULL,
    
    -- Submissions (Track A)
    artifact_repo_url VARCHAR(512),
    live_demo_url VARCHAR(512),
    
    -- Anti-Cheat Metrics (AST Analysis)
    similarity_index NUMERIC(5, 2) DEFAULT 0.00,
    ast_fingerprint VARCHAR(128),
    integrity_cleared BOOLEAN DEFAULT FALSE,
    
    -- Grading
    evaluator_id UUID REFERENCES members(member_id),
    rubric_scores JSONB,
    final_score NUMERIC(5, 2),
    evaluated_at TIMESTAMPTZ,
    
    -- W3C Cryptographic Proof
    credential_uuid UUID UNIQUE,
    cryptographic_signature TEXT,
    issued_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (badge_id, member_id, event_id)
);

-- Table 12: LEAGUE_COHORTS & STANDINGS (30-Member Dunbar Cohorts)
CREATE TABLE league_cohorts (
    cohort_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_tier VARCHAR(32) NOT NULL, -- 'SUBATOMIC', 'ATOMIC', 'MOLECULAR', 'COSMIC', 'QUANTUM'
    week_start_date DATE NOT NULL,
    is_finalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE league_standings (
    standing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID NOT NULL REFERENCES league_cohorts(cohort_id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    sparks_earned_this_week INT DEFAULT 0,
    rank_position INT DEFAULT 30,
    final_status VARCHAR(16) DEFAULT 'SAFE', -- 'PROMOTED', 'SAFE', 'RELEGATED'
    UNIQUE(cohort_id, member_id)
);

-- Table 13: MOTM_CYCLES (Member of the Month Arbitrations & Awards)
CREATE TABLE motm_cycles (
    cycle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_month DATE NOT NULL, -- e.g. '2026-10-01'
    category VARCHAR(32) DEFAULT 'GLOBAL_MVP' NOT NULL, -- 'GLOBAL_MVP', 'RISING_STAR', 'CELL_LEAD'
    winner_member_id UUID REFERENCES members(member_id),
    composite_score NUMERIC(8, 4),
    citation_text TEXT,
    announced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cycle_month, category)
);

-- Table 14: AUDIT_LOGS (Immutable Governance Trail)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_name VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    performed_by UUID REFERENCES members(member_id),
    previous_state JSONB,
    new_state JSONB,
    logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TRIGGERS & BUSINESS LOGIC
-- ============================================================================

CREATE OR REPLACE FUNCTION trg_mission_reward_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'REWARDED' AND OLD.status != 'REWARDED' THEN
        UPDATE members
        SET total_credited_hours = total_credited_hours + NEW.hours_logged,
            sparks_balance = sparks_balance + NEW.sparks_granted,
            last_activity_date = CURRENT_DATE
        WHERE member_id = NEW.member_id;
        
        INSERT INTO audit_logs (entity_name, entity_id, action_type, performed_by, new_state)
        VALUES ('volunteer_assignments', NEW.assignment_id, 'REWARD_MINT', NEW.evaluator_lead_id, 
                json_build_object('hours', NEW.hours_logged, 'sparks', NEW.sparks_granted));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_mission_reward
AFTER UPDATE ON volunteer_assignments
FOR EACH ROW EXECUTE FUNCTION trg_mission_reward_sync();

-- ============================================================================
-- 4. PERFORMANCE & LOOKUP INDEXES
-- ============================================================================
CREATE INDEX idx_avail_day_time ON member_availability_slots(day_of_week, start_time) WHERE is_available = TRUE;
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_mission_tasks ON mission_tasks(status);
CREATE INDEX idx_members_streak ON members(active_streak_days) WHERE is_active = TRUE;
CREATE INDEX idx_motm_cycle ON motm_cycles(cycle_month, category);
