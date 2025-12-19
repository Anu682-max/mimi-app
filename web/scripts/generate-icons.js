// PWA Icon Generator Script
// This script generates all required PWA icons from a single source image

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_ICON = path.join(__dirname, '../public/favicon.ico');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateIcons() {
    console.log('🎨 Generating PWA icons...\n');

    // For now, we'll use a simple SVG as source since we don't have the original
    // You can replace this with your actual logo
    const svgIcon = `
        <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="512" height="512" rx="128" fill="url(#grad)"/>
            <text x="256" y="340" font-size="280" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold">❤️</text>
        </svg>
    `;

    const svgBuffer = Buffer.from(svgIcon);

    for (const size of ICON_SIZES) {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`✅ Generated: icon-${size}x${size}.png`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
