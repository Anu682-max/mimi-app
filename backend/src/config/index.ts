/**
 * Application Configuration
 * 
 * Centralized configuration management with environment-based overrides
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

// Load environment variables
dotenv.config();

// Types for region configuration
export interface RegionConfig {
    name: string;
    displayName: string;
    locales: string[];
    defaultLocale: string;
    timezone: string;
    features: {
        chatTranslationEnabled: boolean;
        aiMatchingEnabled: boolean;
        videoProfileEnabled: boolean;
        verificationRequired: boolean;
        verificationStrictMode: boolean;
    };
    rules: {
        minimumAge: number;
        maxDistance: number;
        defaultSearchRadius: number;
    };
    endpoints: {
        database?: string;
        cache?: string;
        media?: string;
    };
}

export interface AppConfig {
    env: string;
    port: number;
    apiVersion: string;
    region: string;
    defaultLocale: string;

    database: {
        uri: string;
    };

    redis: {
        url: string;
    };

    jwt: {
        secret: string;
        expiresIn: string;
    };

    ai: {
        openaiApiKey: string;
        translationProvider: string;
    };

    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        s3Bucket: string;
        region: string;
    };

    features: {
        chatTranslationEnabled: boolean;
        aiMatchingEnabled: boolean;
        videoProfileEnabled: boolean;
        verificationRequired: boolean;
    };
}

// Load region configuration from YAML file
function loadRegionConfig(region: string): RegionConfig | null {
    // Try multiple paths
    const possiblePaths = [
        path.join(__dirname, '../../../config/regions', `${region}.yml`),  // From src/config
        path.join(__dirname, '../../config/regions', `${region}.yml`),     // Alternative
        path.join(process.cwd(), 'config/regions', `${region}.yml`),       // From CWD
    ];

    for (const configPath of possiblePaths) {
        try {
            if (fs.existsSync(configPath)) {
                const content = fs.readFileSync(configPath, 'utf-8');
                return yaml.load(content) as RegionConfig;
            }
        } catch (error) {
            // Try next path
        }
    }

    // Return default config if no file found
    console.warn(`Region config not found for: ${region}, using defaults`);
    return null;
}

// Get environment variable with fallback
function getEnv(key: string, defaultValue = ''): string {
    return process.env[key] || defaultValue;
}

function getEnvBool(key: string, defaultValue = false): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}

// Current region
const currentRegion = getEnv('REGION', 'us-east');
const regionConfig = loadRegionConfig(currentRegion);

// Build application configuration
export const config: AppConfig = {
    env: getEnv('NODE_ENV', 'development'),
    port: getEnvNumber('PORT', 3000),
    apiVersion: getEnv('API_VERSION', 'v1'),
    region: currentRegion,
    defaultLocale: regionConfig?.defaultLocale || getEnv('DEFAULT_LOCALE', 'en'),

    database: {
        uri: getEnv('MONGODB_URI', 'mongodb://localhost:27017/indate'),
    },

    redis: {
        url: getEnv('REDIS_URL', 'redis://localhost:6379'),
    },

    jwt: {
        secret: getEnv('JWT_SECRET', 'change-this-secret-in-production'),
        expiresIn: getEnv('JWT_EXPIRES_IN', '7d'),
    },

    ai: {
        openaiApiKey: getEnv('OPENAI_API_KEY'),
        translationProvider: getEnv('TRANSLATION_PROVIDER', 'openai'),
    },

    aws: {
        accessKeyId: getEnv('AWS_ACCESS_KEY_ID'),
        secretAccessKey: getEnv('AWS_SECRET_ACCESS_KEY'),
        s3Bucket: getEnv('AWS_S3_BUCKET', 'indate-media'),
        region: getEnv('AWS_REGION', 'us-east-1'),
    },

    features: {
        chatTranslationEnabled: regionConfig?.features.chatTranslationEnabled ?? getEnvBool('CHAT_TRANSLATION_ENABLED', true),
        aiMatchingEnabled: regionConfig?.features.aiMatchingEnabled ?? getEnvBool('AI_MATCHING_ENABLED', true),
        videoProfileEnabled: regionConfig?.features.videoProfileEnabled ?? getEnvBool('VIDEO_PROFILE_ENABLED', true),
        verificationRequired: regionConfig?.features.verificationRequired ?? getEnvBool('VERIFICATION_REQUIRED', false),
    },
};

// Export region-specific config if available
export const currentRegionConfig = regionConfig;

// Get config for a specific region
export function getRegionConfig(region: string): RegionConfig | null {
    return loadRegionConfig(region);
}

// Check if a feature is enabled for the current region
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return config.features[feature];
}

export default config;
