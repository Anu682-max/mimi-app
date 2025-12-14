/**
 * User Repository
 * 
 * Region-aware data access layer for user operations
 */

import mongoose from 'mongoose';
import User, { IUser } from './user.model';
import { logger } from '../common/logger';
import { config, getRegionConfig } from '../config';

export interface CreateUserDTO {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName?: string;
    birthday: Date;
    gender: 'man' | 'woman' | 'nonbinary' | 'other';
    locale?: string;
    timezone?: string;
    region?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    bio?: string;
    photos?: string[];
    locale?: string;
    timezone?: string;
    preferences?: Partial<IUser['preferences']>;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    city?: string;
    country?: string;
}

export interface FindNearbyOptions {
    latitude: number;
    longitude: number;
    maxDistanceKm: number;
    gender?: string[];
    ageRange?: { min: number; max: number };
    limit?: number;
    excludeUserIds?: string[];
    region?: string;
}

/**
 * User Repository with region-aware operations
 * 
 * NOTE: In a true multi-region setup, this repository would connect to 
 * region-specific database instances. For now, it uses the region field
 * to filter users and is ready for multi-region infrastructure.
 */
export class UserRepository {
    private static mockUsers: any[] = [];

    private isConnected(): boolean {
        return mongoose.connection.readyState === 1;
    }

    /**
     * Get user by ID, optionally with region validation
     */
    async getById(userId: string, region?: string): Promise<IUser | null> {
        if (!this.isConnected()) {
            const user = UserRepository.mockUsers.find(u => u._id.toString() === userId);
            if (!user) return null;
            if (region && user.region !== region) return null;
            return user as IUser;
        }

        const query: any = { _id: new mongoose.Types.ObjectId(userId) };

        // If region is specified, ensure user belongs to that region
        if (region) {
            query.region = region;
        }

        return User.findOne(query);
    }

    /**
     * Get user by email
     */
    async getByEmail(email: string): Promise<IUser | null> {
        if (!this.isConnected()) {
            // Check mock users
            const user = UserRepository.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            return (user as IUser) || null;
        }
        return User.findOne({ email: email.toLowerCase() });
    }

    /**
     * Create a new user
     */
    async create(data: CreateUserDTO): Promise<IUser> {
        const regionConfig = getRegionConfig(data.region || config.region);

        // Validate minimum age for region
        if (regionConfig) {
            const birthday = new Date(data.birthday);
            const today = new Date();
            let age = today.getFullYear() - birthday.getFullYear();
            const monthDiff = today.getMonth() - birthday.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
                age--;
            }

            if (age < regionConfig.rules.minimumAge) {
                throw new Error(`VALIDATION_AGE_MINIMUM:${regionConfig.rules.minimumAge}`);
            }
        }

        const userData = {
            ...data,
            locale: data.locale || regionConfig?.defaultLocale || config.defaultLocale,
            timezone: data.timezone || regionConfig?.timezone || 'UTC',
            region: data.region || config.region,
            preferences: {
                maxDistance: regionConfig?.rules.defaultSearchRadius || 50,
                autoTranslate: true,
            },
        };

        const user = new User(userData);

        if (!this.isConnected()) {
            user._id = new mongoose.Types.ObjectId();
            // Assign defaults manually if needed, or rely on Mongoose default assignment
            // (Mongoose defaults run on 'new User()')
            UserRepository.mockUsers.push(user);
            logger.info(`[MOCK DB] User created: ${user._id}`);
            return user;
        }

        await user.save();
        logger.info(`User created: ${user._id} in region: ${user.region}`);

