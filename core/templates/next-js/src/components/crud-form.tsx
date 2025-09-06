"use client";

import { useForm, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldConfig } from '@/lib/field-configs';

export interface CrudFormConfig {
  fields: FieldConfig[];
  schema: z.ZodSchema<any>;
  entityName: string;
}

interface CrudFormProps {
  config: CrudFormConfig;
  initialData?: Record<string, any>;
  onSubmit: (data: any) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function CrudForm({
  config,
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel,
}: CrudFormProps) {
  // Create default values for all fields to prevent uncontrolled/controlled input issues
  const getDefaultValues = () => {
    const defaults: Record<string, any> = {};
    config.fields.forEach(field => {
      if (initialData && initialData[field.name] !== undefined) {
        defaults[field.name] = initialData[field.name];
      } else {
        // Set appropriate default values based on field type
        switch (field.type) {
          case 'number':
            defaults[field.name] = '';
            break;
          case 'select':
            defaults[field.name] = '';
            break;
          default:
            defaults[field.name] = '';
        }
      }
    });
    return defaults;
  };

  const form = useForm({
    defaultValues: getDefaultValues(),
  });

  const handleSubmit = async (data: FieldValues) => {
    // Validate required fields
    const errors: string[] = [];
    config.fields.forEach(field => {
      if (field.required && (!data[field.name] || data[field.name] === '')) {
        errors.push(`${field.label} is required`);
      }
    });
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    await onSubmit(data);
  };

  const renderField = (field: FieldConfig) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as any}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {(() => {
                switch (field.type) {
                  case 'textarea':
                    return (
                      <Textarea
                        placeholder={field.placeholder}
                        {...formField}
                        value={formField.value || ''}
                        disabled={isLoading}
                      />
                    );

                  case 'select':
                    return (
                      <Select
                        onValueChange={formField.onChange}
                        value={formField.value || ''}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );

                  case 'number':
                    return (
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        {...formField}
                        value={formField.value || ''}
                        onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : '')}
                        disabled={isLoading}
                      />
                    );

                  case 'email':
                    return (
                      <Input
                        type="email"
                        placeholder={field.placeholder}
                        {...formField}
                        value={formField.value || ''}
                        disabled={isLoading}
                      />
                    );

                  case 'password':
                    return (
                      <Input
                        type="password"
                        placeholder={field.placeholder}
                        {...formField}
                        value={formField.value || ''}
                        disabled={isLoading}
                      />
                    );

                  case 'text':
                  default:
                    return (
                      <Input
                        placeholder={field.placeholder}
                        {...formField}
                        value={formField.value || ''}
                        disabled={isLoading}
                      />
                    );
                }
              })()}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {config.fields.map(renderField)}
        
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading 
              ? 'Saving...' 
              : submitLabel || `${initialData ? 'Update' : 'Create'} ${config.entityName}`
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
