-- MySQL equivalent of the Laravel migrations for subscription_plans,
-- subscriptions, subscription_status_logs — plus the View / Trigger /
-- Stored Procedure for the subscription system.
-- Run after `php artisan migrate` has created the three tables.

-- ============================================================
-- VIEW: active_subscriptions_view
-- Joins user + plan + subscription for a single "who has what,
-- until when" read — used for admin/reporting instead of
-- repeating the join in every query.
-- ============================================================
CREATE OR REPLACE VIEW active_subscriptions_view AS
SELECT
    s.id                AS subscription_id,
    u.id                AS user_id,
    u.name              AS user_name,
    u.email             AS user_email,
    s.subscriber_role   AS subscriber_role,
    p.id                AS plan_id,
    p.name              AS plan_name,
    p.price             AS plan_price,
    p.billing_cycle     AS billing_cycle,
    s.status            AS status,
    s.start_date        AS start_date,
    s.end_date          AS end_date
FROM subscriptions AS s
INNER JOIN users AS u ON u.id = s.user_id
INNER JOIN subscription_plans AS p ON p.id = s.subscription_plan_id
WHERE s.status = 'active';

-- ============================================================
-- TRIGGER: subscriptions_status_change
-- Whenever a subscription's status changes, write an audit row:
-- old status, new status, when.
-- ============================================================
DELIMITER $$

CREATE TRIGGER subscriptions_status_change
AFTER UPDATE ON subscriptions
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO subscription_status_logs (subscription_id, old_status, new_status, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- STORED PROCEDURE: expire_subscriptions
-- Flips any active subscription whose end_date has passed to
-- 'expired'. Called on a schedule by the subscriptions:expire
-- Artisan command. The UPDATE fires the trigger above for each
-- row it touches, so expirations get logged automatically too.
-- ============================================================
DELIMITER $$

CREATE PROCEDURE expire_subscriptions()
BEGIN
    UPDATE subscriptions
    SET status = 'expired'
    WHERE status = 'active'
      AND end_date < NOW();
END$$

DELIMITER ;
