/**
 * Restaurant Routes
 * 
 * API endpoints for restaurant management
 */

import express, { Request, Response } from 'express';
import { Restaurant } from './restaurant.model';
import { authMiddleware as authenticateToken } from '../common/middleware/auth.middleware';

const router = express.Router();

// Бүх идэвхтэй рестораныг авах
router.get('/', async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find({ isActive: true })
            .select('-__v')
            .sort({ rating: -1, name: 1 });
        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Тодорхой ресторан авах
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).select('-__v');
        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан олдсонгүй' });
        }
        res.json(restaurant);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Рестораны цэс авах
router.get('/:id/menu', async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).select('menu');
        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан олдсонгүй' });
        }
        
        // Зөвхөн идэвхтэй хоолуудыг буцаах
        const availableMenu = restaurant.menu.filter((item: any) => item.isAvailable !== false);
        res.json(availableMenu);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Ресторан нэмэх (зөвхөн restaurant owner эсвэл admin)
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        
        // Check user role - будут добавлять позже в User model
        // if (user.role !== 'restaurant' && user.role !== 'admin') {
        //     return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        // }

        const { name, address, phone, cuisine } = req.body;

        if (!name || !address || !phone || !cuisine) {
            return res.status(400).json({ message: 'Шаардлагатай мэдээлэл дутуу байна' });
        }

        const restaurant = new Restaurant({
            owner: user.userId,
            name,
            address,
            phone,
            cuisine,
            menu: [],
        });

        await restaurant.save();
        res.status(201).json({ 
            message: 'Ресторан амжилттай нэмэгдлээ', 
            restaurant 
        });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Рестораны мэдээлэл шинэчлэх
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан олдсонгүй' });
        }

        // Check ownership
        if (restaurant.owner.toString() !== user.userId) {
            return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        }

        const { name, address, phone, cuisine, isActive } = req.body;

        if (name) restaurant.name = name;
        if (address) restaurant.address = address;
        if (phone) restaurant.phone = phone;
        if (cuisine) restaurant.cuisine = cuisine;
        if (typeof isActive === 'boolean') restaurant.isActive = isActive;

        await restaurant.save();
        res.json({ message: 'Ресторан амжилттай шинэчлэгдлээ', restaurant });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Цэсэнд хоол нэмэх
router.post('/:id/menu', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан олдсонгүй' });
        }

        if (restaurant.owner.toString() !== user.userId) {
            return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        }

        const { name, description, price, category, image } = req.body;

        if (!name || !price) {
            return res.status(400).json({ message: 'Хоолны нэр болон үнэ шаардлагатай' });
        }

        restaurant.menu.push({
            name,
            description,
            price,
            category: category || 'other',
            image,
            isAvailable: true,
        });

        await restaurant.save();
        res.status(201).json({ 
            message: 'Хоол амжилттай нэмэгдлээ', 
            menu: restaurant.menu 
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Цэсний хоол устгах
router.delete('/:id/menu/:menuItemId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан олдсонгүй' });
        }

        if (restaurant.owner.toString() !== user.userId) {
            return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        }

        restaurant.menu = restaurant.menu.filter(
            (item: any) => item._id.toString() !== req.params.menuItemId
        );

        await restaurant.save();
        res.json({ message: 'Хоол устгагдлаа', menu: restaurant.menu });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

export default router;
