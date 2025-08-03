"use client";

import { CrudPage } from '@/components/crud-page';
import { postCrudConfig } from '@/features/posts/config';

export default function PostsPage() {
  return <CrudPage config={postCrudConfig} />;
}