const pool = require('../../db');
const appointmentController = require('../../controllers/appointmentController');
const { sendEmail } = require('../../utils/sendgrid');
const { format } = require('date-fns');

// Mock the dependencies
jest.mock('../../db', () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

jest.mock('../../utils/sendgrid', () => ({
  sendEmail: jest.fn()
}));

describe('Appointment Controller', () => {
  let mockReq;
  let mockRes;
  let mockClient;
  let mockNext;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock request object
    mockReq = {
      params: {},
      body: {},
      user: { id: 1 },
      query: {}
    };

    // Mock response object with spies
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };

    // Mock next function
    mockNext = jest.fn();

    // Mock database client with transaction support
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    // Mock pool connect to return mockClient
    pool.connect.mockResolvedValue(mockClient);
  });

  describe('createAppointment', () => {
    const mockAppointmentData = {
      doctorId: 1,
      date: format(new Date(), 'yyyy-MM-dd'),
      timeSlotId: 1,
      appointmentType: 'video',
      patientProblem: 'Headache',
      patientAge: 30,
      patientGender: 'male'
    };

    it('should create an appointment successfully', async () => {
      mockReq.body = mockAppointmentData;

      pool.query
        .mockResolvedValueOnce({ rows: [{ is_available: true }] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({
          rows: [{
            id: 1,
            patient_name: 'John Doe',
            doctor_name: 'Dr. Smith',
            specialty_name: 'Cardiology',
            appointment_date: mockAppointmentData.date,
            status: 'pending'
          }]
        });

      await appointmentController.createAppointment(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledTimes(4);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          appointment: expect.objectContaining({
            id: 1,
            status: 'pending'
          })
        })
      );
    });

    it('should validate required fields', async () => {
      mockReq.body = {};
      await appointmentController.createAppointment(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });

    it('should validate appointment date is not in past', async () => {
      mockReq.body = {
        ...mockAppointmentData,
        date: '2020-01-01'
      };
      
      await appointmentController.createAppointment(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('past')
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      mockReq.body = mockAppointmentData;
      const dbError = new Error('Database error');
      pool.query.mockRejectedValueOnce(dbError);

      await appointmentController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.any(String)
      });
    });
  });

  describe('updateAppointmentStatus', () => {
    const mockAppointment = {
      id: 1,
      status: 'pending',
      patient_name: 'John Doe',
      patient_email: 'john@example.com',
      doctor_name: 'Dr. Smith'
    };

    it('should update appointment status successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'confirmed' };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'pending' }] }) // Current status
        .mockResolvedValueOnce({ rows: [{ ...mockAppointment, status: 'confirmed' }] }) // Update
        .mockResolvedValueOnce({ rows: [mockAppointment] }) // Get details
        .mockResolvedValueOnce({}); // COMMIT

      sendEmail.mockResolvedValueOnce({});

      await appointmentController.updateAppointmentStatus(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
          appointment: expect.any(Object),
          emailStatus: 'sent'
        })
      );
    });

    it('should handle transaction errors', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'confirmed' };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Transaction error')); // Query error

      await appointmentController.updateAppointmentStatus(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should handle email errors gracefully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'confirmed' };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [mockAppointment] }) // Current status
        .mockResolvedValueOnce({ rows: [{ ...mockAppointment, status: 'confirmed' }] }) // Update
        .mockResolvedValueOnce({ rows: [mockAppointment] }); // Get details

      sendEmail.mockRejectedValueOnce(new Error('Email error'));

      await appointmentController.updateAppointmentStatus(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          emailStatus: 'failed',
          emailError: expect.any(String)
        })
      );
    });

    it('should validate appointment status transitions', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { status: 'completed' };

      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [{ status: 'pending' }] }); // Current status

      await appointmentController.updateAppointmentStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Only confirmed appointments')
        })
      );
    });
  });

  describe('getAllAppointments', () => {
    it('should return all appointments with stats', async () => {
      const mockAppointments = [
        { id: 1, status: 'confirmed' },
        { id: 2, status: 'pending' },
        { id: 3, status: 'cancelled' }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockAppointments });

      await appointmentController.getAllAppointments(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          appointments: expect.any(Array),
          stats: expect.objectContaining({
            total: 3,
            confirmed: 1,
            pending: 1,
            cancelled: 1
          })
        })
      );
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await appointmentController.getAllAppointments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.any(String)
      });
    });
  });

  describe('getAppointmentById', () => {
    it('should return appointment details', async () => {
      mockReq.params = { id: '1' };
      const mockAppointment = {
        id: 1,
        patient_name: 'John Doe',
        doctor_name: 'Dr. Smith',
        specialty_name: 'Cardiology'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockAppointment] });

      await appointmentController.getAppointmentById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          appointment: expect.objectContaining({
            id: 1,
            patient: expect.any(Object),
            doctor: expect.any(Object)
          })
        })
      );
    });

    it('should handle invalid appointment ID', async () => {
      mockReq.params = { id: 'invalid' };

      await appointmentController.getAppointmentById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid appointment ID')
      });
    });

    it('should handle non-existent appointment', async () => {
      mockReq.params = { id: '999' };
      pool.query.mockResolvedValueOnce({ rows: [] });

      await appointmentController.getAppointmentById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Appointment not found')
      });
    });
  });

  describe('getDoctorAppointmentsForUser', () => {
    it('should fetch appointments for specific doctor and user', async () => {
      mockReq.params = { doctorId: '1' };
      mockReq.user = { id: 1 };

      const mockAppointments = [
        {
          id: 1,
          appointment_date: '2024-03-25',
          status: 'confirmed',
          patient_name: 'John Doe'
        }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockAppointments });

      await appointmentController.getDoctorAppointmentsForUser(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return error if doctor ID is missing', async () => {
      mockReq.params = {};
      mockReq.user = { id: 1 };

      await appointmentController.getDoctorAppointmentsForUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Doctor ID is required'
      });
    });
  });
}); 