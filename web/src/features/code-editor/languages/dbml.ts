import { Monaco } from '@monaco-editor/react';

/**
 * Register the DBML language in Monaco Editor
 * DBML (Database Markup Language) is a simple, readable DSL language designed to define database structures
 */
export const registerDBMLLanguage = (monaco: Monaco) => {
  // Register the language
  monaco.languages.register({ id: 'dbml' });

  // Define the tokenizer rules for syntax highlighting
  monaco.languages.setMonarchTokensProvider('dbml', {
    defaultToken: 'invalid',

    // Keywords in DBML
    keywords: [
      'Table',
      'Project',
      'Ref',
      'Enum',
      'TableGroup',
      'Note',
      'pk',
      'primary',
      'key',
      'unique',
      'not',
      'null',
      'increment',
      'ref',
      'database_type',
      'note'
    ],

    // Data types in DBML
    typeKeywords: [
      'int',
      'integer',
      'serial',
      'varchar',
      'text',
      'decimal',
      'timestamp',
      'date',
      'time',
      'boolean',
      'float',
      'double'
    ],

    // Operators
    operators: ['<', '>', ':', '-', '+'],

    // Symbols
    symbols: /[=><!~?:&|+\-*]+/,

    // Escapes
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // Main tokenizer
    tokenizer: {
      root: [
        // Comments
        [/\/\/.*$/, 'comment'],

        // Keywords (Table, Project, Ref, etc.)
        [/\b(?:Table|Project|Ref|Enum|TableGroup|Note)\b/, 'keyword'],

        // Data types
        [
          /\b(?:int|integer|serial|varchar|text|decimal|timestamp|date|time|boolean|float|double)\b/,
          'type'
        ],

        // Constraints
        [/\b(?:pk|primary|key|unique|not|null|increment|ref)\b/, 'keyword.constraint'],

        // Identifiers (table/column names)
        [/[a-zA-Z_]\w*/, 'identifier'],

        // Brackets
        [/[{}()[\]]/, '@brackets'],

        // Numbers
        [/\d+/, 'number'],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-terminated string
        [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-terminated string
        [/"/, 'string', '@string_double'],
        [/'/, 'string', '@string_single'],

        // Operators
        [/[<>:]/, 'operator'],

        // Whitespace
        [/[ \t\r\n]+/, 'white']
      ],

      string_double: [
        [/[^\\"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, 'string', '@pop']
      ],

      string_single: [
        [/[^\\']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/'/, 'string', '@pop']
      ]
    }
  });
};
