'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		if (!username || !password) {
			setError('请输入用户名和密码');
			return;
		}

		setLoading(true);

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (data.success) {
				// 登录成功，跳转到首页
				router.push('/');
			} else {
				setError(data.error || '登录失败');
			}
		} catch {
			setError('登录失败，请稍后重试');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				{/* 返回按钮 */}
				<Link
					href="/"
					className="inline-flex items-center text-gray-600 hover:text-amber-700 mb-8 transition-colors"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					返回首页
				</Link>

				{/* 登录卡片 */}
				<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
					{/* 标题 */}
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<LogIn className="w-8 h-8 text-amber-700" />
						</div>
						<h1 className="text-2xl font-semibold text-gray-900">欢迎回来</h1>
						<p className="text-gray-500 mt-2">登录历史故事会，继续您的聆听之旅</p>
					</div>

					{/* 表单 */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								用户名
							</label>
							<Input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="请输入用户名"
								className="w-full"
								disabled={loading}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								密码
							</label>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="请输入密码"
								className="w-full"
								disabled={loading}
							/>
						</div>

						{/* 错误提示 */}
						{error && (
							<div className="text-red-500 text-sm text-center py-2">
								{error}
							</div>
						)}

						{/* 提交按钮 */}
						<Button
							type="submit"
							disabled={loading}
							className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 text-lg font-medium"
						>
							{loading ? '登录中...' : '登录'}
						</Button>
					</form>

					{/* 注册链接 */}
					<div className="text-center mt-6 text-gray-600">
						还没有账户？{' '}
						<Link href="/register" className="text-amber-700 hover:text-amber-800 font-medium">
							立即注册
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
