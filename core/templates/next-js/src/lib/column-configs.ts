// Column configuration helpers for CRUD tables
export interface ColumnConfig<T = any> {
  key: keyof T;
  header: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'custom';
  searchable?: boolean;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  badgeVariant?: (value: any) => 'default' | 'secondary' | 'destructive' | 'outline';
}

// Predefined column configurations for common patterns
export const commonColumns = {
  id: (): ColumnConfig => ({
    key: 'id' as any,
    header: 'ID',
    type: 'number',
  }),
  
  createdAt: (): ColumnConfig => ({
    key: 'createdAt' as any,
    header: 'Created',
    type: 'date',
  }),
  
  text: (key: string, header: string): ColumnConfig => ({
    key: key as any,
    header,
    type: 'text',
    searchable: true,
  }),
  
  number: (key: string, header: string): ColumnConfig => ({
    key: key as any,
    header,
    type: 'number',
  }),
  
  badge: (
    key: string,
    header: string,
    variantFn?: (value: any) => 'default' | 'secondary' | 'destructive' | 'outline'
  ): ColumnConfig => ({
    key: key as any,
    header,
    type: 'badge',
    badgeVariant: variantFn,
  }),
  
  custom: (
    key: string,
    header: string,
    renderFn: (value: any, row: any) => React.ReactNode
  ): ColumnConfig => ({
    key: key as any,
    header,
    type: 'custom',
    render: renderFn,
  }),
};