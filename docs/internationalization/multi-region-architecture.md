# Multi-Region Architecture

This document describes the multi-region architecture for the InDate dating app.

## Overview

InDate is designed to operate across multiple geographic regions, with:
- **Region-specific configurations** for features, rules, and locales
- **Region-aware data access** for user isolation
- **Cross-region matching control**

## Regions

### Defined Regions

| Region ID | Name | Locales | Default Timezone |
|-----------|------|---------|------------------|
| `us-east` | United States (East) | en, es | America/New_York |
| `eu-west` | Europe (West) | en, de, fr, es | Europe/London |
| `ap-northeast` | Asia Pacific (Northeast) | ja, ko, en | Asia/Tokyo |

### Region Assignment

Users are assigned to a region based on:
1. **Country from IP** at signup (using geoip-lite)
2. **User's chosen country** in onboarding (override)

The region is stored in the user profile:
```typescript
user.region = 'ap-northeast';
```

## Configuration

### Region Config Files

Located in `config/regions/`:
```
config/regions/
├── us-east.yml
├── eu-west.yml
└── ap-northeast.yml
```

### Configuration Structure

```yaml
name: ap-northeast
displayName: "Asia Pacific (Northeast)"

# Supported locales for this region
locales:
  - ja
  - ko
  - en
defaultLocale: ja

timezone: Asia/Tokyo

# Feature flags per region
features:
  chatTranslationEnabled: true
  aiMatchingEnabled: true
  videoProfileEnabled: true
  verificationRequired: true
  verificationStrictMode: true

# Region-specific rules
rules:
  minimumAge: 18
  maxDistance: 200  # km
  defaultSearchRadius: 20  # km

# Database endpoints (for multi-region deployment)
endpoints:
  database: "${MONGODB_URI_AP_NORTHEAST}"
  cache: "${REDIS_URL_AP_NORTHEAST}"
  media: "s3://indate-media-ap-northeast"
```

### Loading Region Config

```typescript
import { getRegionConfig } from './config';

const config = getRegionConfig('ap-northeast');
// Returns RegionConfig object or null
```

## Region-Aware Data Access

### User Repository

The `UserRepository` is region-aware:

```typescript
// Find user with region validation
const user = await userRepository.getById(userId, 'ap-northeast');

// Find nearby users (region-filtered by default)
const profiles = await userRepository.findNearby({
  latitude: 35.6762,
  longitude: 139.6503,
  maxDistanceKm: 50,
  region: 'ap-northeast',
});
```

### Multi-Region Database Strategy

**Current Implementation**: Single database with `region` field filtering.

**Future Options**:
1. **Sharded Cluster**: MongoDB sharding by region key
2. **Separate Databases**: Per-region database instances
3. **Federated Queries**: Cross-region federation for global features

To switch strategies, modify the repository layer without changing service logic.

## Feature Flags by Region

### Checking Feature Flags

```typescript
import { isFeatureEnabled, getRegionConfig } from './config';

// Check current region
if (isFeatureEnabled('verificationRequired')) {
  // Enforce verification
}

// Check specific region
const config = getRegionConfig(user.region);
if (config?.features.verificationRequired) {
  // This region requires verification
}
```

### Region-Specific Business Rules

```typescript
// In user creation
const regionConfig = getRegionConfig(data.region);

// Validate minimum age
if (userAge < regionConfig.rules.minimumAge) {
  throw new Error(`Must be at least ${regionConfig.rules.minimumAge} years old`);
}

// Set default search radius
user.preferences.maxDistance = regionConfig.rules.defaultSearchRadius;
```

## Geo-Aware Matching

### Profile Discovery

The matching system respects:
1. **Region filtering**: Users only see profiles in their region (default)
2. **Distance limits**: Per-region maximum distance
3. **Verification requirements**: Some regions require verified profiles

```typescript
const profiles = await userRepository.findNearby({
  latitude: user.location.coordinates[1],
  longitude: user.location.coordinates[0],
  maxDistanceKm: user.preferences.maxDistance,
  region: user.region,
  // Verification filter applied automatically if region requires it
});
```

### Cross-Region Matching

To enable cross-region matching (future feature):
```yaml
# config/regions/global.yml
matching:
  allowCrossRegion: true
  crossRegionRadiusKm: 1000
```

## Adding a New Region

### 1. Create Region Config File

```bash
cp config/regions/us-east.yml config/regions/ap-southeast.yml
```

Edit the file with region-specific settings.

### 2. Update Environment Variables

Add region-specific endpoints to `.env`:
```env
MONGODB_URI_AP_SOUTHEAST=mongodb://...
REDIS_URL_AP_SOUTHEAST=redis://...
```

### 3. Deploy Region Infrastructure

(Human operators should provision):
- Database cluster or replica
- Redis cache instance
- Media storage bucket
- CDN edge location

### 4. Update Deployment

Set the `REGION` environment variable for services in that region:
```env
REGION=ap-southeast
```

## Infrastructure Diagram

```
                     ┌─────────────────┐
                     │  Global DNS /   │
                     │  Load Balancer  │
                     └────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   US-EAST     │    │   EU-WEST     │    │  AP-NORTHEAST │
│   Region      │    │   Region      │    │   Region      │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ • API Servers │    │ • API Servers │    │ • API Servers │
│ • MongoDB     │    │ • MongoDB     │    │ • MongoDB     │
│ • Redis       │    │ • Redis       │    │ • Redis       │
│ • S3 Bucket   │    │ • S3 Bucket   │    │ • S3 Bucket   │
└───────────────┘    └───────────────┘    └───────────────┘
```

## Compliance Considerations

### Data Residency

Region configs can enforce data residency:
- EU users' data stays in EU region
- Japan users' data stays in AP-Northeast
- Cross-region replication must be configured carefully

### Age Requirements

Different regions may have different minimum ages:
```yaml
# EU region
rules:
  minimumAge: 18

# Some regions might require 21
rules:
  minimumAge: 21
```

### Verification Requirements

Some regions require stricter verification:
```yaml
# AP-Northeast (stricter)
features:
  verificationRequired: true
  verificationStrictMode: true
```

## Testing Multi-Region

### Unit Tests

Test region-aware logic with mocked configs:
```typescript
describe('Region-aware matching', () => {
  it('should only return users from same region', async () => {
    // Create users in different regions
    // Query should only return same-region users
  });
});
```

### Integration Tests

Simulate users in different regions:
```typescript
// Create test users
const usUser = await createUser({ region: 'us-east' });
const jpUser = await createUser({ region: 'ap-northeast' });

// US user should not see JP user
const matches = await matchService.discover(usUser.id);
expect(matches.find(m => m.id === jpUser.id)).toBeUndefined();
```
