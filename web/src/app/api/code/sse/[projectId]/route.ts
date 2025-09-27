export const dynamic = 'force-dynamic';
export const runtime = 'edge';

/**
 * Server-Sent Events (SSE) proxy endpoint for real-time code updates
 *
 * This endpoint proxies SSE connections to the FastAPI backend,
 * maintaining a persistent connection for real-time updates.
 */
export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  const projectId = params.projectId;
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/sse/code-updates/${projectId}`;

  try {
    // Forward the request to the FastAPI backend
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `SSE connection failed: ${errorText}` }), {
        status: response.status
      });
    }

    // Get the response as a stream
    const responseBody = response.body;
    if (!responseBody) {
      return new Response(JSON.stringify({ error: 'SSE stream not available' }), { status: 500 });
    }

    // Pass through the SSE stream with appropriate headers
    return new Response(responseBody, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable buffering for Nginx
      }
    });
  } catch (error) {
    console.error('SSE connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(
      JSON.stringify({
        error: 'Failed to establish SSE connection',
        message: errorMessage
      }),
      { status: 500 }
    );
  }
}
