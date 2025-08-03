import { createCrudPageConfig } from '@/lib/crud-config';
import { commonColumns } from '@/lib/column-configs';
import { commonFields } from '@/lib/field-configs';
import { FollowWithUsers } from './types';
import { followSchema } from '@/lib/validations';

// Follow-specific column configuration
const followTableConfig = {
  columns: [
    commonColumns.text('followerUsername', 'Follower'),
    commonColumns.text('followedUsername', 'Following'),
    commonColumns.createdAt(),
  ],
  searchKey: 'followerUsername' as keyof FollowWithUsers,
  searchPlaceholder: 'Search follows...',
  entityName: 'follow',
};

// Follow form configuration
const followFormConfig = {
  fields: [
    {
      name: 'followingUserId',
      label: 'Follower User',
      type: 'select' as const,
      placeholder: 'Select follower user',
      required: true,
      options: [], // Will be populated dynamically
    },
    {
      name: 'followedUserId',
      label: 'User to Follow',
      type: 'select' as const,
      placeholder: 'Select user to follow',
      required: true,
      options: [], // Will be populated dynamically
    },
  ],
  schema: followSchema,
  entityName: 'Follow',
};

// Complete follow CRUD configuration
export const followCrudConfig = createCrudPageConfig<FollowWithUsers>({
  entityName: 'Follow',
  entityNamePlural: 'Follows',
  description: 'Manage user follow relationships',
  
  crudConfig: {
    entityName: 'follow',
    entityNamePlural: 'follows',
    apiEndpoint: '/api/follows',
  },
  
  tableConfig: followTableConfig,
  formConfig: followFormConfig,
  
  defaultFilters: {
    limit: 10,
    page: 1,
  },
});