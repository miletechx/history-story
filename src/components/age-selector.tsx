'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AgeGroup } from '@/lib/constants';

const ageGroups: { value: AgeGroup; label: string; desc: string; emoji: string }[] = [
  { value: '3-6', label: '3-6岁', desc: '学龄前', emoji: '🌟' },
  { value: '7-12', label: '7-12岁', desc: '小学生', emoji: '📚' },
  { value: '13-17', label: '13-17岁', desc: '中学生', emoji: '🎓' },
  { value: '18+', label: '18岁+', desc: '成年人', emoji: '📖' },
];

interface AgeSelectorProps {
  value: AgeGroup | null;
  onChange: (age: AgeGroup) => void;
  className?: string;
}

export function AgeSelector({ value, onChange, className }: AgeSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">选择你的年龄段</h2>
        <p className="text-muted-foreground">故事将根据你的年龄自动调整内容和深度</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ageGroups.map((group) => (
          <Card
            key={group.value}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105',
              value === group.value
                ? 'ring-2 ring-primary bg-primary/5 shadow-lg'
                : 'hover:bg-muted/50'
            )}
            onClick={() => onChange(group.value)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{group.emoji}</div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {group.label}
              </div>
              <div className="text-sm text-muted-foreground">{group.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
