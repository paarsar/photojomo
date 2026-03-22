-- IDs are prefix (4 chars) + dash (1 char) + UUID (36 chars) = 41 chars
-- e.g. cnt-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

ALTER TABLE contestant   ALTER COLUMN id           TYPE VARCHAR(41);
ALTER TABLE submission   ALTER COLUMN id           TYPE VARCHAR(41);
ALTER TABLE submission   ALTER COLUMN contestant_id TYPE VARCHAR(41);
ALTER TABLE contest_entry ALTER COLUMN id           TYPE VARCHAR(41);
ALTER TABLE contest_entry ALTER COLUMN submission_id TYPE VARCHAR(41);
