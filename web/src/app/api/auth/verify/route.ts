import { cookies } from 'next/headers';

const externalUrl = `${process.env.REST_API_BASE_URL}/api/v1/auth/verify`;

export async function POST(req: Request) {
  const { email, code } = await req.json();
  try {
    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: code, email: email })
    });
    if (!res.ok) {
      let errorMessage = 'Failed to verify user';

      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      }

      return Response.json({ error: errorMessage }, { status: res.status });
    }

    const data = await res.json();
    cookies().set('auth', data.token, { secure: true, httpOnly: false });
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
