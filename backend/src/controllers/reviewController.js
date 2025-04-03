const pool = require('../db');

const reviewController = {
  // Get reviews for a specific doctor
  getDoctorReviews: async (req, res) => {
    try {
      const doctorId = parseInt(req.query.doctorId);

      if (!doctorId) {
        return res.status(400).json({ error: 'Doctor ID is required' });
      }

      const query = `
        SELECT 
          r.id,
          r.rating,
          r.comment,
          r.created_at,
          u.name as patient_name
        FROM reviews r
        JOIN users u ON r.patient_id = u.id
        WHERE r.doctor_id = $1
        ORDER BY r.created_at DESC
      `;

      const result = await pool.query(query, [doctorId]);

      const reviews = result.rows.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        patient: {
          name: review.patient_name
        }
      }));

      res.json({ reviews });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Add a new review
  createReview: async (req, res) => {
    try {
      const { doctorId, rating, comment } = req.body;
      const patientId = req.user.id; // From auth middleware

      // Validate input
      if (!doctorId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Invalid input' });
      }

      // Check if user has an appointment with this doctor
      const appointmentQuery = `
        SELECT id FROM appointments
        WHERE doctor_id = $1
        AND patient_id = $2
        AND status = 'completed'
        LIMIT 1
      `;

      const appointmentResult = await pool.query(appointmentQuery, [doctorId, patientId]);

      if (appointmentResult.rows.length === 0) {
        return res.status(403).json({
          error: 'You can only review doctors after completing an appointment'
        });
      }

      // Check if user has already reviewed this doctor
      const existingReviewQuery = `
        SELECT id FROM reviews
        WHERE doctor_id = $1 AND patient_id = $2
        LIMIT 1
      `;

      const existingReviewResult = await pool.query(existingReviewQuery, [doctorId, patientId]);

      if (existingReviewResult.rows.length > 0) {
        return res.status(400).json({
          error: 'You have already reviewed this doctor'
        });
      }

      // Start a transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Create the review
        const createReviewQuery = `
          INSERT INTO reviews (doctor_id, patient_id, rating, comment)
          VALUES ($1, $2, $3, $4)
          RETURNING id, rating, comment, created_at
        `;

        const reviewResult = await client.query(createReviewQuery, [
          doctorId,
          patientId,
          rating,
          comment
        ]);

        // Calculate new average rating and review count
        const statsQuery = `
          SELECT 
            AVG(rating) as avg_rating,
            COUNT(*) as review_count
          FROM reviews
          WHERE doctor_id = $1
        `;

        const statsResult = await client.query(statsQuery, [doctorId]);

        // Update doctor's stats
        const updateDoctorQuery = `
          UPDATE doctors
          SET 
            avg_rating = $1,
            review_count = $2
          WHERE id = $3
        `;

        await client.query(updateDoctorQuery, [
          statsResult.rows[0].avg_rating,
          statsResult.rows[0].review_count,
          doctorId
        ]);

        await client.query('COMMIT');

        res.json({
          success: true,
          message: 'Review added successfully',
          review: reviewResult.rows[0]
        });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reviewController; 