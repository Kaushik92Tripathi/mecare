// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  SESSION_SECRET: 'test-secret',
  FRONTEND_URL: 'http://localhost:3000',
  BACKEND_URL: 'http://localhost:5000',
  DATABASE_URL: 'postgresql://localhost:5432/testdb',
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  SENDGRID_API_KEY: 'test-sendgrid-key'
};

// Mock console methods to keep test output clean
global.console = {
  ...console,
  // Comment out during development for debugging
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Add custom jest matchers if needed
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global beforeAll hook
beforeAll(() => {
  // Add any setup that should run once before all tests
});

// Global beforeEach hook
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

// Global afterEach hook
afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});

// Global afterAll hook
afterAll(() => {
  // Add any cleanup that should run once after all tests
}); 