ALTER TABLE submission ADD COLUMN paypal_order_id VARCHAR(255);
CREATE UNIQUE INDEX idx_submission_paypal_order ON submission (paypal_order_id) WHERE paypal_order_id IS NOT NULL;