        return user;
    }

    /**
     * Update user profile
     */
    async update(userId: string, data: UpdateUserDTO): Promise<IUser | null> {
        if (!this.isConnected()) {
            const index = UserRepository.mockUsers.findIndex(u => u._id.toString() === userId);
            if (index === -1) return null;

            const user = UserRepository.mockUsers[index];
            const updatedUser = { ...user, ...data };

            // Handle nested preferences manually for mock
            if (data.preferences) {
                updatedUser.preferences = { ...user.preferences, ...data.preferences };
                delete (updatedUser as any).preferences; // cleanup if mixed
            }
            // Re-assign preferences correctly
            if (data.preferences) {
                updatedUser.preferences = { ...user.preferences, ...data.preferences };
            }

            UserRepository.mockUsers[index] = updatedUser;
            return updatedUser as IUser;
        }

        const updateData: any = { ...data };

        // Handle nested preferences update
        if (data.preferences) {
            Object.keys(data.preferences).forEach(key => {
                updateData[`preferences.${key}`] = (data.preferences as any)[key];
            });
            delete updateData.preferences;
        }

        return User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );
    }

    /**
     * Update user locale
     */
    async updateLocale(userId: string, locale: string): Promise<IUser | null> {
        if (!this.isConnected()) {
            const user = UserRepository.mockUsers.find(u => u._id.toString() === userId);
            if (user) user.locale = locale;
            return user;
        }
        return User.findByIdAndUpdate(
            userId,
            { $set: { locale } },
            { new: true }
        );
    }

    /**
     * Update user timezone
     */
    async updateTimezone(userId: string, timezone: string): Promise<IUser | null> {
        if (!this.isConnected()) {
            const user = UserRepository.mockUsers.find(u => u._id.toString() === userId);
            if (user) user.timezone = timezone;
            return user;
        }
        return User.findByIdAndUpdate(
            userId,
            { $set: { timezone } },
            { new: true }
        );
    }

    /**
     * Update user's online status
     */
    async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
        if (!this.isConnected()) {
            const user = UserRepository.mockUsers.find(u => u._id.toString() === userId);
            if (user) {
                user.isOnline = isOnline;
                user.lastOnline = new Date();
            }
            return;
        }
        await User.findByIdAndUpdate(userId, {
            $set: {
                isOnline,
                lastOnline: new Date(),
            },
        });
    }

    /**
     * Find users nearby using geospatial query
     * Region-aware: only returns users from the same region by default
     */
    async findNearby(options: FindNearbyOptions): Promise<IUser[]> {
        if (!this.isConnected()) {
            return UserRepository.mockUsers.filter(u =>
                u.region === (options.region || config.region) &&
                u.isActive !== false
            ).slice(0, options.limit || 50) as IUser[];
        }

        const {
            latitude,
            longitude,
            maxDistanceKm,
            gender,
            ageRange,
            limit = 50,
            excludeUserIds = [],
            region = config.region,
        } = options;

        const regionConfig = getRegionConfig(region);
        const effectiveMaxDistance = Math.min(
            maxDistanceKm,
            regionConfig?.rules.maxDistance || 500
        );

        // Calculate age filter dates
        const now = new Date();
        const maxBirthDate = ageRange?.min
            ? new Date(now.getFullYear() - ageRange.min, now.getMonth(), now.getDate())
            : undefined;
        const minBirthDate = ageRange?.max
            ? new Date(now.getFullYear() - ageRange.max - 1, now.getMonth(), now.getDate())
            : undefined;

        const query: any = {
            isActive: true,
            region, // Filter by region
            _id: { $nin: excludeUserIds.map(id => new mongoose.Types.ObjectId(id)) },
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    },
                    $maxDistance: effectiveMaxDistance * 1000, // Convert km to meters
                },
            },
        };

        if (gender && gender.length > 0) {
            query.gender = { $in: gender };
        }

        if (minBirthDate || maxBirthDate) {
            query.birthday = {};
            if (minBirthDate) query.birthday.$gte = minBirthDate;
            if (maxBirthDate) query.birthday.$lte = maxBirthDate;
        }

        // Check if verification is required in this region
        if (regionConfig?.features.verificationRequired) {
            query.isVerified = true;
        }

        return User.find(query).limit(limit);
    }

    /**
     * Get users by region (for admin/analytics)
     */
    async getByRegion(region: string, options?: { limit?: number; offset?: number }): Promise<IUser[]> {
        if (!this.isConnected()) {
            return UserRepository.mockUsers.filter(u => u.region === region).slice(options?.offset || 0, (options?.offset || 0) + (options?.limit || 100)) as IUser[];
        }
        return User.find({ region, isActive: true })
            .skip(options?.offset || 0)
            .limit(options?.limit || 100);
    }

    /**
     * Count users by region
     */
    async countByRegion(region: string): Promise<number> {
        if (!this.isConnected()) {
            return UserRepository.mockUsers.filter(u => u.region === region).length;
        }
        return User.countDocuments({ region, isActive: true });
    }

    /**
     * Delete user (soft delete)
     */
    async softDelete(userId: string): Promise<void> {
        if (!this.isConnected()) {
            const user = UserRepository.mockUsers.find(u => u._id.toString() === userId);
            if (user) user.isActive = false;
            return;
        }
        await User.findByIdAndUpdate(userId, { $set: { isActive: false } });
        logger.info(`User soft deleted: ${userId}`);
    }
}

export const userRepository = new UserRepository();

export default userRepository;
