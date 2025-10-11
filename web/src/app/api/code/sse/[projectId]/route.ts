export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events (SSE) proxy endpoint for real-time code updates
 *
 * This endpoint proxies SSE connections to the FastAPI backend,
 * maintaining a persistent connection for real-time updates.
 */
export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          // Use Node.js HTTP instead of  next's fetch (which doesn't support streaming well)
          const http = await import('http');
          const url = new URL(
            `${process.env.CORE_API_BASE_URL}/api/sse/code-updates/${params.projectId}`
          );

          const req = http.request(
            {
              hostname: url.hostname,
              port: url.port,
              path: url.pathname + url.search,
              method: 'GET',
              headers: {
                Accept: 'text/event-stream'
              }
            },
            (res) => {
              res.on('data', (chunk) => {
                controller.enqueue(chunk);
              });

              res.on('end', () => {
                controller.close();
              });

              res.on('error', (error) => {
                console.error('❌ HTTP response error:', error);
                controller.error(error);
              });
            }
          );

          req.on('error', (error) => {
            console.error('❌ HTTP request error:', error);
            controller.error(error);
          });

          req.end();
        } catch (error) {
          console.error('❌ Setup error:', error);
          controller.error(error);
        }
      }
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    }
  );
}
