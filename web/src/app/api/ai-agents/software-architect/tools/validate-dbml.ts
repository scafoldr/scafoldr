import { tool } from '@strands-agents/sdk';
import { Parser } from '@dbml/core';
import { z } from 'zod';
import { CompilerError } from '@dbml/core/types/parse/error';

/**
 * Tool for validating DBML (Database Markup Language) code
 * Uses @dbml/core Parser to validate DBML syntax and structure
 */
export const validateDbmlTool = tool({
  name: 'validate_dbml',
  description:
    'Validate DBML (Database Markup Language) code for syntax and structural correctness',
  inputSchema: z.object({
    dbml: z.string().describe('The DBML code to validate')
  }),
  callback: (input: { dbml: string }) => {
    try {
      // Create a new parser instance
      const parser = new Parser();

      // Attempt to parse the DBML code
      const database = parser.parse(input.dbml, 'dbml');
      console.log('Parsed database:', database);

      // If parsing succeeds, return success response with database info
      return {
        status: 'success',
        message: 'DBML code is valid',
        data: {
          tables: database.schemas[0]?.tables?.length || 0,
          enums: database.schemas[0]?.enums?.length || 0,
          refs: database.schemas[0]?.refs?.length || 0,
          tableGroups: database.schemas[0]?.tableGroups?.length || 0
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
