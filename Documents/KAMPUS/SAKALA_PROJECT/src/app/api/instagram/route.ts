import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postUrl = searchParams.get('url');

  if (!postUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Extract shortcode: /p/CODE/ or /reel/CODE/ or /reels/CODE/
    const match = postUrl.match(/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Format URL Instagram tidak valid (harus ada /p/ atau /reel/)' }, { status: 400 });
    }

    const shortcode = match[1];
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/`;

    // Fetch directly without UA so Instagram sends pre-rendered SSR HTML
    const res = await fetch(embedUrl, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Gagal memuat halaman Instagram' }, { status: 404 });
    }

    const html = await res.text();

    // 1. Extract post media photo (t51.82787-15 is Instagram's feed photo marker)
    let imageUrl = '';
    const regex = /https:\/\/[^"'\s\\]*(?:fbcdn\.net|cdninstagram\.com)\/[^"'\s\\]*t51\.82787-15\/[^"'\s\\]*/gi;
    const matches = [...html.matchAll(regex)].map(m => m[0].replace(/&amp;/g, '&'));
    
    if (matches.length > 0) {
      imageUrl = matches[0];
    } else {
      // Fallback to any non-resource image
      const fallbackRegex = /https:\/\/[^"'\s\\]*(?:fbcdn\.net|cdninstagram\.com)\/[^"'\s\\]*(?:\.jpg|\.webp)[^"'\s\\]*/gi;
      const fallbackMatches = [...html.matchAll(fallbackRegex)]
        .map(m => m[0].replace(/&amp;/g, '&'))
        .filter(u => !u.includes('/rsrc.php/'));
      if (fallbackMatches.length > 0) {
        imageUrl = fallbackMatches[0];
      }
    }

    return NextResponse.json({
      success: true,
      shortcode,
      post_url: `https://www.instagram.com/p/${shortcode}/`,
      image_url: imageUrl,
      caption: `Postingan Instagram (@sakala_ina)`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching Instagram post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
