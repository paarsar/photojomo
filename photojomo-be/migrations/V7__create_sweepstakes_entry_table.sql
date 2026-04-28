-- ── sweepstakes_entry ─────────────────────────────────────────────────────

CREATE TABLE sweepstakes_entry (
    id                   VARCHAR(39)              NOT NULL,
    first_name           VARCHAR(100)             NOT NULL,
    last_name            VARCHAR(100)             NOT NULL,
    email                VARCHAR(255)             NOT NULL,
    phone_number         VARCHAR(30)              NOT NULL,
    address              TEXT                     NOT NULL,
    city                 VARCHAR(100)             NOT NULL,
    state_province       VARCHAR(100)             NOT NULL,
    zip_postal_code      VARCHAR(20)              NOT NULL,
    country_of_residence VARCHAR(100)             NOT NULL,
    content_type         TEXT,
    agreed_to_rules      BOOLEAN                  NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT pk_sweepstakes_entry PRIMARY KEY (id)
);

CREATE INDEX idx_sweepstakes_entry_email ON sweepstakes_entry (email);
CREATE INDEX idx_sweepstakes_entry_created_at ON sweepstakes_entry (created_at);
