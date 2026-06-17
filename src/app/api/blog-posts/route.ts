import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取所有文章列表
export async function GET() {
	try {
		const client = getSupabaseClient();

		const { data, error } = await client
			.from('blog_posts')
			.select('id, title, summary, content, created_at')
			.order('created_at', { ascending: false });

		if (error) {
			throw new Error(`查询失败: ${error.message}`);
		}

		return NextResponse.json(data || []);
	} catch (error) {
		console.error('获取文章列表失败:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : '获取失败' },
			{ status: 500 }
		);
	}
}
