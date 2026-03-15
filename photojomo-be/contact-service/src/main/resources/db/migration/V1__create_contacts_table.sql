CREATE TABLE contacts (
    id          VARCHAR(36)  NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(30),
    message     TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT pk_contacts PRIMARY KEY (id)
);

CREATE INDEX idx_contacts_email ON contacts (email);
