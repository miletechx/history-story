import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { blogPosts } from '@/lib/blog-data';

export async function GET() {
	try {
		const client = getSupabaseClient();

		// 检查是否已有数据
		const { data: existingPosts, error: checkError } = await client
			.from('blog_posts')
			.select('id')
			.limit(1);

		if (checkError) {
			throw new Error(`检查失败: ${checkError.message}`);
		}

		// 如果已有数据，返回提示
		if (existingPosts && existingPosts.length > 0) {
			return NextResponse.json({
				message: '数据库已有文章，跳过迁移',
				count: existingPosts.length,
			});
		}

		// 迁移三篇文章到数据库
		const postsToInsert = blogPosts.map(post => ({
			title: post.title,
			summary: post.summary,
			content: post.content,
		}));

		const { data, error } = await client
			.from('blog_posts')
			.insert(postsToInsert)
			.select();

		if (error) {
			throw new Error(`迁移失败: ${error.message}`);
		}

		return NextResponse.json({
			message: '迁移成功',
			count: data?.length || 0,
			posts: data,
		});
	} catch (error) {
		console.error('迁移失败:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : '迁移失败' },
			{ status: 500 }
		);
	}
}
