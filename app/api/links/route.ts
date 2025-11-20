import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET /api/links - List all links
export async function GET() {
  try {
    const links = await sql`
      SELECT id, code, target_url, total_clicks, last_clicked_at, created_at
      FROM links
      ORDER BY created_at DESC
    `;

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUrl, customCode } = body;

    // Validate target URL
    if (!targetUrl || typeof targetUrl !== 'string') {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    let code = customCode;

    // Validate custom code if provided
    if (customCode) {
      if (typeof customCode !== 'string') {
        return NextResponse.json(
          { error: 'Custom code must be a string' },
          { status: 400 }
        );
      }

      // Check code format: [A-Za-z0-9]{6,8}
      if (!/^[A-Za-z0-9]{6,8}$/.test(customCode)) {
        return NextResponse.json(
          { error: 'Custom code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }

      // Check if code already exists
      const existing = await sql`
        SELECT code FROM links WHERE code = ${customCode}
      `;

      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'Custom code already exists' },
          { status: 409 }
        );
      }
    } else {
      // Generate a random 6-character code
      code = generateRandomCode();

      // Ensure it doesn't exist (very unlikely but check anyway)
      let attempts = 0;
      while (attempts < 10) {
        const existing = await sql`
          SELECT code FROM links WHERE code = ${code}
        `;

        if (existing.length === 0) break;

        code = generateRandomCode();
        attempts++;
      }

      if (attempts === 10) {
        return NextResponse.json(
          { error: 'Failed to generate unique code' },
          { status: 500 }
        );
      }
    }

    // Insert the new link
    const result = await sql`
      INSERT INTO links (code, target_url)
      VALUES (${code}, ${targetUrl})
      RETURNING id, code, target_url, total_clicks, last_clicked_at, created_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
