/**
 * Generate VAPID keys for Web Push notifications
 * Run with: npx ts-node scripts/generate-vapid-keys.ts
 */

import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(50));
console.log('VAPID Keys Generated for Web Push Notifications');
console.log('='.repeat(50));
console.log('');
console.log('Add these to your .env file:');
console.log('');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_SUBJECT=mailto:admin@indate.com');
console.log('');
console.log('='.repeat(50));
console.log('');
console.log('Also add to Vercel environment variables!');
