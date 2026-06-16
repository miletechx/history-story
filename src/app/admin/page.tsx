import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecentStartDate } from '@/lib/admin';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
}

function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminPage() {
  const supabase = getSupabaseClient();
  const recentStart = getRecentStartDate();

  const [usersTotal, recentUsers, recordsTotal, recentRecords] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', recentStart),
    supabase.from('story_records').select('id', { count: 'exact', head: true }),
    supabase.from('story_records').select('id', { count: 'exact', head: true }).gte('created_at', recentStart),
  ]);

  const hasError = usersTotal.error || recentUsers.error || recordsTotal.error || recentRecords.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">运营概览</h1>
          <p className="mt-1 text-sm text-slate-500">基于当前真实 schema 展示可统计指标。</p>
        </div>
        <Badge variant="outline">最近 7 天</Badge>
      </div>

      {hasError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">统计数据加载失败，请检查数据库连接。</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="用户总数" value={usersTotal.count ?? 0} description="users 表记录数" />
        <MetricCard title="最近新增用户" value={recentUsers.count ?? 0} description="最近 7 天新增用户" />
        <MetricCard title="播放记录总数" value={recordsTotal.count ?? 0} description="story_records 表记录数" />
        <MetricCard title="最近播放记录" value={recentRecords.count ?? 0} description="最近 7 天播放记录" />
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle>订单数据</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          当前 schema 未发现订单表或金额字段，因此概览不展示订单总数、最近订单数和成交额。
        </CardContent>
      </Card>
    </div>
  );
}
