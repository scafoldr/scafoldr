// Field configuration helpers for CRUD forms
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
}

// Predefined field configurations for common patterns
export const commonFields = {
  text: (name: string, label: string, required = true): FieldConfig => ({
    name,
    label,
    type: 'text',
    placeholder: `Enter ${label.toLowerCase()}`,
    required,
  }),

  textarea: (name: string, label: string, required = true): FieldConfig => ({
    name,
    label,
    type: 'textarea',
    placeholder: `Enter ${label.toLowerCase()}`,
    required,
  }),

  select: (
    name: string, 
    label: string, 
    options: { value: string | number; label: string }[],
    required = true
  ): FieldConfig => ({
    name,
    label,
    type: 'select',
    options,
    required,
  }),

  number: (name: string, label: string, required = true): FieldConfig => ({
    name,
    label,
    type: 'number',
    placeholder: `Enter ${label.toLowerCase()}`,
    required,
  }),

  email: (name: string, label: string = 'Email', required = true): FieldConfig => ({
    name,
    label,
    type: 'email',
    placeholder: 'Enter email address',
    required,
  }),
};