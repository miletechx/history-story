'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		// 验证
		if (username.length < 3 || username.length > 20) {
			setError('用户名长度应在3-20个字符之间');
			return;
		}

		if (password.length < 6) {
			setError('密码长度至少6个字符');
			return;
		}

		if (password !== confirmPassword) {
			setError('两次输入的密码不一致');
			return;
		}

		setLoading(true);

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (data.success) {
				// 注册成功，跳转到首页
				router.push('/');
			} else {
				setError(data.error || '注册失败');
			}
		} catch {
			setError('注册失败，请稍后重试');
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

				{/* 注册卡片 */}
				<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
					{/* 标题 */}
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<UserPlus className="w-8 h-8 text-amber-700" />
						</div>
						<h1 className="text-2xl font-semibold text-gray-900">创建账户</h1>
						<p className="text-gray-500 mt-2">加入历史故事会，聆听精彩故事</p>
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
								placeholder="请输入用户名（3-20字符）"
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
								placeholder="请输入密码（至少6字符）"
								className="w-full"
								disabled={loading}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								确认密码
							</label>
							<Input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="请再次输入密码"
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
							{loading ? '注册中...' : '注册'}
						</Button>
					</form>

					{/* 登录链接 */}
					<div className="text-center mt-6 text-gray-600">
						已有账户？{' '}
						<Link href="/login" className="text-amber-700 hover:text-amber-800 font-medium">
							立即登录
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
