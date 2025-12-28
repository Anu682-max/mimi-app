/**
 * Order Routes
 * 
 * API endpoints for restaurant order management
 */

import express, { Request, Response } from 'express';
import { Order } from './order.model';
import { Restaurant } from './restaurant.model';
import { authMiddleware as authenticateToken } from '../common/middleware/auth.middleware';

const router = express.Router();

// Захиалга үүсгэх
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { restaurant, items, totalAmount, deliveryAddress, paymentMethod } = req.body;

        if (!restaurant || !items || !deliveryAddress || !paymentMethod) {
            return res.status(400).json({ message: 'Шаардлагатай мэдээлэл дутуу байна' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Захиалгад хоол байхгүй байна' });
        }

        // Verify restaurant exists
        const restaurantExists = await Restaurant.findById(restaurant);
        if (!restaurantExists) {
            return res.status(404).json({ message: 'Ресторан олдсонгүй' });
        }

        const order = new Order({
            user: user.userId,
            restaurant,
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod,
            status: 'pending',
        });

        await order.save();
        await order.populate('restaurant', 'name phone address');
        
        res.status(201).json({ 
            message: 'Захиалга амжилттай үүсгэгдлээ', 
            order 
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Өөрийн захиалгуудыг авах
router.get('/my-orders', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const orders = await Order.find({ user: user.userId })
            .populate('restaurant', 'name phone address')
            .sort({ createdAt: -1 })
            .select('-__v');
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Рестораны захиалгуудыг авах (restaurant owner only)
router.get('/restaurant/:restaurantId', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const restaurant = await Restaurant.findById(req.params.restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: 'Ресторан олдсонгүй' });
        }

        // Check ownership
        if (restaurant.owner.toString() !== user.userId) {
            return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        }

        const orders = await Order.find({ restaurant: req.params.restaurantId })
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .select('-__v');
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching restaurant orders:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Тодорхой захиалга авах
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const order = await Order.findById(req.params.id)
            .populate('restaurant', 'name phone address')
            .populate('user', 'firstName lastName email')
            .select('-__v');

        if (!order) {
            return res.status(404).json({ message: 'Захиалга олдсонгүй' });
        }

        // Check access - customer can see their own orders, restaurant owner can see their restaurant's orders
        const restaurant = await Restaurant.findById(order.restaurant);
        const isOwner = order.user._id.toString() === user.userId;
        const isRestaurantOwner = restaurant && restaurant.owner.toString() === user.userId;

        if (!isOwner && !isRestaurantOwner) {
            return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Захиалгын статус өөрчлөх (restaurant owner only)
router.patch('/:id/status', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Статус шаардлагатай' });
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Буруу статус' });
        }

        const order = await Order.findById(req.params.id).populate('restaurant');

        if (!order) {
            return res.status(404).json({ message: 'Захиалга олдсонгүй' });
        }

        // Verify restaurant ownership
        const restaurant = await Restaurant.findById(order.restaurant);
        if (!restaurant || restaurant.owner.toString() !== user.userId) {
            return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Захиалгын статус шинэчлэгдлээ', order });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

// Захиалга цуцлах (customer can cancel pending orders)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Захиалга олдсонгүй' });
        }

        // Only order owner can cancel
        if (order.user.toString() !== user.userId) {
            return res.status(403).json({ message: 'Хандах эрхгүй байна' });
        }

        // Can only cancel pending orders
        if (order.status !== 'pending') {
            return res.status(400).json({ 
                message: 'Зөвхөн хүлээгдэж байгаа захиалгыг цуцлах боломжтой' 
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({ message: 'Захиалга цуцлагдлаа', order });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Серверийн алдаа' });
    }
});

export default router;
