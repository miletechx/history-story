import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();

		// 验证输入
		if (!username || !password) {
			return NextResponse.json(
				{ error: '用户名和密码不能为空' },
				{ status: 400 }
			);
		}

		const supabase = getSupabaseClient();

		// 查找用户
		const { data: user, error: findError } = await supabase
			.from('users')
			.select('id, username, password')
			.eq('username', username)
			.single();

		if (findError || !user) {
			return NextResponse.json(
				{ error: '用户名或密码错误' },
				{ status: 401 }
			);
		}

		// 验证密码
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: '用户名或密码错误' },
				{ status: 401 }
			);
		}

		// 创建响应并设置cookie
		const response = NextResponse.json({
			success: true,
			user: {
				id: user.id,
				username: user.username,
			},
		});

		// 设置登录cookie（有效期7天）
		response.cookies.set('user_id', String(user.id), {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7天
			path: '/',
		});

		response.cookies.set('username', user.username, {
			httpOnly: false, // 前端可读取
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('登录错误:', error);
		return NextResponse.json(
			{ error: '登录失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
