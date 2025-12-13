/**
 * User Repository Tests
 */

import mongoose from 'mongoose';
import { UserRepository } from './user.repository';

// Mock dependencies
jest.mock('../config', () => ({
    config: {
        region: 'us-east',
        defaultLocale: 'en',
    },
    getRegionConfig: jest.fn((region) => ({
        name: region,
        defaultLocale: 'en',
        timezone: 'UTC',
        rules: {
            minimumAge: 18,
            maxDistance: 500,
            defaultSearchRadius: 50,
        },
        features: {
            verificationRequired: false,
        },
    })),
}));

jest.mock('./user.model', () => ({
    User: {
        findOne: jest.fn(),
        find: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        countDocuments: jest.fn(),
    },
}));

import { User } from './user.model';

describe('UserRepository', () => {
    let repository: UserRepository;

    beforeEach(() => {
        repository = new UserRepository();
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('should find user by ID', async () => {
            const mockUser = { _id: new mongoose.Types.ObjectId(), email: 'test@test.com' };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await repository.getById(mockUser._id.toString());

            expect(User.findOne).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should filter by region if provided', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            await repository.getById(userId, 'ap-northeast');

            expect(User.findOne).toHaveBeenCalledWith(
                expect.objectContaining({ region: 'ap-northeast' })
            );
        });
    });

    describe('getByEmail', () => {
        it('should find user by email (lowercase)', async () => {
            const mockUser = { email: 'test@test.com' };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            const result = await repository.getByEmail('Test@Test.com');

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateLocale', () => {
        it('should update user locale', async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            const mockUser = { _id: userId, locale: 'ja' };
            (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

            await repository.updateLocale(userId, 'ja');

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                { $set: { locale: 'ja' } },
                { new: true }
            );
        });
    });

    describe('countByRegion', () => {
        it('should count active users in region', async () => {
            (User.countDocuments as jest.Mock).mockResolvedValue(100);

            const count = await repository.countByRegion('us-east');

            expect(User.countDocuments).toHaveBeenCalledWith({ region: 'us-east', isActive: true });
            expect(count).toBe(100);
        });
    });
});
