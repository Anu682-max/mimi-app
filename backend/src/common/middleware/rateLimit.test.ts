/**
 * Rate Limit Middleware - Unit Tests
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimit } from './rateLimit.middleware';

// Mock request, response, next
function createMockReq(ip = '127.0.0.1'): Partial<Request> {
    return { ip } as Partial<Request>;
}

function createMockRes(): Partial<Response> {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
    };
    return res;
}

describe('Rate Limit Middleware', () => {
    it('эхний хүсэлтийг зөвшөөрөх ёстой', () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 5 });
        const req = createMockReq('test-ip-1');
        const res = createMockRes();
        const next = jest.fn();

        limiter(req as Request, res as Response, next as NextFunction);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('хязгаар хэтэрсэн үед 429 буцаах ёстой', () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 2 });
        const req = createMockReq('test-ip-2');
        const res = createMockRes();
        const next = jest.fn();

        // Эхний 2 хүсэлт зөвшөөрөгдөнө
        limiter(req as Request, res as Response, next as NextFunction);
        limiter(req as Request, res as Response, next as NextFunction);

        // 3-р хүсэлт блоклогдоно
        const res3 = createMockRes();
        const next3 = jest.fn();
        limiter(req as Request, res3 as Response, next3 as NextFunction);

        expect(next3).not.toHaveBeenCalled();
        expect(res3.status).toHaveBeenCalledWith(429);
    });

    it('өөр IP хаяг бол тус тусдаа тоолох ёстой', () => {
        const limiter = rateLimit({ windowMs: 60000, maxRequests: 1 });
        const req1 = createMockReq('ip-a');
        const req2 = createMockReq('ip-b');
        const res = createMockRes();
        const next = jest.fn();

        limiter(req1 as Request, res as Response, next as NextFunction);
        expect(next).toHaveBeenCalledTimes(1);

        const res2 = createMockRes();
        const next2 = jest.fn();
        limiter(req2 as Request, res2 as Response, next2 as NextFunction);
        expect(next2).toHaveBeenCalledTimes(1);
    });
});
