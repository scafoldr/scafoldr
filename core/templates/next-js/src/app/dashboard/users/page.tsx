"use client";

import { CrudPage } from '@/components/crud-page';
import { userCrudConfig } from '@/features/users/config';

export default function UsersPage() {
  return <CrudPage config={userCrudConfig} />;
}