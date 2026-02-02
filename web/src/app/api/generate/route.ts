// app/api/generate/route.ts

export async function POST(req: Request) {
  const externalUrl = `${process.env.CORE_API_BASE_URL}/generate`;

  try {
    const { project_name, framework, project_id, dbml_code } = await req.json();

    const payload = {
      project_name,
      database_name: `${project_name.replace(' ', '_')}_db`, // auto-generate DB name
      backend_option: framework,
      user_input: dbml_code
    };

    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

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
    return Response.json(responseData);
  } catch (error) {
    console.error('Generate API error:', error);

    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
