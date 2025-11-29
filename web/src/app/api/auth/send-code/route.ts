const externalUrl = `${process.env.REST_API_BASE_URL}/api/v1/auth/send-code`;

export async function POST(req: Request) {
  const { email } = await req.json();
  try {
    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email })
    });
    if (!res.ok) {
      let errorMessage = 'Failed to save send code to user';

      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      }

      return Response.json({ error: errorMessage }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
