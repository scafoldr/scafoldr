'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, UserCheck, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalFollows: number;
  growthRate: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatGrowthRate = (rate: number) => {
    if (rate > 0) return `+${rate}%`;
    if (rate < 0) return `${rate}%`;
    return '0%';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's an overview of your system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : error ? '-' : stats?.totalUsers.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {error ? 'Failed to load stats' : 'Registered users'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : error ? '-' : stats?.totalPosts.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {error ? 'Failed to load stats' : 'Published posts'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Follows</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : error ? '-' : stats?.totalFollows.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {error ? 'Failed to load stats' : 'Follow relationships'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : error ? '-' : formatGrowthRate(stats?.growthRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {error ? 'Failed to load stats' : 'Last 30 days'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to set up your CRUD dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">1. Database Setup</h4>
              <p className="text-sm text-muted-foreground">
                Create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file and add your PostgreSQL connection string:
              </p>
              <code className="block bg-muted p-2 rounded text-xs">
                DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
              </code>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">2. Run Database Migrations</h4>
              <p className="text-sm text-muted-foreground">
                Generate and push your database schema:
              </p>
              <code className="block bg-muted p-2 rounded text-xs">
                npm run db:push
              </code>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">3. Start Managing Data</h4>
              <p className="text-sm text-muted-foreground">
                Use the navigation menu to manage users, posts, and follows. All CRUD operations are available.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Database Tools</h4>
              <p className="text-xs text-muted-foreground">
                • <code>npm run db:studio</code> - Open Drizzle Studio
              </p>
              <p className="text-xs text-muted-foreground">
                • <code>npm run db:generate</code> - Generate migrations
              </p>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Features</h4>
              <p className="text-xs text-muted-foreground">
                • Full CRUD operations for all entities
              </p>
              <p className="text-xs text-muted-foreground">
                • Search and filtering capabilities
              </p>
              <p className="text-xs text-muted-foreground">
                • Relationship management
              </p>
              <p className="text-xs text-muted-foreground">
                • Responsive design
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}