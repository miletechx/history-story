import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">订单管理</h1>
        <p className="mt-1 text-sm text-slate-500">当前项目 schema 未发现订单表，因此不伪造订单数据或接口。</p>
      </div>

      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">搜索与筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <Input placeholder="搜索订单号、用户姓名或邮箱" disabled />
            <Input value="无订单状态字段" disabled />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">订单列表</CardTitle>
          <Badge variant="outline">未启用</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
            <div>
              <p className="font-medium">当前无法展示订单数据</p>
              <p className="mt-1">真实 schema 仅包含 users、story_records、blog_posts、health_check，未包含 orders/order_items/payments 或金额字段。</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID / 订单号</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  暂无订单表，未创建管理接口。
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
