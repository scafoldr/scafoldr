// app/api/generate/route.js

export async function POST(req: Request) {
  const externalUrl = `${process.env.CORE_API_BASE_URL}/generate`;
  const { project_name, backend_option, features, user_input } = await req.json();

  const payload = {
    project_name,
    database_name: `${project_name.replace(' ', '_')}_db`, // auto-generate DB name
    backend_option,
    features,
    user_input
  };

  try {
    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(errorText, { status: res.status });
    }

    const responseData = await res.json();

    return Response.json(responseData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
