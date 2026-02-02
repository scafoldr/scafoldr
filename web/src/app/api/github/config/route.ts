import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    if (!clientId) {
      return NextResponse.json({ error: 'GitHub client ID not configured' }, { status: 500 });
    }

    return NextResponse.json({
      clientId,
      redirectUri
    });
  } catch (error) {
    console.error('Error fetching GitHub config:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub configuration' }, { status: 500 });
  }
}
