/**
 * Test Setup
 * 
 * Configuration and mocks for Jest tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.REGION = 'us-east';
process.env.DEFAULT_LOCALE = 'en';

// Mock winston logger to reduce noise in tests
jest.mock('./common/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));

// Mock external services
jest.mock('axios');

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});
