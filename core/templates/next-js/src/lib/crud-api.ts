import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq, ilike, or, sql, count, and } from 'drizzle-orm';
import { PgTable, PgColumn } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Generic CRUD API configuration
export interface CrudApiConfig<T extends PgTable> {
  table: T;
  schema: z.ZodSchema<any>;
  entityName: string;
  searchFields?: (keyof T['_']['columns'])[];
  filterFields?: (keyof T['_']['columns'])[];
  selectFields?: Partial<Record<keyof T['_']['columns'], PgColumn>>;
  joins?: {
    table: PgTable;
    condition: any;
    fields?: Record<string, any>;
  }[];
}

// Generic GET handler for listing entities
export async function handleCrudList<T extends PgTable>(
  request: NextRequest,
  config: CrudApiConfig<T>
) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    
    // Search conditions
    if (query && config.searchFields) {
      const searchConditions = config.searchFields.map(field => 
        ilike(config.table[field as string], `%${query}%`)
      );
      conditions.push(or(...searchConditions));
    }

    // Filter conditions
    if (config.filterFields) {
      config.filterFields.forEach(field => {
        const value = searchParams.get(field as string);
        if (value) {
          conditions.push(eq(config.table[field as string], value));
        }
      });
    }

    // Build select fields
    const selectFields = config.selectFields || {};
    
    // Base query
    let query_builder = db
      .select(selectFields)
      .from(config.table as PgTable<any>);

    // Add joins if specified
    if (config.joins) {
      config.joins.forEach(join => {
        query_builder = query_builder.leftJoin(join.table, join.condition);
      });
    }

    // Apply conditions and pagination
    const results = await query_builder
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(config.table as PgTable<any>)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      data: results,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error(`Error fetching ${config.entityName}s:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${config.entityName}s` },
      { status: 500 }
    );
  }
}

// Generic POST handler for creating entities
export async function handleCrudCreate<T extends PgTable>(
  request: NextRequest,
  config: CrudApiConfig<T>
) {
  try {
    const body = await request.json();
    const validatedData = config.schema.parse(body);

    const [newEntity] = await db
      .insert(config.table)
      .values(validatedData)
      .returning();

    return NextResponse.json(newEntity, { status: 201 });
  } catch (error) {
    console.error(`Error creating ${config.entityName}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to create ${config.entityName}` },
      { status: 500 }
    );
  }
}

// Generic GET handler for single entity
export async function handleCrudGet<T extends PgTable>(
  id: string,
  config: CrudApiConfig<T>
) {
  try {
    const entityId = parseInt(id);
    if (isNaN(entityId)) {
      return NextResponse.json(
        { error: `Invalid ${config.entityName} ID` },
        { status: 400 }
      );
    }

    const [entity] = await db
      .select()
      .from(config.table as PgTable<any>)
      .where(eq(config.table.id, entityId));

    if (!entity) {
      return NextResponse.json(
        { error: `${config.entityName} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(entity);
  } catch (error) {
    console.error(`Error fetching ${config.entityName}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${config.entityName}` },
      { status: 500 }
    );
  }
}

// Generic PUT handler for updating entities
export async function handleCrudUpdate<T extends PgTable>(
  id: string,
  request: NextRequest,
  config: CrudApiConfig<T>
) {
  try {
    const entityId = parseInt(id);
    if (isNaN(entityId)) {
      return NextResponse.json(
        { error: `Invalid ${config.entityName} ID` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = config.schema.partial().parse(body);

    const [updatedEntity] = await db
      .update(config.table as PgTable<any>)
      .set(validatedData)
      .where(eq(config.table.id, entityId))
      .returning();

    if (!updatedEntity) {
      return NextResponse.json(
        { error: `${config.entityName} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEntity);
  } catch (error) {
    console.error(`Error updating ${config.entityName}:`, error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: `Failed to update ${config.entityName}` },
      { status: 500 }
    );
  }
}

// Generic DELETE handler for deleting entities
export async function handleCrudDelete<T extends PgTable>(
  id: string,
  config: CrudApiConfig<T>
) {
  try {
    const entityId = parseInt(id);
    if (isNaN(entityId)) {
      return NextResponse.json(
        { error: `Invalid ${config.entityName} ID` },
        { status: 400 }
      );
    }

    const [deletedEntity] = await db
      .delete(config.table as PgTable<any>)
      .where(eq(config.table.id, entityId))
      .returning();

    if (!deletedEntity) {
      return NextResponse.json(
        { error: `${config.entityName} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: `${config.entityName} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting ${config.entityName}:`, error);
    return NextResponse.json(
      { error: `Failed to delete ${config.entityName}` },
      { status: 500 }
    );
  }
}

// Convenience function to create complete CRUD handlers
export function createCrudHandlers<T extends PgTable>(config: CrudApiConfig<T>) {
  return {
    async GET(request: NextRequest) {
      return handleCrudList(request, config);
    },
    
    async POST(request: NextRequest) {
      return handleCrudCreate(request, config);
    },
  };
}

export function createCrudItemHandlers<T extends PgTable>(config: CrudApiConfig<T>) {
  return {
    async GET(request: NextRequest, { params }: { params: { id: string } }) {
      return handleCrudGet(params.id, config);
    },
    
    async PUT(request: NextRequest, { params }: { params: { id: string } }) {
      return handleCrudUpdate(params.id, request, config);
    },
    
    async DELETE(request: NextRequest, { params }: { params: { id: string } }) {
      return handleCrudDelete(params.id, config);
    },
  };
}