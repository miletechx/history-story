import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { getPostBySlug, getAllPosts } from '@/lib/blog-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: '文章未找到' };
  
  return {
    title: `${post.title} - 历史故事会`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  // 简单的 markdown 渲染
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph = '';
    let key = 0;

    const flushParagraph = () => {
      if (currentParagraph.trim()) {
        elements.push(
          <p key={key++} className="text-lg text-neutral-700 leading-relaxed mb-6">
            {currentParagraph.trim()}
          </p>
        );
        currentParagraph = '';
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // 标题
      if (trimmedLine.startsWith('# ')) {
        flushParagraph();
        elements.push(
          <h1 key={key++} className="text-4xl font-bold text-neutral-900 mt-12 mb-6 first:mt-0">
            {trimmedLine.slice(2)}
          </h1>
        );
      } else if (trimmedLine.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={key++} className="text-2xl font-semibold text-neutral-900 mt-10 mb-4">
            {trimmedLine.slice(3)}
          </h2>
        );
      } else if (trimmedLine.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h3 key={key++} className="text-xl font-semibold text-neutral-900 mt-8 mb-3">
            {trimmedLine.slice(4)}
          </h3>
        );
      }
      // 列表项
      else if (trimmedLine.startsWith('- ')) {
        flushParagraph();
        elements.push(
          <li key={key++} className="text-lg text-neutral-700 ml-6 mb-2">
            {trimmedLine.slice(2)}
          </li>
        );
      }
      // 空行
      else if (trimmedLine === '') {
        flushParagraph();
      }
      // 普通段落
      else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
      }
    });

    flushParagraph();
    return elements;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回文章列表</span>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Meta */}
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-4">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{post.publishDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <span>·</span>
              <span>{post.author}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-neutral prose-lg max-w-none">
            {renderContent(post.content)}
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-neutral-500" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-neutral-100 rounded-full text-sm text-neutral-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related CTA */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            想听这篇故事的音频版？
          </h2>
          <p className="text-neutral-600 mb-8">
            回到首页，搜索相关历史事件，让AI为你定制专属的历史故事
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            开始聆听
          </Link>
        </div>
      </section>
    </div>
  );
}
