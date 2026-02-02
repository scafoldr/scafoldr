import { tool, ToolContext } from '@strands-agents/sdk';
import { Parser } from '@dbml/core';
import { z } from 'zod';
import { CompilerError } from '@dbml/core/types/parse/error';

/**
 * Tool for validating and saving DBML (Database Markup Language) code
 * Uses @dbml/core Parser to validate DBML syntax and structure
 * Saves valid DBML code to agent state for later retrieval
 */
export const validateAndSaveDbmlTool = tool({
  name: 'validate_and_save_dbml',
  description:
    'Validate DBML (Database Markup Language) code for syntax and structural correctness and save it to agent state',
  inputSchema: z.object({
    dbml: z.string().describe('The DBML code to validate and save')
  }),
  callback: (input: { dbml: string }, tool_context?: ToolContext) => {
    try {
      // Create a new parser instance
      const parser = new Parser();

      // Attempt to parse the DBML code
      const database = parser.parse(input.dbml, 'dbml');
      console.log('Parsed database:', database);

      // Save the valid DBML code to agent state if context is available
      if (tool_context) {
        tool_context.agent.state.set('dbml', input.dbml);
      }

      // If parsing succeeds, return success response with database info
      return {
        status: 'success',
        message: 'DBML code is valid and saved to agent state',
        data: {
          tables: database.schemas[0]?.tables?.length || 0,
          enums: database.schemas[0]?.enums?.length || 0,
          refs: database.schemas[0]?.refs?.length || 0,
          tableGroups: database.schemas[0]?.tableGroups?.length || 0,
          saved: !!tool_context
        },
        error: null
      };
    } catch (error: unknown) {
      console.log('Error during DBML parsing:', error);
      // If parsing fails, return error response with details
      const errorMessage =
        error && typeof error === 'object' && 'diags' in error
          ? (error as CompilerError).diags?.[0]?.message
          : 'Unknown parsing error';

      console.log('DBML parsing error:', errorMessage);

      return {
        status: 'error',
        message: 'DBML validation failed',
        error: errorMessage,
        data: null
      };
    }
  }
});
