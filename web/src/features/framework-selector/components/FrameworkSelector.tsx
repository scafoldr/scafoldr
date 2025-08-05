'use client';

import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Framework {
  id: string;
  name: string;
  icon: string;
}

const frameworks: Framework[] = [
  {
    id: 'nodejs-express-js',
    name: 'Node.js + Express',
    icon: '🟢'
  },
  {
    id: 'java-spring',
    name: 'Java + Spring Boot',
    icon: '☕'
  }
];

interface FrameworkSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function FrameworkSelector({ value, onValueChange, className }: FrameworkSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Framework" />
      </SelectTrigger>
      <SelectContent>
        {frameworks.map((framework) => (
          <SelectItem key={framework.id} value={framework.id}>
            <div className="flex items-center space-x-2">
              <span>{framework.icon}</span>
              <span>{framework.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}