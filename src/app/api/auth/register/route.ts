import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const SALT_ROUNDS = 10;

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

		if (username.length < 3 || username.length > 20) {
			return NextResponse.json(
				{ error: '用户名长度应在3-20个字符之间' },
				{ status: 400 }
			);
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: '密码长度至少6个字符' },
				{ status: 400 }
			);
		}

		const supabase = getSupabaseClient();

		// 检查用户名是否已存在
		const { data: existingUsers, error: checkError } = await supabase
			.from('users')
			.select('id')
			.eq('username', username)
			.limit(1);

		if (checkError) {
			console.error('检查用户名失败:', checkError);
			return NextResponse.json(
				{ error: '注册失败，请稍后重试' },
				{ status: 500 }
			);
		}

		if (existingUsers && existingUsers.length > 0) {
			return NextResponse.json(
				{ error: '用户名已存在' },
				{ status: 400 }
			);
		}

		// 哈希加密密码
		const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

		// 插入新用户
		const { data: newUser, error: insertError } = await supabase
			.from('users')
			.insert({
				username,
				password: hashedPassword,
			})
			.select('id, username, created_at')
			.single();

		if (insertError) {
			console.error('创建用户失败:', insertError);
			return NextResponse.json(
				{ error: '注册失败，请稍后重试' },
				{ status: 500 }
			);
		}

		// 创建响应并设置cookie
		const response = NextResponse.json({
			success: true,
			user: {
				id: newUser.id,
				username: newUser.username,
			},
		});

		// 设置登录cookie（有效期7天）
		response.cookies.set('user_id', String(newUser.id), {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7天
			path: '/',
		});

		response.cookies.set('username', newUser.username, {
			httpOnly: false, // 前端可读取
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7,
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('注册错误:', error);
		return NextResponse.json(
			{ error: '注册失败，请稍后重试' },
			{ status: 500 }
		);
	}
}
