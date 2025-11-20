# API Testing Guide

This document provides examples for testing all TiniLink API endpoints.

## Base URL

Local: `http://localhost:3000`
Production: `https://your-app.vercel.app`

## Health Check

### GET /healthz

Check if the service is running.

```bash
curl http://localhost:3000/healthz
```

Expected Response (200 OK):
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": "125s",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Links API

### POST /api/links

Create a new short link.

**With Custom Code:**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://github.com",
    "customCode": "github"
  }'
```

**With Auto-Generated Code:**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://google.com"
  }'
```

Expected Response (201 Created):
```json
{
  "id": 1,
  "code": "github",
  "target_url": "https://github.com",
  "total_clicks": 0,
  "last_clicked_at": null,
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

**Error Cases:**

Invalid URL (400 Bad Request):
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"targetUrl": "not-a-url"}'
```

Invalid Custom Code (400 Bad Request):
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://example.com",
    "customCode": "abc"
  }'
```
Response: `{"error": "Custom code must be 6-8 alphanumeric characters"}`

Duplicate Code (409 Conflict):
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "targetUrl": "https://example.com",
    "customCode": "github"
  }'
```
Response: `{"error": "Custom code already exists"}`

### GET /api/links

List all links.

```bash
curl http://localhost:3000/api/links
```

Expected Response (200 OK):
```json
[
  {
    "id": 2,
    "code": "abc123",
    "target_url": "https://example.com",
    "total_clicks": 5,
    "last_clicked_at": "2024-01-15T10:35:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 1,
    "code": "github",
    "target_url": "https://github.com",
    "total_clicks": 0,
    "last_clicked_at": null,
    "created_at": "2024-01-15T10:25:00.000Z"
  }
]
```

### GET /api/links/:code

Get stats for a specific link.

```bash
curl http://localhost:3000/api/links/github
```

Expected Response (200 OK):
```json
{
  "id": 1,
  "code": "github",
  "target_url": "https://github.com",
  "total_clicks": 3,
  "last_clicked_at": "2024-01-15T10:35:00.000Z",
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

Not Found (404):
```bash
curl http://localhost:3000/api/links/nonexistent
```
Response: `{"error": "Link not found"}`

### DELETE /api/links/:code

Delete a link.

```bash
curl -X DELETE http://localhost:3000/api/links/github
```

Expected Response (200 OK):
```json
{
  "success": true
}
```

Not Found (404):
```bash
curl -X DELETE http://localhost:3000/api/links/nonexistent
```
Response: `{"error": "Link not found"}`

## Redirect

### GET /:code

Redirect to target URL.

```bash
curl -L http://localhost:3000/github
```

This will:
1. Return HTTP 302 redirect
2. Increment click count
3. Update last_clicked_at timestamp
4. Redirect to target URL

**Test Without Following Redirect:**
```bash
curl -v http://localhost:3000/github
```

Expected Response:
- Status: 302 Found
- Location header: https://github.com

**Not Found:**
```bash
curl http://localhost:3000/nonexistent
```
Response: 404 Not Found

## Test Workflow

### Complete Test Sequence

1. **Health Check**
```bash
curl http://localhost:3000/healthz
```

2. **Create Link**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://example.com","customCode":"test123"}'
```

3. **List All Links**
```bash
curl http://localhost:3000/api/links
```

4. **Get Link Stats (0 clicks)**
```bash
curl http://localhost:3000/api/links/test123
```

5. **Use Redirect**
```bash
curl -v http://localhost:3000/test123
```

6. **Get Link Stats (1 click)**
```bash
curl http://localhost:3000/api/links/test123
```

7. **Delete Link**
```bash
curl -X DELETE http://localhost:3000/api/links/test123
```

8. **Verify Deletion (404)**
```bash
curl http://localhost:3000/test123
```

## Automated Testing Script

Create `test.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing TiniLink API..."

# Health check
echo "\n1. Health Check"
curl -s "$BASE_URL/healthz" | jq

# Create link
echo "\n2. Create Link"
curl -s -X POST "$BASE_URL/api/links" \
  -H "Content-Type: application/json" \
  -d '{"targetUrl":"https://example.com","customCode":"test123"}' | jq

# List links
echo "\n3. List All Links"
curl -s "$BASE_URL/api/links" | jq

# Get stats
echo "\n4. Get Link Stats"
curl -s "$BASE_URL/api/links/test123" | jq

# Use redirect
echo "\n5. Test Redirect"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/test123"

# Get updated stats
echo "\n6. Get Updated Stats"
curl -s "$BASE_URL/api/links/test123" | jq

# Delete link
echo "\n7. Delete Link"
curl -s -X DELETE "$BASE_URL/api/links/test123" | jq

# Verify deletion
echo "\n8. Verify Deletion"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/test123"

echo "\nTests complete!"
```

Run with:
```bash
chmod +x test.sh
./test.sh
```

## Edge Cases to Test

1. **Long URLs**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"targetUrl\":\"https://example.com/very/long/path/that/goes/on/and/on\"}"
```

2. **Special Characters in URL**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"targetUrl\":\"https://example.com?param=value&other=test\"}"
```

3. **Maximum Length Code (8 chars)**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"targetUrl\":\"https://example.com\",\"customCode\":\"abcd1234\"}"
```

4. **Minimum Length Code (6 chars)**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"targetUrl\":\"https://example.com\",\"customCode\":\"abc123\"}"
```

5. **Invalid Code Formats**
```bash
# Too short (5 chars) - should fail
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"targetUrl\":\"https://example.com\",\"customCode\":\"abc12\"}"

# Too long (9 chars) - should fail
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"targetUrl\":\"https://example.com\",\"customCode\":\"abcd12345\"}"

# Special characters - should fail
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d "{\"targetUrl\":\"https://example.com\",\"customCode\":\"abc-123\"}"
```

## Performance Testing

Test with Apache Bench:

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:3000/healthz

# POST requests (create links)
ab -n 50 -c 5 -p post.json -T application/json http://localhost:3000/api/links
```

Where `post.json` contains:
```json
{"targetUrl":"https://example.com"}
```

## Monitoring

Check logs:
```bash
# Vercel logs
vercel logs

# Local dev logs
# Check your terminal where npm run dev is running
```
