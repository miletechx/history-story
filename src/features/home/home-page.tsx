'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AgeGroup, AGE_GROUPS, Story } from '@/lib/constants';
import { TrendingUp, Star, Heart, Play, Clock, Trophy, Search, Send, BookOpen, Sparkles, Landmark, ScrollText } from 'lucide-react';
import { UserMenu } from '@/components/user-menu';
import { GlobalRanking } from '@/components/global-ranking';

export default function HomePage() {
  const router = useRouter();
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('7-12');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (query = searchQuery) => {
    if (query.trim()) {
      const encodedQuery = encodeURIComponent(query.trim());
      const encodedAge = encodeURIComponent(ageGroup);
      router.push(`/play?query=${encodedQuery}&age=${encodedAge}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleStories = [
    { title: '赤壁之战', description: '三国时期最著名的战役', image: '/chibi.jpg' },
    { title: '丝绸之路', description: '连接东西方的伟大商路', image: '/silk-road.jpg' },
  ];

  const searchActions = [
    { title: '赤壁之战', description: '三国经典战役', tag: '热门', icon: <Landmark className="h-4 w-4 text-red-500" /> },
    { title: '丝绸之路', description: '东西方文明交流', tag: '推荐', icon: <ScrollText className="h-4 w-4 text-amber-500" /> },
    { title: '秦始皇统一六国', description: '大一统王朝开端', tag: '深度', icon: <BookOpen className="h-4 w-4 text-slate-600" /> },
    { title: '郑和下西洋', description: '大明远航传奇', tag: '故事', icon: <Sparkles className="h-4 w-4 text-blue-500" /> },
  ];

  const filteredSearchActions = searchActions.filter((action) =>
    action.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    action.description.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const visibleSearchActions = searchQuery.trim() ? filteredSearchActions : searchActions;

  // 根据年龄段生成不同的排行榜数据
  const getRankingStories = (age: AgeGroup): Record<string, Story[]> => {
    const allStories: Record<string, Record<string, Story>> = {
      '3-6': {
        '1': { id: '1', title: '三只小猪', summary: '勤劳的小猪战胜了大灰狼', era: '童话', duration: 300, playCount: 15680, likeCount: 4520 },
        '2': { id: '2', title: '龟兔赛跑', summary: '坚持就是胜利的道理', era: '寓言', duration: 280, playCount: 12580, likeCount: 3890 },
        '3': { id: '3', title: '司马光砸缸', summary: '机智救人的小故事', era: '宋朝', duration: 320, playCount: 11450, likeCount: 3210 },
        '4': { id: '4', title: '孔融让梨', summary: '谦让的美德故事', era: '汉朝', duration: 260, playCount: 9870, likeCount: 2890 },
        '5': { id: '5', title: '曹冲称象', summary: '聪明的称象方法', era: '三国', duration: 340, playCount: 8650, likeCount: 2560 },
        '6': { id: '6', title: '孟母三迁', summary: '选择好邻居的重要性', era: '战国', duration: 380, playCount: 7620, likeCount: 2340 },
      },
      '7-12': {
        '1': { id: '1', title: '赤壁之战', summary: '孙刘联军以少胜多，奠定三国鼎立格局', era: '三国', duration: 480, playCount: 12580, likeCount: 3420 },
        '2': { id: '2', title: '丝绸之路', summary: '张骞出使西域，开启千年商路传奇', era: '汉朝', duration: 520, playCount: 9870, likeCount: 2890 },
        '3': { id: '3', title: '贞观之治', summary: '唐太宗李世民开创盛世典范', era: '唐朝', duration: 600, playCount: 8540, likeCount: 2560 },
        '4': { id: '4', title: '郑和下西洋', summary: '七下西洋，展现大明国威', era: '明朝', duration: 550, playCount: 7620, likeCount: 2340 },
        '5': { id: '5', title: '花木兰从军', summary: '替父从军的巾帼英雄', era: '北朝', duration: 520, playCount: 6890, likeCount: 2100 },
        '6': { id: '6', title: '岳飞抗金', summary: '精忠报国的民族英雄', era: '宋朝', duration: 580, playCount: 5780, likeCount: 1890 },
      },
      '13-17': {
        '1': { id: '1', title: '商鞅变法', summary: '改革图强，奠定秦国霸业基础', era: '战国', duration: 620, playCount: 8450, likeCount: 2890 },
        '2': { id: '2', title: '王安石变法', summary: '宋代改革家的理想与实践', era: '宋朝', duration: 680, playCount: 7230, likeCount: 2450 },
        '3': { id: '3', title: '戊戌变法', summary: '维新派的改革尝试与失败', era: '清朝', duration: 720, playCount: 6580, likeCount: 2120 },
        '4': { id: '4', title: '洋务运动', summary: '自强求富的近代化探索', era: '清朝', duration: 650, playCount: 5890, likeCount: 1980 },
        '5': { id: '5', title: '辛亥革命', summary: '推翻帝制，开创共和', era: '近代', duration: 780, playCount: 5420, likeCount: 1850 },
        '6': { id: '6', title: '五四运动', summary: '青年学生的爱国民主运动', era: '近代', duration: 620, playCount: 5780, likeCount: 1890 },
      },
      '18+': {
        '1': { id: '1', title: '秦始皇统一六国', summary: '建立中国第一个大一统王朝的历史意义与争议', era: '秦朝', duration: 850, playCount: 9870, likeCount: 3120 },
        '2': { id: '2', title: '文景之治', summary: '汉初休养生息的政策智慧', era: '汉朝', duration: 780, playCount: 8450, likeCount: 2780 },
        '3': { id: '3', title: '安史之乱', summary: '唐朝由盛转衰的转折点分析', era: '唐朝', duration: 920, playCount: 7680, likeCount: 2540 },
        '4': { id: '4', title: '靖康之耻', summary: '北宋灭亡的深层原因探讨', era: '宋朝', duration: 880, playCount: 6540, likeCount: 2210 },
        '5': { id: '5', title: '鸦片战争', summary: '中国近代史的开端与影响', era: '清朝', duration: 950, playCount: 5890, likeCount: 1980 },
        '6': { id: '6', title: '改革开放', summary: '当代中国发展的关键转折', era: '现代', duration: 820, playCount: 6780, likeCount: 2340 },
      },
    };
    
    const stories = allStories[age];
    const storyList = Object.values(stories);
    
    return {
      hot: [storyList[0], storyList[1], storyList[2]],
      recommended: [storyList[2], storyList[3], storyList[4]],
      favorite: [storyList[4], storyList[5], storyList[0]],
    };
  };
  
  const rankingStories = getRankingStories(ageGroup);

  const handleSelectRankingStory = (story: Story) => {
    const encodedQuery = encodeURIComponent(story.title);
    const encodedAge = encodeURIComponent(ageGroup);
    router.push(`/play?query=${encodedQuery}&age=${encodedAge}`);
  };

  const features = [
    {
      title: 'AI 实时生成',
      description: '不是播放库存内容，而是 AI 为你实时定制故事。每个故事都是独一无二的。',
      icon: '✨',
    },
    {
      title: '年龄智能适配',
      description: '同一个历史事件，根据你的年龄自动调整内容深度和讲述方式。',
      icon: '🎯',
    },
    {
      title: '故事 + 配音 + 配图',
      description: '文字、语音、插画三位一体，让你沉浸在历史的长河中。',
      icon: '🎨',
    },
  ];

  const ageGroups = [
    { id: '3-6', label: '3-6岁', desc: '童趣盎然', icon: '/icon-child.png' },
    { id: '7-12', label: '7-12岁', desc: '生动有趣', icon: '/icon-teen.png' },
    { id: '13-17', label: '13-17岁', desc: '深入浅出', icon: '/icon-teen.png' },
    { id: '18+', label: '18岁以上', desc: '深度思考', icon: '/icon-adult.png' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100/80 bg-white/85 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image src="/logo.png" alt="历史故事会" width={32} height={32} className="h-8 w-8 shrink-0 rounded-xl shadow-sm" />
            <span className="truncate whitespace-nowrap text-base font-semibold tracking-tight text-gray-950 sm:text-xl">历史故事会</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/history" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              聆听历史
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              精彩故事角
            </Link>
            <Link href="/settings" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              设置
            </Link>
          </nav>
          <UserMenu />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-start justify-center overflow-hidden pt-20 sm:items-center sm:pt-16">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt="历史故事"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-6">
          <div className="mb-5 sm:mb-8">
            <Image 
              src="/app-icon.png" 
              alt="历史故事会" 
              width={120} 
              height={120} 
              className="mx-auto h-20 w-20 rounded-[1.7rem] shadow-[0_18px_45px_rgba(180,83,9,0.22)] sm:h-[120px] sm:w-[120px] sm:rounded-3xl"
            />
          </div>
          
          <h1 className="relative mb-4 inline-block text-[3.25rem] font-bold leading-none tracking-tight sm:mb-6 sm:text-6xl md:text-7xl">
            <span className="absolute inset-0 -m-2 rounded-[1.6rem] border border-white/50 bg-white/45 shadow-[0_14px_45px_rgba(31,38,135,0.12)] backdrop-blur-xl sm:-m-4 sm:rounded-3xl" />
            <span className="relative bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent drop-shadow-sm">
              历史故事会
            </span>
          </h1>
          
          <p className="mb-5 text-xl font-light text-gray-600 sm:mb-8 sm:text-2xl md:text-3xl">
            AI 为你讲述每一个历史瞬间
          </p>
          
          <p className="mx-auto mb-9 max-w-2xl text-[15px] leading-7 text-gray-500 sm:mb-12 sm:text-lg">
            想了解赤壁之战、丝绸之路？输入关键词，AI 实时生成专属故事。<br className="hidden sm:block" />
            文字、配音、配图，三位一体的沉浸体验。
          </p>

          {/* Age Selector */}
          <div className="mb-7 sm:mb-8">
            <p className="mb-3 text-sm text-gray-500 sm:mb-4">选择你的年龄段</p>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
              {ageGroups.map((ag) => (
                <button
                  key={ag.id}
                  onClick={() => setAgeGroup(ag.id as AgeGroup)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all sm:rounded-full sm:px-6 ${
                    ageGroup === ag.id
                      ? 'bg-gray-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.22)] sm:scale-105'
                      : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ag.label} · {ag.desc}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <div className={`relative overflow-hidden rounded-[1.75rem] border bg-white/95 shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-all duration-300 sm:rounded-3xl ${
                searchFocused
                  ? 'border-gray-900 shadow-[0_18px_60px_rgba(15,23,42,0.16)] ring-4 ring-gray-900/5'
                  : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden">
                    <Search className={`absolute h-5 w-5 text-gray-400 transition-all duration-300 ${searchQuery ? 'translate-y-5 opacity-0' : 'translate-y-0 opacity-100'}`} />
                    <Send className={`absolute h-5 w-5 text-gray-500 transition-all duration-300 ${searchQuery ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 160)}
                    placeholder="搜索历史事件，如：赤壁之战"
                    className="min-w-0 flex-1 bg-transparent py-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-lg"
                  />
                  <button
                    onClick={() => handleSearch()}
                    className="shrink-0 rounded-2xl bg-gray-950 px-4 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-base"
                    disabled={!searchQuery.trim()}
                  >
                    开始聆听
                  </button>
                </div>

                <div className={`grid transition-all duration-300 ${searchFocused ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="border-t border-gray-100 bg-white/95 p-2 text-left">
                      {visibleSearchActions.length > 0 ? (
                        <div className="space-y-1">
                          {visibleSearchActions.map((action, index) => (
                            <button
                              key={action.title}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                setSearchQuery(action.title);
                                handleSearch(action.title);
                              }}
                              className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-200 hover:bg-gray-100"
                              style={{ transitionDelay: `${index * 35}ms` }}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                                  {action.icon}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium text-gray-900">{action.title}</span>
                                  <span className="block truncate text-xs text-gray-500">{action.description}</span>
                                </span>
                              </span>
                              <span className="ml-3 shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                {action.tag}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">没有匹配的历史事件，按回车可直接生成。</div>
                      )}
                      <div className="mt-2 flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
                        <span>Enter 开始聆听</span>
                        <span>点击推荐快速生成</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Ranking Section */}
          <div className="mx-auto mt-12 max-w-3xl sm:mt-16">
            <h2 className="mb-6 flex items-center justify-center gap-2 text-center text-[1.35rem] font-semibold text-gray-900 sm:mb-8 sm:text-2xl">
              <Trophy className="h-6 w-6 text-purple-600 sm:h-7 sm:w-7" />
              <span>故事播放排行榜</span>
            </h2>
            <GlobalRanking ageGroup={ageGroup} />
            <p className="text-center text-sm text-gray-500 mt-4">
              仅统计登录用户的播放记录
            </p>
          </div>

          {/* Rankings Section */}
          <div className="mt-16 max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              热门故事排行
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* 热门排行 */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">热门排行</h3>
                </div>
                <div className="p-4 space-y-3">
                  {rankingStories.hot.map((story, index) => (
                    <button
                      key={story.id}
                      onClick={() => handleSelectRankingStory(story)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                          {story.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {story.summary}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(story.duration / 60)}分钟
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {(story.playCount / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 推荐故事 */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4 flex items-center gap-3">
                  <Star className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">推荐故事</h3>
                </div>
                <div className="p-4 space-y-3">
                  {rankingStories.recommended.map((story, index) => (
                    <button
                      key={story.id}
                      onClick={() => handleSelectRankingStory(story)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 group-hover:text-yellow-600 transition-colors truncate">
                          {story.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {story.summary}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(story.duration / 60)}分钟
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {(story.playCount / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 最受喜爱 */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">最受喜爱</h3>
                </div>
                <div className="p-4 space-y-3">
                  {rankingStories.favorite.map((story, index) => (
                    <button
                      key={story.id}
                      onClick={() => handleSelectRankingStory(story)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                          {story.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {story.summary}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(story.duration / 60)}分钟
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {(story.playCount / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            为什么选择历史故事会？
          </h2>
          <p className="mb-12 text-center text-base text-gray-600 sm:mb-20 sm:text-xl">
            不是枯燥的教科书，不是浅薄的短视频
          </p>

          <div className="grid gap-8 sm:gap-12 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Stories Section */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            精彩示例
          </h2>
          <p className="text-xl text-gray-600 text-center mb-20">
            点击即刻体验 AI 生成的历史故事
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {exampleStories.map((story, index) => (
              <button
                key={index}
                onClick={() => {
                  const encodedQuery = encodeURIComponent(story.title);
                  router.push(`/play?query=${encodedQuery}&age=${ageGroup}`);
                }}
                className="group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h3 className="text-3xl font-bold text-white mb-2">{story.title}</h3>
                    <p className="text-gray-200">{story.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section - 精彩故事角 */}
      <section className="py-32 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              精彩故事角
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              深度解读历史，发现那些改变世界的故事
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors text-lg"
            >
              探索更多文章
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/blog/ming-dynasty-stories" className="group">
              <div className="h-full bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
                <div className="aspect-[16/9] bg-gradient-to-br from-amber-50 to-orange-50 relative flex items-center justify-center">
                  <span className="text-5xl opacity-30">📜</span>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-neutral-700">
                      朝代兴衰
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition-colors mb-3">
                    明朝历史哪些事
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    从朱元璋乞丐出身到建立大明王朝，再到郑和下西洋的壮举...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>2024-01-15</span>
                    <span>·</span>
                    <span>8分钟</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/blog/qin-dynasty-fall" className="group">
              <div className="h-full bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
                <div className="aspect-[16/9] bg-gradient-to-br from-red-50 to-orange-50 relative flex items-center justify-center">
                  <span className="text-5xl opacity-30">⚔️</span>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-neutral-700">
                      朝代兴衰
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition-colors mb-3">
                    秦朝为什么灭亡的那么快
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    统一六国、横扫八荒的秦朝，为何仅仅15年就走向灭亡...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>2024-01-18</span>
                    <span>·</span>
                    <span>10分钟</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/blog/han-dynasty-glory" className="group">
              <div className="h-full bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300">
                <div className="aspect-[16/9] bg-gradient-to-br from-yellow-50 to-amber-50 relative flex items-center justify-center">
                  <span className="text-5xl opacity-30">👑</span>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-neutral-700">
                      朝代兴衰
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition-colors mb-3">
                    汉朝的强大
                  </h3>
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    犯强汉者，虽远必诛！汉朝四百年基业，开创了中国第一个黄金时代...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>2024-01-20</span>
                    <span>·</span>
                    <span>12分钟</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Age Adaptation Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            同一个故事，不同的讲述方式
          </h2>
          <p className="text-xl text-gray-600 text-center mb-20">
            AI 根据你的年龄自动调整内容深度和讲述风格
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {ageGroups.map((ag) => (
              <div
                key={ag.id}
                className={`p-8 rounded-2xl text-center transition-all ${
                  ageGroup === ag.id
                    ? 'bg-white shadow-xl scale-105'
                    : 'bg-white shadow-md'
                }`}
              >
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src={ag.icon}
                    alt={ag.label}
                    fill
                    className="object-contain rounded-full"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{ag.label}</h3>
                <p className="text-gray-600 text-sm">{ag.desc}</p>
                {ageGroup === ag.id && (
                  <div className="mt-4 text-xs text-amber-600 font-medium">当前选择</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            准备好聆听历史了吗？
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            输入任何历史事件或知识点，AI 立即为你生成专属故事
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-12 py-5 bg-white text-gray-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-xl"
          >
            开始体验
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>历史故事会 · AI 为你讲述每一个历史瞬间</p>
          <p className="mt-2">让历史不再遥远，让故事触手可及</p>
        </div>
      </footer>
    </div>
  );
}
