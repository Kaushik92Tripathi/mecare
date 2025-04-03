-- Add completed_at column to appointments table
ALTER TABLE appointments
ADD COLUMN completed_at TIMESTAMP;

-- Add index for completed_at for better query performance
CREATE INDEX idx_appointments_completed_at ON appointments(completed_at);

-- Update existing completed appointments with completed_at timestamp
UPDATE appointments
SET completed_at = appointment_date + INTERVAL '1 hour'
WHERE status = 'completed'; 