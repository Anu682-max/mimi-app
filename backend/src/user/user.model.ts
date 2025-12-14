/**
 * User Model
 * 
 * Mongoose schema for user profiles with internationalization support
 */

import mongoose, { Document, Schema } from 'mongoose';
import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../common/i18n';

// User document interface
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    passwordHash: string;

    // Profile info
    firstName: string;
    lastName?: string;
    birthday: Date;
    age?: number; // Virtual field
    gender: 'man' | 'woman' | 'nonbinary' | 'other';
    bio?: string;
    photos: string[];

    // Location
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    city?: string;
    country?: string;

    // Internationalization
    locale: Locale;
    timezone: string;
    region: string;

    // Preferences
    preferences: {
        showMe: ('man' | 'woman' | 'nonbinary' | 'other')[];
        ageRange: { min: number; max: number };
        maxDistance: number; // km
        autoTranslate: boolean;
    };

    // Verification
    isVerified: boolean;
    verificationStatus: 'none' | 'pending' | 'approved' | 'rejected';
    verificationPhotos?: string[];

    // Status
    isActive: boolean;
    isOnline: boolean;
    lastOnline: Date;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },

        // Profile
        firstName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 50,
        },
        birthday: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ['man', 'woman', 'nonbinary', 'other'],
            required: true,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        photos: {
            type: [String],
            default: [],
        },

        // Location with geospatial index
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: [0, 0],
            },
        },
        city: String,
        country: String,

        // Internationalization fields
        locale: {
            type: String,
            enum: SUPPORTED_LOCALES,
            default: DEFAULT_LOCALE,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        region: {
            type: String,
            default: 'us-east',
        },

        // Preferences
        preferences: {
            showMe: {
                type: [String],
                enum: ['man', 'woman', 'nonbinary', 'other'],
                default: ['man', 'woman'],
            },
            ageRange: {
                min: { type: Number, default: 18, min: 18 },
                max: { type: Number, default: 100, max: 100 },
            },
            maxDistance: {
                type: Number,
                default: 50,
                min: 1,
                max: 500,
            },
            autoTranslate: {
                type: Boolean,
                default: true,
            },
        },

        // Verification
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationStatus: {
            type: String,
            enum: ['none', 'pending', 'approved', 'rejected'],
            default: 'none',
        },
        verificationPhotos: [String],

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },
        isOnline: {
            type: Boolean,
            default: false,
        },
        lastOnline: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
userSchema.index({ location: '2dsphere' });
userSchema.index({ email: 1 });
userSchema.index({ region: 1 });
userSchema.index({ isActive: 1, region: 1, gender: 1 });

// Virtual for age calculation
userSchema.virtual('age').get(function () {
    const today = new Date();
    const birth = new Date(this.birthday);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model<IUser>('User', userSchema);

export default User;
