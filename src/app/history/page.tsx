'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Play, Trash2, ArrowLeft, Clock } from 'lucide-react';

interface HistoryRecord {
  id: string;
  title: string;
  content: string;
  ageGroup: string;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setMounted(true);
    const savedHistory = localStorage.getItem('history-story-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handlePlay = (record: HistoryRecord) => {
    // 重新播放历史故事
    const encodedTitle = encodeURIComponent(record.title);
    router.push(`/play?query=${encodedTitle}&age=${record.ageGroup}`);
  };

  const handleDelete = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('history-story-history', JSON.stringify(newHistory));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <History className="h-5 w-5" />
                聆听历史
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {history.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">还没有聆听记录</p>
                <p className="text-sm text-muted-foreground">
                  搜索并收听历史故事后，记录会显示在这里
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground mb-1">
                          {record.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {record.content.slice(0, 100)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(record.createdAt)}
                          </span>
                          <span>适合 {record.ageGroup} 岁</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlay(record)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
