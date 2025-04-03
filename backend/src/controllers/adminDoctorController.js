const pool = require('../db');
const bcrypt = require('bcrypt');

const adminDoctorController = {
  createDoctor: async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        specialty_id,
        degree,
        experience_years,
        bio,
        location_id,
        consultation_fee,
      } = req.body;

      if (!name || !email || !password || !specialty_id || !degree || !experience_years) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingUserQuery = `
        SELECT id FROM users WHERE email = $1
      `;
      const existingUserResult = await pool.query(existingUserQuery, [email]);

      if (existingUserResult.rows.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const createUserQuery = `
          INSERT INTO users (name, email, password, role)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `;
        const userResult = await client.query(createUserQuery, [
          name,
          email,
          hashedPassword,
          'doctor'
        ]);
        const userId = userResult.rows[0].id;

        const createDoctorQuery = `
          INSERT INTO doctors (
            user_id, specialty_id, degree, experience_years,
            bio, location_id, consultation_fee, is_available,
            avg_rating, review_count
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id
        `;
        const doctorResult = await client.query(createDoctorQuery, [
          userId,
          specialty_id,
          degree,
          experience_years,
          bio,
          location_id || null,
          consultation_fee || null,
          true,
          0,
          0
        ]);
        const doctorId = doctorResult.rows[0].id;

        const timeSlotsQuery = 'SELECT id FROM time_slots';
        const timeSlotsResult = await client.query(timeSlotsQuery);
        const timeSlots = timeSlotsResult.rows;

        const availabilityValues = [];
        for (let day = 1; day <= 5; day++) {
          for (const slot of timeSlots) {
            availabilityValues.push(`(${doctorId}, ${day}, ${slot.id}, true)`);
          }
        }

        const createAvailabilityQuery = `
          INSERT INTO doctor_availability (doctor_id, day_of_week, time_slot_id, is_available)
          VALUES ${availabilityValues.join(', ')}
        `;
        await client.query(createAvailabilityQuery);

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Doctor created successfully',
          doctorId: doctorId
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error creating doctor:', error);
      res.status(500).json({ error: error.message || 'Failed to create doctor' });
    }
  },

  updateDoctor: async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const {
        name,
        email,
        specialty_id,
        degree,
        experience_years,
        bio,
        location_id,
        consultation_fee,
      } = req.body;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const getDoctorQuery = 'SELECT user_id FROM doctors WHERE id = $1';
        const doctorResult = await client.query(getDoctorQuery, [doctorId]);

        if (doctorResult.rows.length === 0) {
          throw new Error('Doctor not found');
        }

        const userId = doctorResult.rows[0].user_id;

        if (name || email) {
          const updateUserQuery = `
            UPDATE users
            SET name = COALESCE($1, name),
                email = COALESCE($2, email)
            WHERE id = $3
          `;
          await client.query(updateUserQuery, [name, email, userId]);
        }

        const updateDoctorQuery = `
          UPDATE doctors
          SET specialty_id = COALESCE($1, specialty_id),
              degree = COALESCE($2, degree),
              experience_years = COALESCE($3, experience_years),
              bio = COALESCE($4, bio),
              location_id = COALESCE($5, location_id),
              consultation_fee = COALESCE($6, consultation_fee)
          WHERE id = $7
        `;
        await client.query(updateDoctorQuery, [
          specialty_id,
          degree,
          experience_years,
          bio,
          location_id,
          consultation_fee,
          doctorId
        ]);

        await client.query('COMMIT');
        res.json({ message: 'Doctor updated successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating doctor:', error);
      res.status(500).json({ error: error.message });
    }
  },

  deleteDoctor: async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const getDoctorQuery = 'SELECT user_id FROM doctors WHERE id = $1';
        const doctorResult = await client.query(getDoctorQuery, [doctorId]);

        if (doctorResult.rows.length === 0) {
          throw new Error('Doctor not found');
        }

        const userId = doctorResult.rows[0].user_id;

        await client.query('DELETE FROM doctor_availability WHERE doctor_id = $1', [doctorId]);

        await client.query('DELETE FROM appointments WHERE doctor_id = $1', [doctorId]);

        await client.query('DELETE FROM doctors WHERE id = $1', [doctorId]);

        await client.query('DELETE FROM users WHERE id = $1', [userId]);

        await client.query('COMMIT');
        res.json({ message: 'Doctor deleted successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      res.status(500).json({ error: error.message });
    }
  },

  toggleDoctorAvailability: async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const { is_available } = req.body;
      
      if (typeof is_available !== 'boolean') {
        return res.status(400).json({ error: 'is_available must be a boolean' });
      }

      const query = `
        UPDATE doctors
        SET is_available = $1
        WHERE id = $2
        RETURNING id
      `;

      const result = await pool.query(query, [is_available, doctorId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      res.json({ message: `Doctor availability ${is_available ? 'enabled' : 'disabled'} successfully` });
    } catch (error) {
      console.error('Error toggling doctor availability:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = adminDoctorController; 