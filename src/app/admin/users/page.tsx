import Link from 'next/link';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const PAGE_SIZE = 10;

interface AdminUsersPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    status?: string;
  }>;
}

function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams;
  const keyword = params.q?.trim() ?? '';
  const currentPage = Math.max(Number(params.page ?? '1') || 1, 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = getSupabaseClient();
  let query = supabase
    .from('users')
    .select('id, username, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.ilike('username', `%${keyword}%`);
  }

  const { data, error, count } = await query;
  const users = data ?? [];
  const totalPages = Math.max(Math.ceil((count ?? 0) / PAGE_SIZE), 1);

  const createPageHref = (page: number) => {
    const queryParams = new URLSearchParams();
    if (keyword) {
      queryParams.set('q', keyword);
    }
    queryParams.set('page', String(page));
    return `/admin/users?${queryParams.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">用户管理</h1>
        <p className="mt-1 text-sm text-slate-500">查看用户列表，支持按用户名搜索和分页。</p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">搜索与筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 md:flex-row" action="/admin/users">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input name="q" defaultValue={keyword} placeholder="搜索用户名" className="pl-9" />
            </div>
            <Input name="status" value="当前 schema 无 status 字段" disabled className="md:w-56" />
            <Button type="submit">搜索</Button>
            <Link href="/admin/users">
              <Button type="button" variant="outline">重置</Button>
            </Link>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">用户列表</CardTitle>
          <span className="text-sm text-slate-500">共 {count ?? 0} 条</span>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">用户列表加载失败：{error.message}</div>
          ) : users.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">暂无用户数据</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell className="text-slate-400">未配置</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">无 status 字段</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>第 {currentPage} / {totalPages} 页</span>
            <div className="flex gap-2">
              <Link href={createPageHref(Math.max(currentPage - 1, 1))} aria-disabled={currentPage <= 1}>
                <Button variant="outline" size="sm" disabled={currentPage <= 1}>上一页</Button>
              </Link>
              <Link href={createPageHref(Math.min(currentPage + 1, totalPages))} aria-disabled={currentPage >= totalPages}>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages}>下一页</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
