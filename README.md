# TiniLink - URL Shortener

A modern URL shortener web application built with Next.js, TypeScript, and Neon Postgres. Similar to bit.ly, TiniLink allows users to shorten URLs, track click statistics, and manage links.

## Features

- **Create Short Links**: Convert long URLs into short, shareable links with optional custom codes
- **Click Tracking**: Monitor total clicks and last clicked timestamp for each link
- **Link Management**: View, search, filter, and delete links from an intuitive dashboard
- **Statistics Page**: Detailed stats for individual links
- **Automatic Redirect**: Short links redirect users to target URLs with HTTP 302
- **Responsive Design**: Clean, mobile-friendly interface built with Tailwind CSS
- **Health Check**: API endpoint for monitoring system status

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Neon Postgres (Serverless)
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon Postgres database (free tier available at [neon.tech](https://neon.tech))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd TiniLinkAssignment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```bash
DATABASE_URL=postgresql://username:password@host/database
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Replace the `DATABASE_URL` with your Neon Postgres connection string.

4. Initialize the database:

The application will automatically create the required table on first API call. Alternatively, you can manually run:

```sql
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Application Structure

### Pages & Routes

| Path | Purpose | Auth |
|------|---------|------|
| `/` | Dashboard (list, add, delete links) | Public |
| `/code/:code` | Stats page for a single link | Public |
| `/:code` | Redirect to target URL (302) | Public |
| `/healthz` | Health check endpoint | Public |

### API Endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| `POST` | `/api/links` | Create a new short link | `201` - Link created, `409` - Code exists |
| `GET` | `/api/links` | List all links | `200` - Array of links |
| `GET` | `/api/links/:code` | Get stats for one link | `200` - Link details, `404` - Not found |
| `DELETE` | `/api/links/:code` | Delete a link | `200` - Success, `404` - Not found |
| `GET` | `/healthz` | Health check | `200` - System status |

### Short Code Rules

- Format: `[A-Za-z0-9]{6,8}` (6-8 alphanumeric characters)
- Globally unique across all users
- Custom codes are optional; random codes generated if not provided
- Duplicate codes return `409 Conflict`

## Key Features

### Dashboard
- Table view of all links with short code, target URL, clicks, and last clicked time
- Add new links with optional custom codes
- Delete existing links
- Search/filter by code or URL
- Copy short URL to clipboard
- Empty, loading, and error states

### Stats Page
- Detailed view of a single link
- Display short code, short URL, and target URL
- Total clicks counter
- Created and last clicked timestamps
- Copy buttons for easy sharing
- Delete link option

### Redirect
- `/:code` performs HTTP 302 redirect to target URL
- Increments click count
- Updates last clicked timestamp
- Returns 404 if link doesn't exist

### Form UX
- Inline URL validation
- Custom code format validation (6-8 alphanumeric)
- Friendly error messages
- Disabled submit during loading
- Success confirmation messages

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables:
   - `DATABASE_URL`: Your Neon Postgres connection string
   - `NEXT_PUBLIC_BASE_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`)
4. Deploy!

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy!

### Deploy to Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add a PostgreSQL database
4. Set environment variables
5. Deploy!

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string from Neon
- `NEXT_PUBLIC_BASE_URL`: Base URL of your application (used for generating short links)

## Testing

The application follows standard URL conventions for automated testing:

- Health check returns 200 at `/healthz`
- Creating links with duplicate codes returns 409
- Redirects work and increment click count
- Deleting links stops redirects (404)
- UI includes proper validation, loading states, and error handling

## Project Structure

```
TiniLinkAssignment/
├── app/
│   ├── api/
│   │   └── links/
│   │       ├── route.ts          # POST /api/links, GET /api/links
│   │       └── [code]/
│   │           └── route.ts      # GET/DELETE /api/links/:code
│   ├── code/
│   │   └── [code]/
│   │       └── page.tsx          # Stats page
│   ├── healthz/
│   │   └── route.ts              # Health check
│   ├── [code]/
│   │   └── route.ts              # Redirect handler
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard
│   └── globals.css               # Global styles
├── lib/
│   └── db.ts                     # Database connection
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Design Decisions

1. **Next.js App Router**: Modern approach with built-in API routes and server components
2. **Neon Serverless Postgres**: Free tier, no cold starts, perfect for this use case
3. **Tailwind CSS**: Utility-first CSS for rapid, consistent UI development
4. **Client-side Fetching**: Simple state management for this application size
5. **No Authentication**: As per requirements, all pages are public

## Future Enhancements

- User authentication and per-user link management
- Custom domains for short links
- QR code generation
- Link expiration dates
- Analytics dashboard with charts
- Bulk import/export
- API rate limiting

## License

MIT

## Author

Built as part of the TiniLink assignment.
