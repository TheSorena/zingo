import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch video', { status: response.status });
    }

    // Get the original response headers
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      // Copy all headers except those that might cause CORS issues
      if (!['content-security-policy', 'x-frame-options'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    // Set CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Create a new response with the video data and modified headers
    const proxyResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });

    return proxyResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 