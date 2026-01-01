export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt, conversation_id, project_id } = await req.json();
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/dbml-ai-agent/stream`;

  try {
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        conversation_id: conversation_id,
        project_id: project_id
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(errorText, { status: response.status });
    }

    // Get the response as a stream
    const responseBody = response.body;
    if (!responseBody) {
      return new Response(JSON.stringify({ error: 'Stream not available' }), { status: 500 });
    }

    // Simply pass through the stream without transformation
    return new Response(responseBody, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
