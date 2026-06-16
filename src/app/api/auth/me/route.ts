import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
	try {
		const userId = request.cookies.get('user_id')?.value;

		if (!userId) {
			return NextResponse.json(
				{ user: null },
				{ status: 200 }
			);
		}

		const supabase = getSupabaseClient();

		// 从数据库获取用户信息
		const { data: user, error } = await supabase
			.from('users')
			.select('id, username, created_at')
			.eq('id', parseInt(userId))
			.single();

		if (error || !user) {
			// 用户不存在，清除cookie
			const response = NextResponse.json({ user: null });
			response.cookies.delete('user_id');
			response.cookies.delete('username');
			return response;
		}

		return NextResponse.json({
			user: {
				id: user.id,
				username: user.username,
			},
		});
	} catch (error) {
		console.error('获取用户信息错误:', error);
		return NextResponse.json(
			{ user: null },
			{ status: 200 }
		);
	}
}
