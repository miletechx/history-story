'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { TrendingUp, Play, Clock, Trophy } from 'lucide-react';
import { AgeGroup } from '@/lib/constants';

interface RankingItem {
  story_id: string;
  story_name: string;
  play_count: number;
  total_duration: number;
}

interface Props {
  ageGroup: AgeGroup;
}

export function GlobalRanking({ ageGroup }: Props) {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await fetch('/api/ranking');
      const data = await response.json();
      setRanking(data.ranking || []);
    } catch (error) {
      console.error('获取排行榜失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分`;
    }
    return `${minutes}分钟`;
  };

  const handlePlayStory = (storyName: string) => {
    const encodedQuery = encodeURIComponent(storyName);
    const encodedAge = encodeURIComponent(ageGroup);
    router.push(`/play?query=${encodedQuery}&age=${encodedAge}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">故事排行榜</h3>
        </div>
        <div className="p-6 text-center">
          <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">加载中...</p>
        </div>
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">故事排行榜</h3>
        </div>
        <div className="p-6 text-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无排行数据</p>
          <p className="text-sm text-gray-400 mt-1">开始聆听故事，登上排行榜吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-white" />
        <h3 className="text-white font-semibold">故事排行榜</h3>
        <span className="text-white/80 text-sm ml-auto">按播放次数排名</span>
      </div>
      
      <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
        {ranking.map((item, index) => {
          const rank = index + 1;
          const isTop10 = rank <= 10;
          
          return (
            <button
              key={item.story_id}
              onClick={() => handlePlayStory(item.story_name)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left group ${
                isTop10 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                rank === 1 ? 'bg-yellow-400 text-white' :
                rank === 2 ? 'bg-gray-300 text-white' :
                rank === 3 ? 'bg-orange-400 text-white' :
                isTop10 ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {rank}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium transition-colors truncate ${
                  isTop10 ? 'text-purple-700 group-hover:text-purple-800' : 'text-gray-900 group-hover:text-purple-600'
                }`}>
                  {item.story_name}
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    {item.play_count}次
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(item.total_duration)}
                  </span>
                </div>
              </div>
              
              {isTop10 && (
                <div className="flex-shrink-0">
                  <Trophy className={`w-4 h-4 ${
                    rank === 1 ? 'text-yellow-500' :
                    rank === 2 ? 'text-gray-400' :
                    rank === 3 ? 'text-orange-500' :
                    'text-purple-400'
                  }`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
