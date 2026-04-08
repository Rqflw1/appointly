-- Demo data for Mini CRM

WITH admin_user AS (
  INSERT INTO users (name, email, password, role)
  VALUES ('Admin User', 'admin@demo.local', '$2b$10$e9jNYjBf2kM6uKoho5AiF.iD7jeT07jtu7bT02lUACGNVo2wrDKfa', 'ADMIN')
  RETURNING id
),
manager_user AS (
  INSERT INTO users (name, email, password, role)
  VALUES ('Manager User', 'manager@demo.local', '$2b$10$SaTNiNp4BGLjJriTwWgvh.iIvq/H2dUhFHowy9vLSAZBOvK.mZbHK', 'MANAGER')
  RETURNING id
),
clients AS (
  INSERT INTO clients (manager_id, first_name, last_name, phone, email, notes)
  SELECT id, 'Anna', 'Petrova', '+1-202-555-0111', 'anna@example.com', 'Prefers morning slots'
  FROM manager_user
  UNION ALL
  SELECT id, 'Dmitry', 'Ivanov', '+1-202-555-0112', 'dmitry@example.com', 'VIP client'
  FROM manager_user
  RETURNING id, first_name
),
services AS (
  INSERT INTO services (manager_id, title, description, price, duration_minutes)
  SELECT id, 'Private lesson', 'One-on-one coaching session', 45.00, 60
  FROM manager_user
  UNION ALL
  SELECT id, 'Consultation', 'Business consultation', 90.00, 90
  FROM manager_user
  RETURNING id, title
),
appointment_one AS (
  INSERT INTO appointments (manager_id, client_id, service_id, start_at, duration_minutes, status, price, payment_status, notes)
  SELECT (SELECT id FROM manager_user),
         (SELECT id FROM clients ORDER BY first_name LIMIT 1),
         (SELECT id FROM services ORDER BY title LIMIT 1),
         NOW() + INTERVAL '1 day',
         60,
         'PLANNED',
         45.00,
         'UNPAID',
         'Bring materials'
  RETURNING id
),
appointment_two AS (
  INSERT INTO appointments (manager_id, client_id, service_id, start_at, duration_minutes, status, price, payment_status, notes)
  SELECT (SELECT id FROM manager_user),
         (SELECT id FROM clients ORDER BY first_name DESC LIMIT 1),
         (SELECT id FROM services ORDER BY title DESC LIMIT 1),
         NOW() - INTERVAL '2 days',
         90,
         'COMPLETED',
         90.00,
         'PAID',
         'Follow-up needed'
  RETURNING id
)
INSERT INTO payments (manager_id, client_id, appointment_id, amount, method, payment_date, notes)
SELECT (SELECT id FROM manager_user),
       (SELECT id FROM clients ORDER BY first_name DESC LIMIT 1),
       (SELECT id FROM appointment_two),
       90.00,
       'CARD',
       NOW() - INTERVAL '2 days',
       'Paid in full';

INSERT INTO reminders (manager_id, client_id, appointment_id, type, remind_at, status, message)
SELECT (SELECT id FROM manager_user),
       (SELECT id FROM clients ORDER BY first_name LIMIT 1),
       (SELECT id FROM appointment_one),
       'APPOINTMENT',
       NOW() + INTERVAL '20 hours',
       'PENDING',
       'Reminder: appointment tomorrow at 10:00';
