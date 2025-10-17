import { ReactElement } from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
  Icon?: ReactElement;
  comingSoon?: boolean;
}
