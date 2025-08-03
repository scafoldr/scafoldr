import { z } from 'zod';
import { createCrudPageConfig } from '@/lib/crud-config';
import { commonColumns } from '@/lib/column-configs';
import { commonFields } from '@/lib/field-configs';
import { UserWithStats } from './types';
import { userSchema } from '@/lib/validations';

// User-specific column configuration
const userTableConfig = {
  columns: [
    commonColumns.text('username', 'Username'),
    {
      key: 'role' as keyof UserWithStats,
      header: 'Role',
      type: 'badge' as const,
      badgeVariant: (value: string) => value === 'admin' ? 'destructive' as const : 'secondary' as const,
    },
    commonColumns.number('postsCount', 'Posts'),
    commonColumns.number('followersCount', 'Followers'),
    commonColumns.number('followingCount', 'Following'),
    commonColumns.createdAt(),
  ],
  searchKey: 'username' as keyof UserWithStats,
  searchPlaceholder: 'Search users...',
  entityName: 'user',
};

// User form configuration
const userFormConfig = {
  fields: [
    commonFields.text('username', 'Username'),
    commonFields.select('role', 'Role', [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
      { value: 'moderator', label: 'Moderator' },
      { value: 'editor', label: 'Editor' },
    ]),
  ],
  schema: userSchema,
  entityName: 'User',
};

// Complete user CRUD configuration
export const userCrudConfig = createCrudPageConfig<UserWithStats>({
  entityName: 'User',
  entityNamePlural: 'Users',
  description: 'Manage user accounts and their information',
  
  crudConfig: {
    entityName: 'user',
    entityNamePlural: 'users',
    apiEndpoint: '/api/users',
  },
  
  tableConfig: userTableConfig,
  formConfig: userFormConfig,
  
  defaultFilters: {
    limit: 10,
    page: 1,
  },
});