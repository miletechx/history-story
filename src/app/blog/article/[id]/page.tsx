'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

interface BlogPost {
	id: number;
	title: string;
	summary: string;
	content: string;
	created_at: string;
}

export default function ArticlePage() {
	const params = useParams();
	const [post, setPost] = useState<BlogPost | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchPost() {
			try {
				const res = await fetch(`/api/blog-posts/${params.id}`);
				if (!res.ok) throw new Error('获取失败');
				const data = await res.json();
				setPost(data);
			} catch (error) {
				console.error('获取文章详情失败:', error);
			} finally {
				setLoading(false);
			}
		}
		if (params.id) {
			fetchPost();
		}
	}, [params.id]);

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const calcReadTime = (content: string) => {
		const words = content.length;
		const minutes = Math.ceil(words / 500);
		return `${minutes}分钟`;
	};

	// 简单的Markdown渲染
	const renderContent = (content: string) => {
		const lines = content.split('\n');
		return lines.map((line, i) => {
			if (line.startsWith('## ')) {
				return (
					<h2 key={i} className="text-2xl font-bold text-neutral-900 mt-8 mb-4">
						{line.replace('## ', '')}
					</h2>
				);
			}
			if (line.startsWith('- ')) {
				return (
					<li key={i} className="text-neutral-700 leading-relaxed ml-4">
						{line.replace('- ', '')}
					</li>
				);
			}
			if (line.trim() === '') {
				return <br key={i} />;
			}
			return (
				<p key={i} className="text-neutral-700 leading-relaxed mb-4">
					{line}
				</p>
			);
		});
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
				<div className="max-w-5xl mx-auto px-6 py-4">
					<Link
						href="/blog"
						className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>返回列表</span>
					</Link>
				</div>
			</header>

			{loading ? (
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
				</div>
			) : !post ? (
				<div className="flex items-center justify-center min-h-[60vh]">
					<p className="text-neutral-500">文章不存在</p>
				</div>
			) : (
				<>
					{/* Article Header */}
					<section className="py-12 md:py-16 text-center border-b border-neutral-100">
						<div className="max-w-3xl mx-auto px-6">
							<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-6">
								{post.title}
							</h1>
							<p className="text-lg text-neutral-600 mb-6">{post.summary}</p>
							<div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
								<div className="flex items-center gap-1.5">
									<Calendar className="w-4 h-4" />
									<span>{formatDate(post.created_at)}</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Clock className="w-4 h-4" />
									<span>{calcReadTime(post.content)}</span>
								</div>
							</div>
						</div>
					</section>

					{/* Article Content */}
					<article className="py-12 md:py-16">
						<div className="max-w-3xl mx-auto px-6">
							{renderContent(post.content)}
						</div>
					</article>

					{/* Related */}
					<section className="py-12 bg-gradient-to-b from-neutral-50 to-white border-t border-neutral-100">
						<div className="max-w-3xl mx-auto px-6 text-center">
							<h3 className="text-xl font-semibold text-neutral-900 mb-6">
								想听听这些历史的音频故事？
							</h3>
							<Link
								href="/"
								className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors"
							>
								<span>回到首页开始聆听</span>
							</Link>
						</div>
					</section>
				</>
			)}
		</div>
	);
}
