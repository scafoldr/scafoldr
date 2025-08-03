"use client";

import { useState, useEffect, useCallback } from 'react';
import { useApiMutation } from '@/hooks/use-api';
import { toast } from 'sonner';

// Generic types for CRUD operations
export interface CrudEntity {
  id: number;
  createdAt: Date | string;
  [key: string]: any;
}

export interface CrudFilters {
  query?: string;
  page?: number;
  limit?: number;
  [key: string]: any;
}

export interface CrudResponse<T> {
  data?: T[];
  total: number;
  page: number;
  limit: number;
  [key: string]: any; // Allow dynamic keys for different entity names
}

export interface CrudConfig {
  entityName: string; // 'user', 'post', 'follow'
  entityNamePlural: string; // 'users', 'posts', 'follows'
  apiEndpoint: string; // '/api/users', '/api/posts', '/api/follows'
}

// Generic hook for fetching entities with filters
export function useCrudList<T extends CrudEntity>(
  config: CrudConfig,
  filters: CrudFilters = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${config.apiEndpoint}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${config.entityNamePlural}`);
      }
      
      const result: CrudResponse<T> = await response.json();
      setData(result.data || result[config.entityNamePlural] || []);
      setTotal(result.total);
    } catch (error) {
      toast.error(`Failed to fetch ${config.entityNamePlural}`);
      console.error(`Error fetching ${config.entityNamePlural}:`, error);
    } finally {
      setLoading(false);
    }
  }, [config, ...Object.values(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    loading,
    refetch: fetchData,
  };
}

// Generic hook for fetching a single entity
export function useCrudItem<T extends CrudEntity>(
  config: CrudConfig,
  id: number | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiEndpoint}/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${config.entityName}`);
      }
      
      const item: T = await response.json();
      setData(item);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Failed to fetch ${config.entityName}`);
      console.error(`Error fetching ${config.entityName}:`, error);
    } finally {
      setLoading(false);
    }
  }, [config, id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    data,
    loading,
    error,
    refetch: fetchItem,
  };
}

// Generic hook for creating entities
export function useCrudCreate<T extends CrudEntity, TInput = Partial<T>>(
  config: CrudConfig
) {
  const { execute, loading, error } = useApiMutation<T>({
    onSuccess: () => {
      toast.success(`${config.entityName} created successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to create ${config.entityName}: ${error}`);
    },
  });

  const create = useCallback(async (data: TInput) => {
    return execute(config.apiEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [execute, config.apiEndpoint]);

  return {
    create,
    loading,
    error,
  };
}

// Generic hook for updating entities
export function useCrudUpdate<T extends CrudEntity, TInput = Partial<T>>(
  config: CrudConfig
) {
  const { execute, loading, error } = useApiMutation<T>({
    onSuccess: () => {
      toast.success(`${config.entityName} updated successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update ${config.entityName}: ${error}`);
    },
  });

  const update = useCallback(async (id: number, data: TInput) => {
    return execute(`${config.apiEndpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [execute, config.apiEndpoint]);

  return {
    update,
    loading,
    error,
  };
}

// Generic hook for deleting entities
export function useCrudDelete(config: CrudConfig) {
  const { execute, loading, error } = useApiMutation({
    onSuccess: () => {
      toast.success(`${config.entityName} deleted successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to delete ${config.entityName}: ${error}`);
    },
  });

  const deleteItem = useCallback(async (id: number) => {
    return execute(`${config.apiEndpoint}/${id}`, {
      method: 'DELETE',
    });
  }, [execute, config.apiEndpoint]);

  return {
    delete: deleteItem,
    loading,
    error,
  };
}

// Convenience hook that combines all CRUD operations
export function useCrud<T extends CrudEntity, TInput = Partial<T>>(
  config: CrudConfig,
  filters: CrudFilters = {}
) {
  const list = useCrudList<T>(config, filters);
  const create = useCrudCreate<T, TInput>(config);
  const update = useCrudUpdate<T, TInput>(config);
  const deleteHook = useCrudDelete(config);

  return {
    // List operations
    data: list.data,
    total: list.total,
    loading: list.loading,
    refetch: list.refetch,
    
    // CRUD operations
    create: create.create,
    update: update.update,
    delete: deleteHook.delete,
    
    // Loading states
    createLoading: create.loading,
    updateLoading: update.loading,
    deleteLoading: deleteHook.loading,
    
    // Errors
    createError: create.error,
    updateError: update.error,
    deleteError: deleteHook.error,
  };
}