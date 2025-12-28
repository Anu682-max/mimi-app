/**
 * Restaurant Model
 * 
 * Mongoose schema for restaurant management
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuItem {
    name: string;
    price: number;
    description?: string;
    image?: string;
    category?: 'appetizer' | 'main' | 'dessert' | 'drink' | 'other';
    isAvailable?: boolean;
}

export interface IRestaurant extends Document {
    _id: mongoose.Types.ObjectId;
    owner: mongoose.Types.ObjectId; // Reference to User with restaurant role
    name: string;
    address: string;
    phone: string;
    cuisine: string;
    menu: IMenuItem[];
    rating: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: String,
    image: String,
    category: {
        type: String,
        enum: ['appetizer', 'main', 'dessert', 'drink', 'other'],
        default: 'other',
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
});

const restaurantSchema = new Schema<IRestaurant>(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        cuisine: {
            type: String,
            required: true,
        },
        menu: [menuItemSchema],
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ cuisine: 1 });
restaurantSchema.index({ isActive: 1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
