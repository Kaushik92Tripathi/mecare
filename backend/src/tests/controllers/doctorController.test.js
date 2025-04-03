const pool = require('../../db');
const doctorController = require('../../controllers/doctorController');
const { format, addDays, startOfDay } = require('date-fns');

jest.mock('../../db', () => ({
  query: jest.fn()
}));

describe('Doctor Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: {},
      query: {}
    };

    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  describe('getTopDoctors', () => {
    it('should return top 6 doctors sorted by rating', async () => {
      const mockDoctors = [
        {
          id: 1,
          degree: 'MBBS',
          experience_years: 10,
          avg_rating: 4.8,
          review_count: 100,
          doctor_name: 'Dr. Smith',
          specialty_name: 'Cardiology'
        },
        {
          id: 2,
          degree: 'MD',
          experience_years: 15,
          avg_rating: 4.7,
          review_count: 90,
          doctor_name: 'Dr. Johnson',
          specialty_name: 'Neurology'
        }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockDoctors });

      await doctorController.getTopDoctors(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY d.avg_rating DESC'));
      expect(mockRes.json).toHaveBeenCalledWith({
        doctors: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            degree: 'MBBS',
            experienceYears: 10,
            avgRating: 4.8,
            name: 'Dr. Smith',
            specialtyName: 'Cardiology'
          })
        ])
      });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await doctorController.getTopDoctors(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.any(String)
      });
    });
  });

  describe('getAllDoctors', () => {
    it('should return paginated doctors with filters', async () => {
      mockReq.query = {
        page: '1',
        limit: '6',
        search: 'cardio',
        specialty: 'Cardiology',
        minRating: '4.5',
        minExperience: '5'
      };

      const mockDoctors = [
        {
          id: 1,
          degree: 'MBBS',
          experience_years: 10,
          avg_rating: 4.8,
          review_count: 100,
          doctor_name: 'Dr. Smith',
          specialty_name: 'Cardiology',
          consultation_fee: 1000
        }
      ];

      const mockSpecialties = [
        { id: 1, name: 'Cardiology' },
        { id: 2, name: 'Neurology' }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] }) 
        .mockResolvedValueOnce({ rows: mockDoctors }) 
        .mockResolvedValueOnce({ rows: mockSpecialties }); 

      await doctorController.getAllDoctors(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          doctors: expect.any(Array),
          total: 1,
          totalPages: 1,
          currentPage: 1,
          specialties: expect.any(Array)
        })
      );
    });

    it('should return empty results when no doctors found', async () => {
      mockReq.query = {
        page: '1',
        limit: '6'
      };

      const mockSpecialties = [
        { id: 1, name: 'Cardiology' }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] }) 
        .mockResolvedValueOnce({ rows: mockSpecialties });

      await doctorController.getAllDoctors(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        doctors: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        specialties: expect.any(Array)
      });
    });
  });

  describe('getDoctorById', () => {
    it('should return doctor details with availability', async () => {
      mockReq.params = { id: '1' };

      const mockDoctor = {
        id: 1,
        degree: 'MBBS',
        experience_years: 10,
        avg_rating: 4.8,
        review_count: 100,
        doctor_name: 'Dr. Smith',
        specialty_name: 'Cardiology',
        consultation_fee: 1000,
        user_id: 1,
        profile_picture: 'profile.jpg',
        specialty_id: 1,
        location_id: 1,
        location_name: 'City Hospital',
        address: '123 Main St',
        city: 'New York',
        state: 'NY'
      };

      const mockAvailability = [
        {
          day_of_week: 1,
          time_slot_id: 1,
          start_time: '09:00:00',
          end_time: '10:00:00'
        }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [mockDoctor] }) 
        .mockResolvedValueOnce({ rows: mockAvailability }); 

      await doctorController.getDoctorById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          doctor: expect.objectContaining({
            id: 1,
            degree: 'MBBS',
            experienceYears: 10,
            avgRating: '4.8',
            reviewCount: 100,
            user: expect.any(Object),
            specialty: expect.any(Object),
            location: expect.any(Object)
          }),
          availability: expect.any(Array)
        })
      );
    });

    it('should handle invalid doctor ID', async () => {
      mockReq.params = { id: 'invalid' };

      await doctorController.getDoctorById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid doctor ID')
      });
    });

    it('should handle non-existent doctor', async () => {
      mockReq.params = { id: '999' };
      pool.query.mockResolvedValueOnce({ rows: [] });

      await doctorController.getDoctorById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Doctor not found')
      });
    });
  });

  describe('getDoctorAvailability', () => {
    it('should return doctor availability for next 14 days', async () => {
      mockReq.params = { id: '1' };
      const today = startOfDay(new Date());
      const mockDate = format(today, 'yyyy-MM-dd');

      const mockAvailability = [
        {
          day_of_week: 1,
          time_slot_id: 1,
          start_time: '09:00:00',
          end_time: '10:00:00'
        }
      ];

      const mockBookedAppointments = [
        {
          appointment_date: today,
          time_slot_id: 1
        }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: mockAvailability }) 
        .mockResolvedValueOnce({ rows: mockBookedAppointments }); 

      await doctorController.getDoctorAvailability(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          dates: expect.arrayContaining([
            expect.objectContaining({
              date: expect.any(String),
              day: expect.any(String),
              month: expect.any(String),
              fullDate: expect.any(String),
              timeSlots: expect.any(Array)
            })
          ])
        })
      );
    });

    it('should handle invalid doctor ID', async () => {
      mockReq.params = { id: 'invalid' };

      await doctorController.getDoctorAvailability(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Invalid doctor ID')
      });
    });

    it('should handle custom date parameter', async () => {
      mockReq.params = { id: '1' };
      const customDate = addDays(new Date(), 7);
      mockReq.query = { date: format(customDate, 'yyyy-MM-dd') };

      const mockAvailability = [
        {
          day_of_week: 1,
          time_slot_id: 1,
          start_time: '09:00:00',
          end_time: '10:00:00'
        }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: mockAvailability })
        .mockResolvedValueOnce({ rows: [] });

      await doctorController.getDoctorAvailability(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          dates: expect.any(Array)
        })
      );
    });
  });
}); 