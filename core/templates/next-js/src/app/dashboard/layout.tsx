import { DashboardNav } from '@/components/dashboard-nav';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-8 pb-16 md:block">
      <div className="container mx-auto flex-1 space-y-4">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="lg:w-1/5">
            <div className="sticky top-8">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage users, posts, and relationships
                </p>
              </div>
              <DashboardNav />
            </div>
          </aside>
          <div className="flex-1 lg:max-w-4xl">
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}