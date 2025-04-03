-- Clear existing data
TRUNCATE TABLE appointments, reviews, doctor_availability, time_slots, doctors, locations, specialties, user_profiles, users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE user_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE specialties_id_seq RESTART WITH 1;
ALTER SEQUENCE locations_id_seq RESTART WITH 1;
ALTER SEQUENCE doctors_id_seq RESTART WITH 1;
ALTER SEQUENCE time_slots_id_seq RESTART WITH 1;
ALTER SEQUENCE appointments_id_seq RESTART WITH 1;
ALTER SEQUENCE reviews_id_seq RESTART WITH 1;

-- Insert specialties (doubled the original list)
INSERT INTO specialties (name, description) VALUES
('Cardiology', 'Deals with disorders of the heart and blood vessels'),
('Dermatology', 'Focuses on skin, hair, and nail conditions'),
('Neurology', 'Treats disorders of the nervous system'),
('Pediatrics', 'Specializes in medical care for children'),
('Orthopedics', 'Focuses on musculoskeletal system'),
('Ophthalmology', 'Deals with eye and vision care'),
('ENT', 'Treats ear, nose, and throat conditions'),
('General Medicine', 'Provides primary healthcare services'),
('Psychiatry', 'Mental health and behavioral disorders'),
('Gynecology', 'Women''s reproductive health'),
('Urology', 'Urinary tract and male reproductive system'),
('Endocrinology', 'Hormonal and metabolic disorders'),
('Gastroenterology', 'Digestive system disorders'),
('Pulmonology', 'Respiratory system diseases'),
('Rheumatology', 'Joint and autoimmune conditions'),
('Oncology', 'Cancer diagnosis and treatment');

-- Insert users (doctors and patients) - 4x more
INSERT INTO users (name, email, password, role, auth_provider) VALUES
-- Admin
('TTN Admin', 'admin@gmail.com', '$2b$10$YourHashedPasswordHere', 'admin', 'email'),

