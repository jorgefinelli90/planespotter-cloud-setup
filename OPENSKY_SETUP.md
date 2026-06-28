# OpenSky Network Integration Setup

This guide explains how to configure PlaneSpotter Cloud to use real aircraft data from OpenSky Network.

## Prerequisites

- OpenSky Network account (free at https://opensky-network.org/user/login)
- PlaneSpotter Cloud running locally or deployed

## Step 1: Create OpenSky Account

1. Visit https://opensky-network.org/user/login
2. Click "Sign Up"
3. Fill in username, email, password
4. Confirm email address
5. Your OpenSky username and password are now ready

## Step 2: Configure Environment Variables

### For Local Development

1. Copy the example file:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your credentials:
```
OPENSKY_USERNAME=your_opensky_username
OPENSKY_PASSWORD=your_opensky_password
OPENSKY_API_URL=https://opensky-network.org/api
```

3. Save the file (it's in `.gitignore`, not committed)

### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add three variables:
   - `OPENSKY_USERNAME` → your username
   - `OPENSKY_PASSWORD` → your password
   - `OPENSKY_API_URL` → https://opensky-network.org/api
4. Redeploy your project

## Step 3: Verify Configuration

### Test Locally

```bash
# Start development server
pnpm dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/dashboard | jq .data.aircraft

# Should return array of aircraft with:
# - id, icao24, callsign
# - latitude, longitude, altitude
# - groundSpeed, trueTrack, verticalRate
# - onGround, squawk, timestamp
```

### Check Logs

If configured correctly, you'll see logs like:
```
[INFO] Aircraft service created (provider: opensky)
[INFO] Initializing OpenSky provider
[INFO] OpenSky provider initialized successfully
[DEBUG] Fetching aircraft data from OpenSky
[INFO] Aircraft data fetched successfully (count: 2150, duration: 245ms)
```

## Step 4: Using Aircraft Data

The `/api/dashboard` endpoint now returns:

```json
{
  "success": true,
  "data": {
    "dashboard": { /* ... */ },
    "services": {
      "aircraft": {
        "status": "healthy",
        "name": "opensky",
        "aircraftCount": 2150,
        "lastUpdate": "2024-01-15T10:30:00.000Z"
      }
    },
    "aircraft": [
      {
        "id": "a1b2c3",
        "icao24": "a1b2c3",
        "callsign": "UAL123",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "altitude": 35000,
        "groundSpeed": 450,
        "trueTrack": 180,
        "verticalRate": 0,
        "onGround": false,
        "squawk": "1234",
        "timestamp": 1705315800000
      },
      // ... up to 100 aircraft
    ]
  }
}
```

## Data Available

Each aircraft includes:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique aircraft identifier (ICAO24) |
| icao24 | string | ICAO 24-bit address |
| callsign | string \| null | Flight callsign (e.g., "UAL123") |
| latitude | number | Aircraft latitude |
| longitude | number | Aircraft longitude |
| altitude | number | Altitude in meters |
| groundSpeed | number | Speed in m/s |
| trueTrack | number | Track heading in degrees |
| verticalRate | number | Climb/descent rate in m/s |
| onGround | boolean | Aircraft on ground? |
| squawk | string \| null | ICAO squawk code |
| timestamp | number | Last update timestamp (ms) |

## Troubleshooting

### "OpenSky credentials not configured"

**Problem:** Getting empty aircraft array
**Solution:** Check `.env.local` file exists and has correct:
- OPENSKY_USERNAME
- OPENSKY_PASSWORD

Restart dev server after changes.

### "OpenSky authentication failed (401)"

**Problem:** Status 401 in logs
**Solution:** 
- Verify username/password are correct at opensky-network.org
- Check credentials are copied exactly (no spaces)
- Try logging into OpenSky manually to confirm credentials

### "OpenSky rate limit exceeded (429)"

**Problem:** Getting 429 errors periodically
**Solution:**
- OpenSky free tier has rate limits
- Requests are limited to ~4000 per day
- Implement caching (coming in Sprint 7)
- Upgrade to OpenSky+ for higher limits

### No aircraft returned

**Problem:** Getting empty array consistently
**Solution:**
- Might be normal - if no aircraft over requested area
- Check health endpoint: `GET /api/health`
- Should show aircraft service as "healthy"
- Look for errors in logs

### "Network timeout"

**Problem:** API requests timing out
**Solution:**
- Check internet connection
- OpenSky API might be temporarily unavailable
- System returns valid empty response, no crashes
- Retries work automatically on next request

## Performance Notes

- First request takes 200-500ms (API call)
- Subsequent requests from cache (Sprint 7+)
- Typically 2000-5000 aircraft globally
- Response includes first 100 aircraft
- Full data available via database (future sprint)

## Security Best Practices

1. Never commit `.env.local` (it's in .gitignore)
2. Use environment variables, never hardcode
3. In Vercel, use the Environment Variables UI
4. Credentials never appear in logs
5. Use HTTPS in production
6. Rotate credentials periodically

## Testing with Mock Data

If you don't have OpenSky credentials, the system gracefully falls back:

```bash
# With no OPENSKY_USERNAME/PASSWORD set
curl http://localhost:3000/api/dashboard
→ Returns valid dashboard with empty aircraft
→ No errors
→ Service uses StubProvider
```

Perfect for development and testing without external dependencies.

## API Rate Limits

**Free Tier:**
- 4,000 requests per day
- ~2.8 requests per minute

**Recommendations:**
- Implement 5-minute cache (Sprint 7)
- Reduce fetch frequency if needed
- Consider OpenSky+ for higher limits

## Support

- OpenSky API docs: https://opensky-network.org/api/
- OpenSky support: support@opensky-network.org
- PlaneSpotter issues: Check project documentation

## Next Steps

After OpenSky is configured:
1. Add caching layer (Sprint 7)
2. Implement scheduler for periodic updates
3. Add more services (Weather, News, etc.)
4. Each uses same provider pattern
5. System scales without refactoring
