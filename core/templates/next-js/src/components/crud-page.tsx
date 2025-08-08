"use client";

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormModal } from '@/components/form-modal';
import { CrudTable, CrudTableConfig } from '@/components/crud-table';
import { CrudForm, CrudFormConfig } from '@/components/crud-form';
import { useCrud, CrudConfig, CrudEntity } from '@/hooks/use-crud';
import { toast } from 'sonner';

interface CrudPageConfig<T extends CrudEntity> {
  // Basic configuration
  entityName: string; // 'User', 'Post', 'Follow'
  entityNamePlural: string; // 'Users', 'Posts', 'Follows'
  description: string;
  
  // API configuration
  crudConfig: CrudConfig;
  
  // Table configuration
  tableConfig: CrudTableConfig<T>;
  
  // Form configuration
  formConfig: CrudFormConfig;
  
  // Optional filters
  defaultFilters?: Record<string, any>;
}

interface CrudPageProps<T extends CrudEntity> {
  config: CrudPageConfig<T>;
}

export function CrudPage<T extends CrudEntity>({ config }: CrudPageProps<T>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const {
    data,
    total,
    loading,
    refetch,
    create,
    update,
    delete: deleteItem,
    createLoading,
    updateLoading,
    deleteLoading,
  } = useCrud<T>(config.crudConfig, config.defaultFilters);

  const handleCreate = async (formData: any) => {
    const result = await create(formData);
    if (result) {
      setIsCreateModalOpen(false);
      refetch();
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedItem) return;
    
    const result = await update(selectedItem.id, formData);
    if (result) {
      setIsEditModalOpen(false);
      setSelectedItem(null);
      refetch();
    }
  };

  const handleDelete = async (item: T) => {
    if (window.confirm(`Are you sure you want to delete this ${config.entityName.toLowerCase()}?`)) {
      const result = await deleteItem(item.id);
      if (result) {
        refetch();
      }
    }
  };

  const handleEdit = (item: T) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleView = (item: T) => {
    toast.info(`Viewing ${config.entityName.toLowerCase()}: ${item.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{config.entityNamePlural}</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add {config.entityName}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All {config.entityNamePlural}</CardTitle>
          <CardDescription>
            Manage {config.entityNamePlural.toLowerCase()} in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CrudTable
            data={data}
            config={config.tableConfig}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Create Modal */}
      <FormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title={`Create New ${config.entityName}`}
        description={`Add a new ${config.entityName.toLowerCase()} to the system`}
      >
        <CrudForm
          config={config.formConfig}
          onSubmit={handleCreate}
          isLoading={createLoading}
        />
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title={`Edit ${config.entityName}`}
        description={`Update ${config.entityName.toLowerCase()} information`}
      >
        {selectedItem && (
          <CrudForm
            config={config.formConfig}
            initialData={selectedItem}
            onSubmit={handleUpdate}
            isLoading={updateLoading}
          />
        )}
      </FormModal>
    </div>
  );
}

// Helper function to create page configurations
export function createCrudPageConfig<T extends CrudEntity>(
  config: CrudPageConfig<T>
): CrudPageConfig<T> {
  return config;
}