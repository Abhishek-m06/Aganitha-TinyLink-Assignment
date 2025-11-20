import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Fetch the link
    const result = await sql`
      SELECT target_url
      FROM links
      WHERE code = ${code}
    `;

    if (result.length === 0) {
      return new NextResponse('Link not found', { status: 404 });
    }

    const targetUrl = result[0].target_url;

    // Update click count and last clicked time
    await sql`
      UPDATE links
      SET total_clicks = total_clicks + 1,
          last_clicked_at = CURRENT_TIMESTAMP
      WHERE code = ${code}
    `;

    // Redirect with 302 status
    return NextResponse.redirect(targetUrl, 302);
  } catch (error) {
    console.error('Error processing redirect:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
