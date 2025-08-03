import { createCrudPageConfig } from '@/lib/crud-config';
import { commonColumns } from '@/lib/column-configs';
import { commonFields } from '@/lib/field-configs';
import { PostWithAuthor } from './types';
import { postFormSchema } from '@/lib/validations';

// Post-specific column configuration
const postTableConfig = {
  columns: [
    commonColumns.text('title', 'Title'),
    {
      key: 'authorName' as keyof PostWithAuthor,
      header: 'Author',
      type: 'text' as const,
    },
    {
      key: 'status' as keyof PostWithAuthor,
      header: 'Status',
      type: 'badge' as const,
      badgeVariant: (value: string) => {
        switch (value) {
          case 'published': return 'default' as const;
          case 'draft': return 'secondary' as const;
          case 'archived': return 'outline' as const;
          default: return 'secondary' as const;
        }
      },
    },
    {
      key: 'body' as keyof PostWithAuthor,
      header: 'Content',
      type: 'text' as const,
    },
    commonColumns.createdAt(),
  ],
  searchKey: 'title' as keyof PostWithAuthor,
  searchPlaceholder: 'Search posts...',
  entityName: 'post',
};

// Post form configuration
const postFormConfig = {
  fields: [
    commonFields.text('title', 'Title'),
    commonFields.textarea('body', 'Content'),
    commonFields.select('status', 'Status', [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
      { value: 'archived', label: 'Archived' },
    ]),
    commonFields.number('userId', 'User ID'),
  ],
  schema: postFormSchema,
  entityName: 'Post',
};

// Complete post CRUD configuration
export const postCrudConfig = createCrudPageConfig<PostWithAuthor>({
  entityName: 'Post',
  entityNamePlural: 'Posts',
  description: 'Manage blog posts and their content',
  
  crudConfig: {
    entityName: 'post',
    entityNamePlural: 'posts',
    apiEndpoint: '/api/posts',
  },
  
  tableConfig: postTableConfig,
  formConfig: postFormConfig,
  
  defaultFilters: {
    limit: 10,
    page: 1,
  },
});