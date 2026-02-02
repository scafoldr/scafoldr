'use client';

import { FileMap } from '@/features/code-editor';
import { useState } from 'react';

interface UseScaffoldCodeParams {
  // Define the parameters needed for the hook
  projectId: string;
  projectName: string;
  dbmlCode: string;
  framework: string;
}

export function useScaffoldCode() {
  const [data, setData] = useState<FileMap | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (params: UseScaffoldCodeParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: params.projectName,
          framework: params.framework,
          dbml_code: params.dbmlCode,
          project_id: params.projectId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Scafoldr Inc API error');
      }

      const responseData = await response.json();
      setData(responseData.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, fetchData };
}
