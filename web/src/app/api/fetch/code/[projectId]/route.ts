export async function GET(req: Request, { params }: { params: { projectId: string } }) {
  const projectId = params.projectId;
  const externalUrl = `${process.env.CORE_API_BASE_URL}/api/code/${projectId}/bulk`;

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
