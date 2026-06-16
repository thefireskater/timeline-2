import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'No blob token configured' }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Blob fetch failed: ${res.status}` }, { status: 502 });
    }

    const headers = new Headers();
    const contentType = res.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(res.body, { status: 200, headers });
  } catch (err) {
    console.error('[image proxy] Failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load image' },
      { status: 500 }
    );
  }
}
