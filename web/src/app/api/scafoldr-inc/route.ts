export async function POST(req: Request) {
  const { userInput, conversationId, projectId } = await req.json();
  const externalUrl = `${process.env.CORE_API_BASE_URL}/scafoldr-inc/consult`;

  try {
    const res = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_input: userInput,
        conversation_id: conversationId,
        project_id: projectId
      })
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
