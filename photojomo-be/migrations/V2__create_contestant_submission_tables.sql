-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE category_enum AS ENUM (
    'general',
    'emerging_creator',
    'college_creator',
    'master_your_craft'
);

CREATE TYPE tier_enum AS ENUM (
    'explorer',
    'enthusiast',
    'visionary',
    'master'
);

CREATE TYPE payment_method_enum AS ENUM (
    'stripe',
    'paypal'
);

CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'paid',
    'failed'
);

-- ── contestant ────────────────────────────────────────────────────────────────

CREATE TABLE contestant (
    id                   VARCHAR(39)              NOT NULL,
    first_name           VARCHAR(100)             NOT NULL,
    last_name            VARCHAR(100)             NOT NULL,
    email                VARCHAR(255)             NOT NULL,
    country              VARCHAR(100)             NOT NULL,
    confirm_images_dates BOOLEAN                  NOT NULL DEFAULT FALSE,
    confirm_age          BOOLEAN                  NOT NULL DEFAULT FALSE,
    confirm_rules        BOOLEAN                  NOT NULL DEFAULT FALSE,
    marketing_consent    BOOLEAN                  NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT pk_contestant PRIMARY KEY (id)
);

CREATE UNIQUE INDEX idx_contestant_email ON contestant (email);

-- ── submission ────────────────────────────────────────────────────────────────

CREATE TABLE submission (
    id             VARCHAR(39)              NOT NULL,
    contestant_id  VARCHAR(39)              NOT NULL,
    category       category_enum            NOT NULL,
    tier           tier_enum                NOT NULL,
    amount_paid    DECIMAL(10,2)            NOT NULL,
    payment_method payment_method_enum      NOT NULL,
    payment_status payment_status_enum      NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT pk_submission      PRIMARY KEY (id),
    CONSTRAINT fk_submission_contestant FOREIGN KEY (contestant_id)
        REFERENCES contestant (id)
);

CREATE INDEX idx_submission_contestant ON submission (contestant_id);
CREATE UNIQUE INDEX idx_submission_category ON submission (contestant_id, category);

-- ── contest_entry ─────────────────────────────────────────────────────────────

CREATE TABLE contest_entry (
    id            VARCHAR(39)              NOT NULL,
    submission_id VARCHAR(39)              NOT NULL,
    uri           VARCHAR(500)             NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT pk_contest_entry          PRIMARY KEY (id),
    CONSTRAINT fk_contest_entry_submission FOREIGN KEY (submission_id)
        REFERENCES submission (id)
);

CREATE INDEX idx_contest_entry_submission ON contest_entry (submission_id);
