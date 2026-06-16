'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Heart, TrendingUp, Star, Award } from 'lucide-react';
import type { AgeGroup, Story } from '@/lib/constants';

interface StoryRankingProps {
  stories: Story[];
  ageGroup: AgeGroup;
  onSelect: (story: Story) => void;
  type: 'hot' | 'recommended' | 'liked';
  className?: string;
}

const rankIcons = {
  hot: TrendingUp,
  recommended: Star,
  liked: Heart,
};

const rankTitles = {
  hot: '热门排行',
  recommended: '推荐故事',
  liked: '最受喜爱',
};

const rankColors = {
  hot: 'bg-orange-500',
  recommended: 'bg-yellow-500',
  liked: 'bg-pink-500',
};

export function StoryRanking({
  stories,
  ageGroup,
  onSelect,
  type,
  className,
}: StoryRankingProps) {
  const RankIcon = rankIcons[type];
  const title = rankTitles[type];
  const badgeColor = rankColors[type];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <RankIcon className="h-5 w-5 text-primary" />
          {title}
          <Badge variant="secondary" className="ml-auto text-xs">
            {ageGroup}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onSelect(story)}
            >
              <div
                className={`flex-shrink-0 w-7 h-7 rounded-full ${badgeColor} text-white flex items-center justify-center text-sm font-bold`}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {story.title}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {story.summary}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(story.duration / 60)}分钟
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    {story.playCount > 1000
                      ? `${(story.playCount / 1000).toFixed(1)}k`
                      : story.playCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {story.likeCount}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
