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

    // Magical Icon Design 🔮
    const svgIcon = `
        <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- Cosmic Background Gradient -->
                <radialGradient id="bgGrad" cx="50%" cy="0%" r="120%" fx="50%" fy="0%">
                    <stop offset="0%" style="stop-color:#4c1d95;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#2e1065;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0f0720;stop-opacity:1" />
                </radialGradient>
                
                <!-- Magical Heart Gradient -->
                <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f472b6;stop-opacity:1" /> <!-- pink-400 -->
                    <stop offset="50%" style="stop-color:#d946ef;stop-opacity:1" /> <!-- fuchsia-500 -->
                    <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" /> <!-- violet-500 -->
                </linearGradient>

                <!-- Glow Filter -->
                <filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
                    <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <!-- Background Container -->
            <rect width="512" height="512" rx="140" fill="url(#bgGrad)"/>
            
            <!-- Magic Circles (Subtle background details) -->
            <circle cx="256" cy="270" r="170" stroke="url(#heartGrad)" stroke-width="1.5" fill="none" opacity="0.3" />
            <circle cx="256" cy="270" r="150" stroke="white" stroke-width="1" fill="none" opacity="0.1" stroke-dasharray="15 25" />

            <!-- Glowing Heart -->
            <g filter="url(#glow)" transform="translate(0, 20)">
                <path d="M256 420.5 C256 420.5 434 296 434 198.5 C434 135.5 382 92.5 322 92.5 C284 92.5 264 112.5 256 128.5 C248 112.5 228 92.5 190 92.5 C130 92.5 78 135.5 78 198.5 C78 296 256 420.5 256 420.5 Z" 
                      fill="url(#heartGrad)"/>
            </g>

            <!-- Sparkles ✨ -->
            <g fill="white">
                <!-- Top Right Sparkle -->
                <path d="M400 140 L403 130 L406 140 L416 143 L406 146 L403 156 L400 146 L390 143 Z" opacity="0.9" />
                
                <!-- Bottom Left Sparkle -->
                <path d="M110 320 L112 312 L114 320 L122 322 L114 324 L112 332 L110 324 L102 322 Z" opacity="0.6" />
                
                <!-- Tiny dots starfield -->
                <circle cx="120" cy="120" r="4" opacity="0.6" />
                <circle cx="420" cy="380" r="3" opacity="0.5" />
                <circle cx="256" cy="80" r="2" opacity="0.4" />
                <circle cx="80" cy="256" r="2" opacity="0.3" />
            </g>
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
