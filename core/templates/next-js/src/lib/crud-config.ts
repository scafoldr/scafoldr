import { CrudEntity } from '@/hooks/use-crud';
import { CrudTableConfig } from '@/components/crud-table';
import { CrudFormConfig } from '@/components/crud-form';

export interface CrudPageConfig<T extends CrudEntity> {
  // Basic configuration
  entityName: string; // 'User', 'Post', 'Follow'
  entityNamePlural: string; // 'Users', 'Posts', 'Follows'
  description: string;
  
  // API configuration
  crudConfig: {
    entityName: string;
    entityNamePlural: string;
    apiEndpoint: string;
  };
  
  // Table configuration
  tableConfig: CrudTableConfig<T>;
  
  // Form configuration
  formConfig: CrudFormConfig;
  
  // Optional filters
  defaultFilters?: Record<string, any>;
}

// Helper function to create page configurations
export function createCrudPageConfig<T extends CrudEntity>(
  config: CrudPageConfig<T>
): CrudPageConfig<T> {
  return config;
}