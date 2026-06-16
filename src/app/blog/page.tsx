'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';

interface BlogPost {
	id: number;
	title: string;
	summary: string;
	content: string;
	created_at: string;
}

export default function BlogPage() {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchPosts() {
			try {
				const res = await fetch('/api/blog-posts');
				if (!res.ok) throw new Error('获取失败');
				const data = await res.json();
				setPosts(data);
			} catch (error) {
				console.error('获取文章列表失败:', error);
			} finally {
				setLoading(false);
			}
		}
		fetchPosts();
	}, []);

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

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
				<div className="max-w-5xl mx-auto px-6 py-4">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>返回首页</span>
					</Link>
				</div>
			</header>

			{/* Hero */}
			<section className="py-16 md:py-24 text-center">
				<div className="max-w-4xl mx-auto px-6">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight mb-4">
						精彩故事角
					</h1>
					<p className="text-lg md:text-xl text-neutral-600">
						深度解读历史，发现那些改变世界的故事
					</p>
				</div>
			</section>

			{/* Blog Grid */}
			<section className="pb-24">
				<div className="max-w-6xl mx-auto px-6">
					{loading ? (
						<div className="text-center py-20">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
							<p className="text-neutral-500">加载中...</p>
						</div>
					) : posts.length === 0 ? (
						<div className="text-center py-20">
							<p className="text-neutral-500">暂无文章</p>
						</div>
					) : (
						<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{posts.map((post) => (
								<Link
									key={post.id}
									href={`/blog/article/${post.id}`}
									className="group"
								>
									<article className="h-full bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
										{/* Image */}
										<div className="relative aspect-[16/9] bg-gradient-to-br from-amber-50 to-orange-50">
											<div className="absolute inset-0 flex items-center justify-center">
												<span className="text-6xl opacity-20">📜</span>
											</div>
										</div>

										{/* Content */}
										<div className="p-6">
											<h2 className="text-xl font-semibold text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2 mb-3">
												{post.title}
											</h2>
											<p className="text-neutral-600 line-clamp-3 mb-4">
												{post.summary}
											</p>

											{/* Meta */}
											<div className="flex items-center gap-4 text-sm text-neutral-500">
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
									</article>
								</Link>
							))}
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
