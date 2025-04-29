export const runtime = 'edge';

export async function POST(req: Request) {
  const { userInput, conversationId } = await req.json();
  const externalUrl = `${process.env.CORE_API_BASE_URL}/generate-dbml-chat-stream`;

  const upstream = await fetch(externalUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_input: userInput,
      conversation_id: conversationId
    })
  });

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(err, { status: upstream.status });
  }

  if (!upstream.body) {
    return new Response('No stream from upstream', { status: 502 });
  }

  // create a new stream for the client
  const clientStream = new ReadableStream({
    async pull(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          controller.enqueue(value);
        }
      } catch (err) {
        controller.error(err);
      }
    },
    cancel(reason) {
      upstream.body!.cancel(reason);
    }
  });

  return new Response(clientStream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}
