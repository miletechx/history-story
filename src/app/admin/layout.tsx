import Link from 'next/link';
import { BarChart3, ClipboardList, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/admin';

const navItems = [
  { href: '/admin', label: '概览', icon: BarChart3 },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/orders', label: '订单管理', icon: ClipboardList },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white md:block">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm text-slate-500">历史故事会</p>
          <h1 className="mt-1 text-xl font-semibold">管理后台</h1>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="text-sm text-slate-500">Admin Console</p>
              <h2 className="text-2xl font-semibold tracking-tight">管理后台</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>管理员：{admin.username}</span>
              <Link href="/" className="rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50">
                返回站点
              </Link>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
