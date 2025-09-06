"use client";

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { CrudEntity } from '@/hooks/use-crud';
import { ColumnConfig } from '@/lib/column-configs';

export interface CrudTableConfig<T extends CrudEntity> {
  columns: ColumnConfig<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  entityName: string; // 'user', 'post', 'follow'
}

interface CrudTableProps<T extends CrudEntity> {
  data: T[];
  config: CrudTableConfig<T>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  loading?: boolean;
}

export function CrudTable<T extends CrudEntity>({
  data,
  config,
  onEdit,
  onDelete,
  onView,
  loading = false,
}: CrudTableProps<T>) {
  // Generate columns based on configuration
  const columns: ColumnDef<T>[] = [
    // Dynamic columns based on config
    ...config.columns.map((col): ColumnDef<T> => ({
      accessorKey: col.key as string,
      header: col.header,
      cell: ({ row }) => {
        const value = row.getValue(col.key as string);
        
        // Custom render function takes precedence
        if (col.render) {
          return col.render(value, row.original);
        }
        
        // Handle different column types
        switch (col.type) {
          case 'date':
            const date = new Date(value as string | number | Date);
            return <div>{date.toLocaleDateString()}</div>;
            
          case 'number':
            return <div className="text-center">{String(value)}</div>;
            
          case 'badge':
            const variant = col.badgeVariant ? col.badgeVariant(value) : 'secondary';
            return (
              <Badge variant={variant}>
                {String(value)}
              </Badge>
            );
            
          case 'text':
          default:
            return <div className="font-medium">{String(value)}</div>;
        }
      },
    })),
    
    // Actions column (always last)
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={() => onView(item)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit {config.entityName}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {config.entityName}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey={config.searchKey as string}
      searchPlaceholder={config.searchPlaceholder || `Search ${config.entityName}s...`}
    />
  );
}
