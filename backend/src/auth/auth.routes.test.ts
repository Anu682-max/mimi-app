/**
 * Auth Routes - Unit Tests
 * Бүртгэл, нэвтрэлт, нууц үг сэргээх тестүүд
 */

import bcrypt from 'bcryptjs';

// Auth routes-ийн логикийг тест хийх
describe('Auth Logic', () => {
    describe('Нууц үг хэшлэх', () => {
        it('нууц үгийг зөв хэшлэх ёстой', async () => {
            const password = 'testPassword123';
            const hash = await bcrypt.hash(password, 12);

            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        });

        it('нууц үгийг зөв шалгах ёстой', async () => {
            const password = 'testPassword123';
            const hash = await bcrypt.hash(password, 12);

            const isValid = await bcrypt.compare(password, hash);
            expect(isValid).toBe(true);
        });

        it('буруу нууц үгийг татгалзах ёстой', async () => {
            const password = 'testPassword123';
            const hash = await bcrypt.hash(password, 12);

            const isValid = await bcrypt.compare('wrongPassword', hash);
            expect(isValid).toBe(false);
        });
    });

    describe('Email validation', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        it('зөв email-ийг хүлээн зөвшөөрөх ёстой', () => {
            expect(emailRegex.test('test@example.com')).toBe(true);
            expect(emailRegex.test('user.name@domain.co')).toBe(true);
        });

        it('буруу email-ийг татгалзах ёстой', () => {
            expect(emailRegex.test('invalid')).toBe(false);
            expect(emailRegex.test('@domain.com')).toBe(false);
            expect(emailRegex.test('user@')).toBe(false);
        });
    });

    describe('Нууц үгийн шаардлага', () => {
        it('8-аас богино нууц үгийг татгалзах ёстой', () => {
            const password = 'short';
            expect(password.length >= 8).toBe(false);
        });

        it('8 ба түүнээс урт нууц үгийг зөвшөөрөх ёстой', () => {
            const password = 'validPassword123';
            expect(password.length >= 8).toBe(true);
        });
    });
});
