export const dynamic = 'force-dynamic';

/**
 * Project-level code operations API
 *
 * GET: Fetch all files for a project (metadata only)
 * POST: Bulk save multiple files
 */

// GET handler to fetch all files for a project
export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  const projectId = params.projectId;
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/code/${projectId}`;

  try {
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch project files';

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      return Response.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Project files fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return Response.json(
      {
        error: 'Failed to fetch project files',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

// POST handler for bulk file operations
export async function POST(req: Request, { params }: { params: { projectId: string } }) {
  const projectId = params.projectId;
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/code/${projectId}/bulk`;

  try {
    // Get the request body
    const body = await req.json();

    // Forward the request to the FastAPI backend
    const response = await fetch(externalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to save files';

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      return Response.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Bulk save error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return Response.json(
      {
        error: 'Failed to save files',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
