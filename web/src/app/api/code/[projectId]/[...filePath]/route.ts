export const dynamic = 'force-dynamic';

/**
 * File-level code operations API
 *
 * GET: Fetch specific file content
 * POST: Update file content
 * DELETE: Delete file
 */

// Helper to construct the file path from the array segments
function getFilePathFromParams(filePathSegments: string[]): string {
  return filePathSegments.join('/');
}

// GET handler to fetch a specific file
export async function GET(
  req: Request,
  { params }: { params: { projectId: string; filePath: string[] } }
) {
  const projectId = params.projectId;
  const filePath = getFilePathFromParams(params.filePath);
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/code/${projectId}/${filePath}`;

  try {
    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch file';

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
    console.error('File fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return Response.json(
      {
        error: 'Failed to fetch file',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

// POST handler to update a file
export async function POST(
  req: Request,
  { params }: { params: { projectId: string; filePath: string[] } }
) {
  const projectId = params.projectId;
  const filePath = getFilePathFromParams(params.filePath);
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/code/${projectId}/${filePath}`;

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
      let errorMessage = 'Failed to save file';

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
    console.error('File save error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return Response.json(
      {
        error: 'Failed to save file',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a file
export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; filePath: string[] } }
) {
  const projectId = params.projectId;
  const filePath = getFilePathFromParams(params.filePath);
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/code/${projectId}/${filePath}`;

  try {
    const response = await fetch(externalUrl, {
      method: 'DELETE',
      headers: {
        // Forward authorization if present
        ...(req.headers.get('Authorization')
          ? { Authorization: req.headers.get('Authorization')! }
          : {})
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete file';

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
    console.error('File delete error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return Response.json(
      {
        error: 'Failed to delete file',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}
