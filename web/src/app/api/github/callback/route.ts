import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) {
    return new Response('No Code');
  }

  const access_token = await generateAccessToken(code);

  cookies().set('access_token', access_token, { secure: true, httpOnly: true });
  return NextResponse.redirect(new URL('/github/auth-success', 'http://localhost:80'));
}

const generateAccessToken = async (code: string) => {
  const externalUrl = 'https://github.com/login/oauth/access_token';

  try {
    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing code parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    };

    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let errorMessage = 'OAuth token exchange failed';
      try {
        const errorData = await res.json();
        errorMessage = errorData.error_description || errorMessage;
      } catch {
        errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      }

      return new Error(JSON.stringify({ error: errorMessage }));
    }

    const responseData = await res.json();

    return responseData.access_token;
  } catch (error) {
    console.error('GitHub OAuth route error:', error);

    return new Error(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
