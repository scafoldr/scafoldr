import { eq, and, or, gte, lte, like, ilike, desc, count } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export function createRESTAPI(table: any, db: any, tableName: string) {
  return {
    // GET /api/posts or GET /api/posts?id=1&name=like.*john*
    GET: async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url);
        let query = db.select().from(table);
        
        // Build WHERE conditions from query params
        const conditions = [];
        for (const [key, value] of searchParams.entries()) {
          if (key === 'limit' || key === 'offset' || key === 'order' || key === 'page') continue;
          
          // Support operators: eq, neq, gte, lte, like, ilike
          if (value.includes('.')) {
            const [op, val] = value.split('.');
            switch (op) {
              case 'eq': conditions.push(eq(table[key], val)); break;
              case 'gte': conditions.push(gte(table[key], Number(val) || val)); break;
              case 'lte': conditions.push(lte(table[key], Number(val) || val)); break;
              case 'like': conditions.push(like(table[key], val)); break;
              case 'ilike': conditions.push(ilike(table[key], val)); break;
            }
          } else {
            conditions.push(eq(table[key], value));
          }
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        
        // Handle pagination - support both limit/offset and page/limit patterns
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');
        const page = searchParams.get('page');
        
        let finalLimit = limit ? parseInt(limit) : 10;
        let finalOffset = offset ? parseInt(offset) : 0;
        
        if (page && !offset) {
          finalOffset = (parseInt(page) - 1) * finalLimit;
        }
        
        query = query.limit(finalLimit).offset(finalOffset);
        
        // Handle ordering
        const order = searchParams.get('order');
        if (order) {
          const [column, direction] = order.split('.');
          query = query.orderBy(direction === 'desc' ? desc(table[column]) : table[column]);
        }
        
        const results = await query;
        
        // If pagination is being used, also return total count
        if (page) {
          let countQuery = db.select({ count: count() }).from(table);
          if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions));
          }
          const totalResult = await countQuery;
          const total = totalResult[0]?.count || 0;
          
          return NextResponse.json({
            [tableName]: results,
            total,
            page: parseInt(page),
            limit: finalLimit,
          });
        }
        
        return NextResponse.json(results);
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return NextResponse.json({ error: `Failed to fetch ${tableName}` }, { status: 500 });
      }
    },
    
    // POST /api/posts
    POST: async (request: NextRequest) => {
      try {
        const body = await request.json();
        const result = await db.insert(table).values(body).returning();
        return NextResponse.json(result[0], { status: 201 });
      } catch (error) {
        console.error(`Error creating ${tableName}:`, error);
        return NextResponse.json({ error: `Failed to create ${tableName}` }, { status: 400 });
      }
    },
    
    // PUT /api/posts (requires id in body)
    PUT: async (request: NextRequest) => {
      try {
        const body = await request.json();
        const { id, ...updates } = body;
        if (!id) {
          return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }
        const result = await db.update(table).set(updates).where(eq(table.id, id)).returning();
        if (result.length === 0) {
          return NextResponse.json({ error: `${tableName} not found` }, { status: 404 });
        }
        return NextResponse.json(result[0]);
      } catch (error) {
        console.error(`Error updating ${tableName}:`, error);
        return NextResponse.json({ error: `Failed to update ${tableName}` }, { status: 400 });
      }
    },
    
    // DELETE /api/posts?id=1
    DELETE: async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }
        const result = await db.delete(table).where(eq(table.id, parseInt(id) || id)).returning();
        if (result.length === 0) {
          return NextResponse.json({ error: `${tableName} not found` }, { status: 404 });
        }
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error(`Error deleting ${tableName}:`, error);
        return NextResponse.json({ error: `Failed to delete ${tableName}` }, { status: 400 });
      }
    }
  };
}