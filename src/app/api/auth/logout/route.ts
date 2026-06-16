import { NextResponse } from 'next/server';

export async function POST() {
	try {
		const response = NextResponse.json({ success: true });

		// 清除cookie
		response.cookies.delete('user_id');
		response.cookies.delete('username');

		return response;
	} catch (error) {
		console.error('登出错误:', error);
		return NextResponse.json(
			{ error: '登出失败' },
			{ status: 500 }
		);
	}
}
