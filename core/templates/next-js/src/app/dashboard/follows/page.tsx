"use client";

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormModal } from '@/components/form-modal';
import { CrudTable } from '@/components/crud-table';
import { CrudForm, CrudFormConfig } from '@/components/crud-form';
import { useCrud } from '@/hooks/use-crud';
import { followCrudConfig } from '@/features/follows/config';
import { FollowWithUsers } from '@/features/follows/types';
import { toast } from 'sonner';

export default function FollowsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FollowWithUsers | null>(null);
  const [formConfig, setFormConfig] = useState<CrudFormConfig>(followCrudConfig.formConfig);
  const [usersLoaded, setUsersLoaded] = useState(false);

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
  } = useCrud<FollowWithUsers>(followCrudConfig.crudConfig, followCrudConfig.defaultFilters);

  // Fetch users and populate form options
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users for follows form...');
        const response = await fetch('/api/users');
        const data = await response.json();
        
        console.log('Users API response:', data);
        
        if (data.users && Array.isArray(data.users)) {
          const userOptions = data.users.map((user: any) => ({
            value: user.id,
            label: user.username,
          }));

          console.log('User options:', userOptions);

          // Update the form config with user options
          const updatedFormConfig: CrudFormConfig = {
            ...followCrudConfig.formConfig,
            fields: followCrudConfig.formConfig.fields.map(field => {
              if (field.name === 'followingUserId' || field.name === 'followedUserId') {
                return {
                  ...field,
                  options: userOptions,
                };
              }
              return field;
            }),
          };

          console.log('Updated form config:', updatedFormConfig);
          setFormConfig(updatedFormConfig);
          setUsersLoaded(true);
          console.log('Users loaded successfully');
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to load users');
      }
    };

    fetchUsers();
  }, []);

  const handleCreate = async (formData: any) => {
    // Convert string IDs to numbers for the API
    const processedData = {
      ...formData,
      followingUserId: parseInt(formData.followingUserId, 10),
      followedUserId: parseInt(formData.followedUserId, 10),
    };
    
    console.log('Creating follow with data:', processedData);
    const result = await create(processedData);
    if (result) {
      setIsCreateModalOpen(false);
      refetch();
      toast.success('Follow relationship created successfully');
    }
  };

  const handleUpdate = async (formData: any) => {
    if (!selectedItem) return;
    
    const result = await update(selectedItem.id, formData);
    if (result) {
      setIsEditModalOpen(false);
      setSelectedItem(null);
      refetch();
      toast.success('Follow relationship updated successfully');
    }
  };

  const handleDelete = async (item: FollowWithUsers) => {
    if (window.confirm('Are you sure you want to delete this follow relationship?')) {
      const result = await deleteItem(item.id);
      if (result) {
        refetch();
        toast.success('Follow relationship deleted successfully');
      }
    }
  };

  const handleEdit = (item: FollowWithUsers) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleView = (item: FollowWithUsers) => {
    toast.info(`Viewing follow: ${item.followerUsername} → ${item.followedUsername}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{followCrudConfig.entityNamePlural}</h2>
          <p className="text-muted-foreground">{followCrudConfig.description}</p>
        </div>
        <Button
          onClick={() => {
            console.log('Add Follow button clicked, usersLoaded:', usersLoaded);
            setIsCreateModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {followCrudConfig.entityName}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All {followCrudConfig.entityNamePlural}</CardTitle>
          <CardDescription>
            Manage {followCrudConfig.entityNamePlural.toLowerCase()} in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CrudTable
            data={data}
            config={followCrudConfig.tableConfig}
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
        title={`Create New ${followCrudConfig.entityName}`}
        description={`Add a new ${followCrudConfig.entityName.toLowerCase()} to the system`}
      >
        <CrudForm
          config={formConfig}
          onSubmit={handleCreate}
          isLoading={createLoading}
        />
      </FormModal>

      {/* Edit Modal */}
      <FormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title={`Edit ${followCrudConfig.entityName}`}
        description={`Update ${followCrudConfig.entityName.toLowerCase()} information`}
      >
        {selectedItem && (
          <CrudForm
            config={formConfig}
            initialData={selectedItem}
            onSubmit={handleUpdate}
            isLoading={updateLoading}
          />
        )}
      </FormModal>
    </div>
  );
}