import { Agent } from '@strands-agents/sdk';
import { OpenAIModel } from '@strands-agents/sdk/openai';
import { validateDbmlTool } from './tools/validate-dbml';

export const dynamic = 'force-dynamic';
// export const runtime = 'edge';

const SOFTWARE_ARCHITECT_SYSTEM_PROMPT = `You are an expert software architect specializing in database design and DBML (Database Markup Language) code generation.

Your primary responsibilities:
1. Analyze requirements and create well-structured database schemas
2. Generate clean, maintainable DBML code that follows best practices
3. Use the validate_dbml tool to ensure all generated DBML code is syntactically correct
4. Provide explanations for your design decisions
5. Consider relationships, constraints, and data integrity
6. Follow naming conventions and database design principles

When generating DBML code:
- Always validate your DBML using the validate_dbml tool before presenting it
- Include appropriate table relationships and foreign keys
- Use meaningful table and column names
- Add comments to explain complex relationships
- Consider indexing strategies for performance
- Ensure data types are appropriate for the use case

If validation fails, analyze the error and correct the DBML code before presenting the final result.`;

export async function POST(req: Request) {
  const { prompt, conversation_id, project_id } = await req.json();

  try {
    const model = new OpenAIModel({
      apiKey: process.env.OPENAI_API_KEY,
      modelId: process.env.OPENAI_API_MODEL,
      maxTokens: 4000,
      temperature: 0.7
    });

    const agent = new Agent({
      systemPrompt: SOFTWARE_ARCHITECT_SYSTEM_PROMPT,
      model: model,
      tools: [validateDbmlTool]
    });

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial metadata
          const metadata = {
            type: 'metadata',
            conversation_id,
            project_id,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // Stream agent events
          for await (const event of agent.stream(prompt)) {
            // Handle different event types for SSE
            let eventData: Record<string, unknown> = {
              type: 'agent_event',
              event_type: event.type,
              timestamp: new Date().toISOString()
            };

            // Extract text content from model events
            if (event.type === 'modelContentBlockDeltaEvent' && event.delta.type === 'textDelta') {
              eventData = {
                type: 'text_delta',
                content: event.delta.text,
                timestamp: new Date().toISOString()
              };
            }
            // Handle tool stream events
            else if (event.type === 'toolStreamEvent') {
              eventData = {
                type: 'tool_stream',
                data: event.data,
                timestamp: new Date().toISOString()
              };
            }
            // Handle tool use events
            else if (
              event.type === 'modelContentBlockStartEvent' &&
              event.start?.type === 'toolUseStart'
            ) {
              eventData = {
                type: 'tool_start',
                tool_name: event.start.name,
                tool_input: event.start.toolUseId,
                timestamp: new Date().toISOString()
              };
            }
            // Handle completion events
            else if (event.type === 'afterInvocationEvent') {
              eventData = {
                type: 'completion',
                timestamp: new Date().toISOString()
              };
            } else {
              continue; // Skip unhandled event types
            }

            // Send the event as SSE
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(eventData)}\n\n`));
          }

          // Send completion signal
          const completionEvent = {
            type: 'stream_end',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
        } catch (error) {
          console.error('Error in agent stream:', error);
          const errorEvent = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Error setting up agent stream:', error);
    return new Response(
      JSON.stringify({
        error: 'Error setting up agent stream',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
