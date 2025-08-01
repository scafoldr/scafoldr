// app/api/generate/route.ts

export async function POST(req: Request) {
  const externalUrl = `${process.env.CORE_API_BASE_URL}/generate`;

  try {
    const { project_name, backend_option, features, user_input } = await req.json();

    const payload = {
      project_name,
      database_name: `${project_name.replace(' ', '_')}_db`, // auto-generate DB name
      backend_option,
      features,
      user_input
    };

    console.log('Sending request to:', externalUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Core API response status:', res.status);
    console.log('Core API response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      let errorMessage = 'Code generation failed';

      // Clone the response so we can try multiple read attempts
      const responseClone = res.clone();

      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        try {
          const errorText = await responseClone.text();
          errorMessage = errorText || errorMessage;
        } catch {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
      }

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const responseData = await res.json();
    console.log('Successfully received response data');
    return Response.json(responseData);
  } catch (error) {
    console.error('Generate API error:', error);

    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error types
      if (error.message.includes('fetch')) {
        errorMessage =
          'Unable to connect to core API service. Please ensure the backend is running.';
        statusCode = 503; // Service Unavailable
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Invalid request format';
        statusCode = 400; // Bad Request
      }
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
