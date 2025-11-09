export async function POST(req: Request) {
  const externalUrl = 'https://github.com/login/oauth/access_token';

  try {
    const { code } = await req.json();

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
      redirect_uri: process.env.REDIRECT_URI
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

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const responseData = await res.json();

    return Response.json(responseData);
  } catch (error) {
    console.error('GitHub OAuth route error:', error);

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
