import { NextRequest, NextResponse } from 'next/server';

const BACKEND_GRAPHQL_URI = process.env.NEXT_PUBLIC_GRAPHQL_URI;

/** Proxy GraphQL requests to the backend to avoid CORS (e.g. multipart uploads). */
export async function POST(request: NextRequest) {
  if (!BACKEND_GRAPHQL_URI) {
    return NextResponse.json(
      { errors: [{ message: 'GraphQL backend URL not configured' }] },
      { status: 500 }
    );
  }

  try {
    const body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type') ?? '';
    const authorization = request.headers.get('authorization');
    const apolloPreflight = request.headers.get('apollo-require-preflight');

    const headers: HeadersInit = {
      'Content-Type': contentType,
    };
    if (authorization) headers['Authorization'] = authorization;
    if (apolloPreflight) headers['Apollo-Require-Preflight'] = apolloPreflight;

    const response = await fetch(BACKEND_GRAPHQL_URI, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return NextResponse.json(
      { errors: [{ message: 'Proxy request failed' }] },
      { status: 500 }
    );
  }
}