-- Doctors (16 doctors)
('Dr. John Smith', 'john.smith@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Sarah Johnson', 'sarah.johnson@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Michael Brown', 'michael.brown@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Emily Davis', 'emily.davis@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. David Wilson', 'david.wilson@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Lisa Anderson', 'lisa.anderson@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. James Taylor', 'james.taylor@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Emma White', 'emma.white@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Robert Martin', 'robert.martin@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Jennifer Lee', 'jennifer.lee@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. William Clark', 'william.clark@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Patricia Moore', 'patricia.moore@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Thomas Wright', 'thomas.wright@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Susan Hall', 'susan.hall@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Richard King', 'richard.king@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),
('Dr. Mary Scott', 'mary.scott@example.com', '$2b$10$YourHashedPasswordHere', 'doctor', 'email'),

-- Patients (28 patients)
('Alice Wilson', 'alice.wilson@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Bob Thompson', 'bob.thompson@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Carol Martinez', 'carol.martinez@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Daniel Lewis', 'daniel.lewis@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Eva Garcia', 'eva.garcia@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Frank Rodriguez', 'frank.rodriguez@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Grace Lee', 'grace.lee@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Henry Chen', 'henry.chen@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Isabel Kim', 'isabel.kim@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Jack Brown', 'jack.brown@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Karen Davis', 'karen.davis@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Larry Wilson', 'larry.wilson@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Maria Lopez', 'maria.lopez@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Nathan Taylor', 'nathan.taylor@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Olivia Martin', 'olivia.martin@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Peter White', 'peter.white@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Quinn Johnson', 'quinn.johnson@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Rachel Green', 'rachel.green@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Steve Adams', 'steve.adams@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Tina Turner', 'tina.turner@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Uma Patel', 'uma.patel@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Victor Santos', 'victor.santos@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Wendy Baker', 'wendy.baker@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Xavier Reed', 'xavier.reed@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Yolanda Cox', 'yolanda.cox@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Zack Morris', 'zack.morris@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Amy Cooper', 'amy.cooper@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email'),
('Ben Foster', 'ben.foster@example.com', '$2b$10$YourHashedPasswordHere', 'patient', 'email');

-- Insert user profiles for all users
INSERT INTO user_profiles (user_id, gender, profile_picture, phone, city, state, country, blood_group, medical_history)
SELECT 
  id,
  CASE WHEN id % 2 = 0 THEN 'Female' ELSE 'Male' END,
  'https://example.com/profile' || id || '.jpg',
  '+1' || LPAD(CAST(id AS text), 10, '0'),
  CASE (id % 4)
    WHEN 0 THEN 'New York'
    WHEN 1 THEN 'Los Angeles'
    WHEN 2 THEN 'Chicago'
    WHEN 3 THEN 'Houston'
  END,
  CASE (id % 4)
    WHEN 0 THEN 'NY'
    WHEN 1 THEN 'CA'
    WHEN 2 THEN 'IL'
    WHEN 3 THEN 'TX'
  END,
  'India',
  CASE (id % 8)
    WHEN 0 THEN 'A+'
    WHEN 1 THEN 'A-'
    WHEN 2 THEN 'B+'
    WHEN 3 THEN 'B-'
    WHEN 4 THEN 'O+'
    WHEN 5 THEN 'O-'
    WHEN 6 THEN 'AB+'
    WHEN 7 THEN 'AB-'
  END,
  CASE WHEN id > 16 THEN 'Regular checkups, no major issues' ELSE 'N/A' END
FROM users;

-- Insert locations (4x more)
INSERT INTO locations (name, address, city, state, country, zip_code) VALUES
('City Hospital', '123 Main St', 'New York', 'NY', 'India', '10001'),
('Medical Center', '456 Health Ave', 'Los Angeles', 'CA', 'India', '90001'),
('Community Clinic', '789 Care Blvd', 'Chicago', 'IL', 'India', '60601'),
('Health Complex', '321 Wellness Rd', 'Houston', 'TX', 'India', '77001'),
('Metro Hospital', '555 Urban St', 'New York', 'NY', 'India', '10002'),
('Valley Medical', '777 Valley Dr', 'Los Angeles', 'CA', 'India', '90002'),
('Lake View Clinic', '888 Lake St', 'Chicago', 'IL', 'India', '60602'),
('Gulf Medical Center', '999 Gulf Rd', 'Houston', 'TX', 'India', '77002'),
('Central Hospital', '111 Central Ave', 'New York', 'NY', 'India', '10003'),
('Pacific Medical', '222 Pacific Blvd', 'Los Angeles', 'CA', 'India', '90003'),
('Midwest Clinic', '333 Midwest St', 'Chicago', 'IL', 'India', '60603'),
('Texas Medical Center', '444 Texas Ave', 'Houston', 'TX', 'India', '77003'),
('Empire Hospital', '666 Empire St', 'New York', 'NY', 'India', '10004'),
('Golden State Medical', '777 Golden Ave', 'Los Angeles', 'CA', 'India', '90004'),
('Windy City Clinic', '888 Wind St', 'Chicago', 'IL', 'India', '60604'),
('Lone Star Medical', '999 Star Rd', 'Houston', 'TX', 'India', '77004');

-- Insert doctors with specialties (16 doctors)
INSERT INTO doctors (user_id, specialty_id, degree, experience_years, bio, consultation_fee, location_id, is_available) VALUES
(2, 1, 'MD, FACC', 10, 'Experienced cardiologist with expertise in preventive care', 150.00, 1, true),
(3, 2, 'MD, FAAD', 8, 'Board-certified dermatologist specializing in skin conditions', 120.00, 2, true),
(4, 3, 'MD, PhD', 12, 'Neurologist with focus on movement disorders', 180.00, 3, true),
(5, 4, 'MD, FAAP', 6, 'Pediatrician dedicated to children''s health', 130.00, 4, true),
(6, 5, 'MD, FAAOS', 15, 'Orthopedic surgeon specializing in sports injuries', 200.00, 5, true),
(7, 6, 'MD, FAAO', 9, 'Ophthalmologist with expertise in laser surgery', 160.00, 6, true),
(8, 7, 'MD', 7, 'ENT specialist focusing on pediatric cases', 140.00, 7, true),
(9, 8, 'MD', 11, 'General physician with holistic approach', 100.00, 8, true),
(10, 9, 'MD, FAPA', 14, 'Psychiatrist specializing in anxiety and depression', 170.00, 9, true),
(11, 10, 'MD, FACOG', 13, 'Gynecologist with focus on women''s wellness', 150.00, 10, true),
(12, 11, 'MD, FACS', 16, 'Urologist specializing in minimally invasive procedures', 190.00, 11, true),
(13, 12, 'MD, FACE', 8, 'Endocrinologist treating hormonal disorders', 160.00, 12, true),
(14, 13, 'MD, FACG', 11, 'Gastroenterologist with expertise in IBD', 170.00, 13, true),
(15, 14, 'MD, FCCP', 9, 'Pulmonologist specializing in sleep disorders', 150.00, 14, true),
(16, 15, 'MD, FACR', 12, 'Rheumatologist treating autoimmune conditions', 180.00, 15, true),
(17, 16, 'MD, FASCO', 15, 'Oncologist with focus on precision medicine', 200.00, 16, true);

-- Insert time slots (same as before)
INSERT INTO time_slots (start_time, end_time) VALUES
('09:00', '09:30'), ('09:30', '10:00'), ('10:00', '10:30'), ('10:30', '11:00'),
('11:00', '11:30'), ('11:30', '12:00'), ('12:00', '12:30'), ('12:30', '13:00'),
('13:00', '13:30'), ('13:30', '14:00'), ('14:00', '14:30'), ('14:30', '15:00'),
('15:00', '15:30'), ('15:30', '16:00'), ('16:00', '16:30'), ('16:30', '17:00');

-- Insert doctor availability for ALL doctors
INSERT INTO doctor_availability (doctor_id, time_slot_id, day_of_week, is_available)
SELECT 
  d.id as doctor_id,
  t.id as time_slot_id,
  dow.day_of_week,
  true as is_available
FROM doctors d
CROSS JOIN time_slots t
CROSS JOIN (
  SELECT unnest(ARRAY[1,2,3,4,5]) as day_of_week
) dow
WHERE 
  -- Each doctor works 3 days a week
  CASE 
    WHEN d.id % 4 = 0 THEN dow.day_of_week IN (1, 3, 5) -- Mon, Wed, Fri
    WHEN d.id % 4 = 1 THEN dow.day_of_week IN (2, 4, 5) -- Tue, Thu, Fri
    WHEN d.id % 4 = 2 THEN dow.day_of_week IN (1, 3, 4) -- Mon, Wed, Thu
    ELSE dow.day_of_week IN (2, 3, 5) -- Tue, Wed, Fri
  END;

-- Insert appointments (4x more)
INSERT INTO appointments (doctor_id, patient_id, appointment_date, time_slot_id, status, appointment_type, patient_problem, completed_at)
SELECT 
  doctor_id,
  patient_id,
  appointment_date + (i * INTERVAL '1 week'),
  time_slot_id,
  status,
  appointment_type,
  patient_problem,
  CASE 
    WHEN status = 'completed' THEN appointment_date + (i * INTERVAL '1 week') + INTERVAL '1 hour'
    ELSE NULL
  END
FROM (
  VALUES
    (1, 18, CURRENT_DATE + INTERVAL '1 day', 1, 'scheduled', 'video', 'Regular heart checkup', NULL),
    (2, 19, CURRENT_DATE + INTERVAL '2 days', 5, 'completed', 'offline', 'Skin rash examination', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '1 hour'),
    (3, 20, CURRENT_DATE + INTERVAL '3 days', 9, 'scheduled', 'video', 'Headache consultation', NULL),
    (4, 21, CURRENT_DATE + INTERVAL '4 days', 13, 'completed', 'offline', 'Child vaccination', CURRENT_DATE + INTERVAL '4 days' + INTERVAL '1 hour'),
    (5, 22, CURRENT_DATE + INTERVAL '1 day', 2, 'scheduled', 'video', 'Joint pain', NULL),
    (6, 23, CURRENT_DATE + INTERVAL '2 days', 6, 'completed', 'offline', 'Vision check', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '1 hour'),
    (7, 24, CURRENT_DATE + INTERVAL '3 days', 10, 'scheduled', 'video', 'Ear infection', NULL),
    (8, 25, CURRENT_DATE + INTERVAL '4 days', 14, 'completed', 'offline', 'Regular checkup', CURRENT_DATE + INTERVAL '4 days' + INTERVAL '1 hour')
) AS base_appointments(doctor_id, patient_id, appointment_date, time_slot_id, status, appointment_type, patient_problem, completed_at),
(SELECT generate_series(0,3) AS i) AS multiplier;

-- Insert reviews (4x more) - only for completed appointments
INSERT INTO reviews (doctor_id, patient_id, rating, comment, appointment_id)
SELECT 
  base_reviews.doctor_id,
  base_reviews.patient_id + (i * 4),
  base_reviews.rating,
  base_reviews.comment || ' - Review ' || (i + 1),
  a.id
FROM (
  VALUES
    (1, 18, 5, 'Excellent doctor, very professional and caring'),
    (2, 19, 4, 'Great dermatologist, helped with my skin condition'),
    (3, 20, 5, 'Very knowledgeable and thorough in diagnosis'),
    (4, 21, 4, 'Great with children, my kids love her'),
    (5, 22, 5, 'Excellent orthopedic care'),
    (6, 23, 4, 'Professional eye care service'),
    (7, 24, 5, 'Very patient and thorough ENT specialist'),
    (8, 25, 4, 'Comprehensive general checkup')
) AS base_reviews(doctor_id, patient_id, rating, comment)
CROSS JOIN (SELECT generate_series(0,3) AS i) AS multiplier
JOIN appointments a ON a.doctor_id = base_reviews.doctor_id 
  AND a.patient_id = base_reviews.patient_id + (i * 4)
  AND a.status = 'completed';

-- Update doctor ratings
UPDATE doctors 
SET avg_rating = (
  SELECT COALESCE(AVG(rating)::numeric(3,2), 0)
  FROM reviews 
  WHERE doctor_id = doctors.id
),
review_count = (
  SELECT COUNT(*) 
  FROM reviews 
  WHERE doctor_id = doctors.id
); 