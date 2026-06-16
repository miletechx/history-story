'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, ArrowLeft, User } from 'lucide-react';
import { ToastContainer, useToast } from '@/components/toast';

interface StoryRecord {
  id: number;
  user_id: number;
  story_name: string;
  story_id: string;
  duration: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [records, setRecords] = useState<StoryRecord[]>([]);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 获取当前用户信息
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      
      if (!userData.user) {
        showToast('请先登录', 'error');
        router.push('/login');
        return;
      }
      
      setUser(userData.user);
      
      // 获取播放记录
      const recordsRes = await fetch('/api/story-records');
      const recordsData = await recordsRes.json();
      setRecords(recordsData.records || []);
    } catch (error) {
      console.error('获取数据失败:', error);
      showToast('获取数据失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs}秒`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePlayStory = (storyName: string, storyId: string) => {
    router.push(`/play?query=${encodeURIComponent(storyName)}&id=${storyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                  <span>返回首页</span>
                </Link>
              </div>
              
              <h1 className="text-lg font-semibold text-gray-900">个人中心</h1>
              
              <div className="w-20"></div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 用户信息卡片 */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-2xl font-semibold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{user?.username}</h2>
                  <p className="text-gray-600 mt-1">历史故事会会员</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-3xl font-semibold text-amber-600">{records.length}</p>
                  <p className="text-sm text-gray-600 mt-1">播放故事数</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-3xl font-semibold text-amber-600">
                    {Math.floor(records.reduce((sum, r) => sum + r.duration, 0) / 60)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">总播放时长(分钟)</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="text-3xl font-semibold text-amber-600">
                    {records.length > 0 ? new Set(records.map(r => r.story_id)).size : 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">不同故事数</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 播放记录列表 */}
          <Card className="bg-white/80 backdrop-blur-sm border-amber-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                我的播放记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">暂无播放记录</p>
                  <p className="text-sm text-gray-500 mb-6">开始聆听历史故事，记录将自动保存</p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white">
                      去听故事
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record, index) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer border border-gray-100"
                      onClick={() => handlePlayStory(record.story_name, record.story_id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{record.story_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(record.duration)}
                          </span>
                          <span>{formatDate(record.created_at)}</span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                        <Play className="h-4 w-4 mr-1" />
                        再听一次
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
