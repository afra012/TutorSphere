-- MySQL equivalent of the Laravel migration.
CREATE TABLE student_tutor_posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT UNSIGNED NOT NULL,
    subject_id BIGINT UNSIGNED NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    tutoring_mode ENUM('online', 'in-person', 'both') NOT NULL,
    salary_amount DECIMAL(10,2) NOT NULL,
    salary_period ENUM('weekly', 'monthly') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT,
    INDEX (status, created_at),
    INDEX (student_id, status)
);

-- Teacher View Post: INNER JOIN = required user/subject, LEFT JOIN = optional profile.
SELECT p.*, u.name AS student_name, u.email AS student_email, s.subject_name,
       sp.phone AS profile_phone, sp.address AS student_address
FROM student_tutor_posts AS p
INNER JOIN users AS u ON u.id = p.student_id
INNER JOIN subjects AS s ON s.id = p.subject_id
LEFT JOIN student_profiles AS sp ON sp.user_id = p.student_id
WHERE p.status = 'active'
ORDER BY p.created_at DESC;
