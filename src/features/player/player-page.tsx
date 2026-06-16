'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  SkipBack,
  ArrowLeft,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Loader2,
  BookOpen,
} from 'lucide-react';
import type { AgeGroup } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StoryContent {
  text: string;
  scenes: { index: number; content: string; imageUrl?: string }[];
}

interface CachedStory {
  story_id: string;
  query: string;
  age_group: string;
  content: string;
  audio_url: string | null;
  image_data: string | null;
}

  // 为故事生成固定的唯一ID（基于故事名称+年龄段）
const generateStoryId = (storyName: string, ageGroup: AgeGroup): string => {
  const combined = `${storyName}_${ageGroup}`;
  // 使用简单的哈希算法生成固定ID
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // 生成固定格式的ID: story_正数哈希值
  return `story_${Math.abs(hash)}`;
};

// 格式化时间（秒 -> MM:SS）
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function PlayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const queryId = searchParams.get('id');
  const queryText = searchParams.get('query');
  // 确保age参数有效，处理URL编码
  const ageParam = searchParams.get('age');
  const validAgeGroups: AgeGroup[] = ['3-6', '7-12', '13-17', '18+'];
  // 处理可能的编码问题（18+ 可能被编码或解析为 18 ）
  const normalizedAge = ageParam?.replace(/\s/g, '+') || '';
  const ageGroup: AgeGroup = validAgeGroups.includes(normalizedAge as AgeGroup)
    ? (normalizedAge as AgeGroup)
    : '7-12';

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [storyContent, setStoryContent] = useState<StoryContent | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showImages, setShowImages] = useState(true);
  const [progress, setProgress] = useState(0);
  const [generatingPhase, setGeneratingPhase] = useState<
    'idle' | 'searching' | 'writing' | 'tts' | 'complete'
  >('idle');
  
  // 音频播放时间状态
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const isAudioStartingRef = useRef(false);
  const hasStartedGeneration = useRef(false);
  const playStartTimeRef = useRef<number | null>(null); // 播放开始时间
  const accumulatedDurationRef = useRef<number>(0); // 累计播放时长
  const hasRecordedRef = useRef<boolean>(false); // 是否已保存记录
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      isAudioStartingRef.current = false;
    }
  }, [audioUrl]);

  // 页面卸载时保存播放记录
  useEffect(() => {
    return () => {
      // 如果正在播放，记录本次播放时长
      if (playStartTimeRef.current !== null) {
        const sessionDuration = (Date.now() - playStartTimeRef.current) / 1000;
        accumulatedDurationRef.current += sessionDuration;
      }
      
      // 如果有累计播放时长且未保存过，保存记录
      if (accumulatedDurationRef.current > 0 && !hasRecordedRef.current) {
        savePlayRecord(accumulatedDurationRef.current);
        hasRecordedRef.current = true;
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted || hasStartedGeneration.current) return;

    // 标记已经开始生成，避免重复调用
    hasStartedGeneration.current = true;

    // 如果是搜索新故事（有query参数），开始生成
    if (queryText) {
      generateStory(queryText, ageGroup);
    }
    // 如果是播放存量故事（有id参数），加载故事
    else if (queryId) {
      loadExistingStory(queryId);
    }
  }, [mounted]);

  const generateStory = async (query: string, age: AgeGroup) => {
    setIsGenerating(true);
    setGenerationError(null);
    setStoryContent(null);
    setDisplayedText('');
    setAudioUrl(null);
    setGeneratingPhase('searching');
    setProgress(10);

    try {
      const cachedStory = await fetchCachedStory(query, age);

      if (cachedStory) {
        const scenes = cachedStory.image_data
          ? JSON.parse(cachedStory.image_data) as StoryContent['scenes']
          : parseScenes(cachedStory.content);

        setDisplayedText(cachedStory.content);
        setStoryContent({ text: cachedStory.content, scenes });
        setAudioUrl(cachedStory.audio_url);
        setProgress(100);
        setGeneratingPhase('complete');
        return;
      }

      // 调用故事生成API（流式）
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ageGroup: age }),
      });

      if (!response.ok) {
        throw new Error('生成失败');
      }

      setGeneratingPhase('writing');
      setProgress(30);

      // 读取流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(String(parsed.error));
                }
                if (parsed.text) {
                  fullText += parsed.text;
                  setDisplayedText(fullText);
                  setProgress(30 + (fullText.length / 1000) * 40);
                }
              } catch (parseError) {
                if (parseError instanceof Error) {
                  throw parseError;
                }
              }
            }
          }
        }
      }

      if (!fullText.trim()) {
        throw new Error('故事内容为空，请稍后重试');
      }

      setProgress(70);
      setGeneratingPhase('tts');

      // 生成TTS配音
      let generatedAudioUrl: string | null = null;
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, ageGroup: age }),
      });

      if (ttsResponse.ok) {
        const ttsData = await ttsResponse.json();
        generatedAudioUrl = ttsData.audioUrl;
        setAudioUrl(generatedAudioUrl);
      }

      setProgress(100);
      setGeneratingPhase('complete');

      // 解析分镜场景
      const scenes = parseScenes(fullText);
      setStoryContent({ text: fullText, scenes });
      await saveGeneratedStory(query, age, fullText, generatedAudioUrl, scenes);

      // 保存到历史记录
      saveToHistory({
        id: Date.now().toString(),
        title: query,
        content: fullText,
        ageGroup: age,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成故事失败，请稍后重试';
      setGenerationError(message);
      setStoryContent(null);
      setDisplayedText('');
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchCachedStory = async (query: string, age: AgeGroup): Promise<CachedStory | null> => {
    const params = new URLSearchParams({ query, ageGroup: age });
    const response = await fetch(`/api/generated-stories?${params.toString()}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.story ?? null;
  };

  const saveGeneratedStory = async (
    query: string,
    age: AgeGroup,
    content: string,
    generatedAudioUrl: string | null,
    scenes: StoryContent['scenes']
  ) => {
    await fetch('/api/generated-stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        ageGroup: age,
        content,
        audioUrl: generatedAudioUrl,
        imageData: scenes,
      }),
    });
  };

  const loadExistingStory = async (id: string) => {
    // TODO: 从数据库加载存量故事
    // 这里先用模拟数据
    setStoryContent({
      text: '这是一个关于历史的故事...',
      scenes: [],
    });
  };

  const parseScenes = (text: string) => {
    const scenes: { index: number; content: string }[] = [];
    const regex = /\[场景(\d+)\]([\s\S]*?)(?=\[场景\d+\]|$)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      scenes.push({
        index: parseInt(match[1]),
        content: match[2].trim(),
      });
    }

    return scenes;
  };

  const saveToHistory = (record: {
    id: string;
    title: string;
    content: string;
    ageGroup: string;
    createdAt: string;
  }) => {
    const history = JSON.parse(localStorage.getItem('history-story-history') || '[]');
    history.unshift(record);
    // 只保留最近50条
    if (history.length > 50) history.pop();
    localStorage.setItem('history-story-history', JSON.stringify(history));
  };

  // 保存播放记录
  const savePlayRecord = async (duration: number) => {
    try {
      // 检查是否登录
      const meResponse = await fetch('/api/auth/me');
      const meData = await meResponse.json();

      if (!meData.user) {
        // 未登录，提示需要登录
        setToast({ message: '登录后可保存您的播放记录', type: 'info' });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // 已登录，保存记录
      // 生成固定的story_id（相同故事名称+年龄段使用同一ID）
      const storyId = generateStoryId(queryText || 'untitled', ageGroup);
      
      const response = await fetch('/api/story-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story_name: queryText,
          story_id: storyId, // 使用生成的固定ID
          duration: Math.round(duration)
        })
      });

      if (response.ok) {
        setToast({ message: '您的播放记录已保存', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('保存播放记录失败:', error);
    }
  };

  // 音频播放结束处理
  const handleAudioEnded = () => {
    setIsPlaying(false);
    
    // 计算本次播放时长并累计
    if (playStartTimeRef.current !== null) {
      const sessionDuration = (Date.now() - playStartTimeRef.current) / 1000;
      accumulatedDurationRef.current += sessionDuration;
      playStartTimeRef.current = null;
    }
    
    // 保存记录（如果还没有保存过）
    if (accumulatedDurationRef.current > 0 && !hasRecordedRef.current) {
      savePlayRecord(accumulatedDurationRef.current);
      hasRecordedRef.current = true;
    }
  };

  const togglePlay = async () => {
    if (audioRef.current && !isAudioStartingRef.current) {
      if (isPlaying) {
        // 暂停播放
        audioRef.current.pause();
        setIsPlaying(false);
        
        // 计算本次播放时长并累计
        if (playStartTimeRef.current !== null) {
          const sessionDuration = (Date.now() - playStartTimeRef.current) / 1000;
          accumulatedDurationRef.current += sessionDuration;
          playStartTimeRef.current = null;
        }
        
        // 如果累计播放时长超过5秒，保存记录
        if (accumulatedDurationRef.current >= 5 && !hasRecordedRef.current) {
          savePlayRecord(accumulatedDurationRef.current);
          hasRecordedRef.current = true; // 标记已保存
        }
      } else {
        // 开始播放
        try {
          isAudioStartingRef.current = true;
          await audioRef.current.play();
          setIsPlaying(true);
          playStartTimeRef.current = Date.now(); // 记录开始时间
        } catch (error) {
          const message = error instanceof Error ? error.message : '播放失败，请重试';
          setToast({ message, type: 'info' });
          setTimeout(() => setToast(null), 3000);
        } finally {
          isAudioStartingRef.current = false;
        }
      }
    }
  };

  // 更新当前播放时间
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // 更新音频总时长
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // 上一个故事（从历史记录中获取）
  const handlePrevious = () => {
    const history = JSON.parse(localStorage.getItem('history-story-history') || '[]');
    if (history.length > 1) {
      const prevStory = history[1]; // 获取上一条记录
      router.push(`/play?query=${encodeURIComponent(prevStory.title)}&age=${encodeURIComponent(ageGroup)}`);
    }
  };

  // 下一个故事（返回首页选择）
  const handleNext = () => {
    router.push('/');
  };

  const phaseMessages = {
    idle: '准备中...',
    searching: '正在搜索历史资料...',
    writing: '正在撰写故事...',
    tts: '正在生成配音...',
    complete: '生成完成！',
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
              <h1 className="text-lg font-semibold text-foreground">
                {queryText || '历史故事'}
              </h1>
              <p className="text-xs text-muted-foreground">适合 {ageGroup} 岁听众</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImages(!showImages)}
              className={cn('gap-2', showImages && 'text-primary')}
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">配图</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* 初始加载状态 */}
        {!isGenerating && !generationError && !storyContent && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">正在准备故事...</p>
            </CardContent>
          </Card>
        )}

        {/* 生成失败 */}
        {generationError && (
          <Card className="max-w-2xl mx-auto mb-8 border-destructive/30">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">故事生成失败</h2>
              <p className="text-sm text-muted-foreground mb-6">{generationError}</p>
              {queryText && (
                <Button onClick={() => generateStory(queryText, ageGroup)}>
                  重新生成
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* 生成进度 */}
        {isGenerating && (
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {phaseMessages[generatingPhase]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    请稍候，精彩的故事正在创作中...
                  </p>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* 故事内容 */}
        {storyContent && (
          <div className="max-w-3xl mx-auto">
            {/* 文字内容 */}
            <Card className="mb-6">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  {displayedText || storyContent.text}
                </div>
              </CardContent>
            </Card>

            {/* 分镜配图 */}
            {showImages && storyContent.scenes.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {storyContent.scenes.map((scene) => (
                  <Card key={scene.index} className="overflow-hidden">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {scene.imageUrl ? (
                        <img
                          src={scene.imageUrl}
                          alt={`场景 ${scene.index}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            配图生成中...
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* 音频播放器 */}
            {audioUrl && (
              <Card className="sticky bottom-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full"
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={handleAudioEnded}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                      />
                      <div className="text-sm text-muted-foreground">
                        {duration > 0 ? (
                          <span className="font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        ) : (
                          '点击播放按钮开始聆听'
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={handlePrevious} title="上一个故事">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleNext} title="下一个故事">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
