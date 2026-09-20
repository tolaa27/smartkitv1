import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Resilient Server-Side Edge & Google TTS Audio Proxy for Khmer (km-KH)
 * Receives { text: string, voice?: string } via POST or ?text=... via GET
 * Streams neural / proxied Khmer MP3 audio buffer directly to client
 * Caches with Cache-Control: public, max-age=604800, immutable to relieve latency & eliminate 404s
 */
async function handleTTS(text: string | null | undefined, _voice: string = 'km-KH-PisethNeural') {
  if (!text || typeof text !== 'string') {
    return NextResponse.json(
      { success: false, message: 'Text parameter is required.' },
      { status: 400 }
    );
  }

  const cleanText = text.trim().slice(0, 300);
  if (!cleanText) {
    return NextResponse.json(
      { success: false, message: 'Text parameter cannot be empty.' },
      { status: 400 }
    );
  }

  try {
    // Primary Upstream: Google Translate Khmer TTS stream (client=tw-ob)
    const encoded = encodeURIComponent(cleanText);
    const upstreamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=km&client=tw-ob`;

    const upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
        Accept: 'audio/mpeg, audio/*, */*',
        'Accept-Language': 'km,en-US;q=0.9,en;q=0.8',
        Referer: 'https://translate.google.com/',
      },
      next: { revalidate: 604800 }, // Next.js edge data cache 7 days
    });

    if (!upstreamResponse.ok) {
      throw new Error(`Upstream TTS failed with HTTP status ${upstreamResponse.status}`);
    }

    const audioBuffer = await upstreamResponse.arrayBuffer();

    if (!audioBuffer || audioBuffer.byteLength < 100) {
      throw new Error('Received truncated audio buffer from upstream TTS');
    }

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown upstream error';
    console.error('Server TTS proxy error:', errMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'Upstream Khmer voice synthesis unavailable.',
        fallbackToClient: true,
        error: errMessage,
      },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return handleTTS(body.text, body.voice);
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request payload' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get('text');
  const voice = searchParams.get('voice') || 'km-KH-PisethNeural';
  return handleTTS(text, voice);
}
