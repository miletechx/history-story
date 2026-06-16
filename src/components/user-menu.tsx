'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';

interface User {
	id: number;
	username: string;
}

export function UserMenu() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	useEffect(() => {
		fetch('/api/auth/me')
			.then((res) => res.json())
			.then((data) => {
				setUser(data.user);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	// 点击外部关闭下拉菜单
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLogout = async () => {
		await fetch('/api/auth/logout', { method: 'POST' });
		setUser(null);
		setDropdownOpen(false);
		router.push('/');
		router.refresh();
	};

	if (loading) {
		return <div className="w-20 h-9 animate-pulse bg-gray-200 rounded-lg" />;
	}

	if (user) {
		return (
			<div className="relative" ref={dropdownRef}>
				<button
					onClick={() => setDropdownOpen(!dropdownOpen)}
					className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
				>
					<div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-medium text-sm">
						{user.username[0].toUpperCase()}
					</div>
					<span className="text-sm font-medium text-gray-900">{user.username}</span>
					<ChevronDown className="w-4 h-4 text-gray-500" />
				</button>

				{dropdownOpen && (
					<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
						<div className="px-4 py-2 border-b border-gray-100">
							<p className="text-xs text-gray-500">已登录</p>
							<p className="text-sm font-medium text-gray-900">{user.username}</p>
						</div>
						<button
							onClick={() => {
								setDropdownOpen(false);
								router.push('/profile');
							}}
							className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
						>
							<LayoutDashboard className="w-4 h-4" />
							个人中心
						</button>
						<button
							onClick={() => {
								setDropdownOpen(false);
								router.push('/settings');
							}}
							className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
						>
							<Settings className="w-4 h-4" />
							设置
						</button>
						<button
							onClick={handleLogout}
							className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
						>
							<LogOut className="w-4 h-4" />
							退出
						</button>
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<Link href="/login">
				<Button variant="ghost" className="text-gray-600 hover:text-gray-900">
					<LogIn className="w-4 h-4 mr-1" />
					登录
				</Button>
			</Link>
			<Link href="/register">
				<Button className="bg-amber-700 hover:bg-amber-800 text-white">
					<UserPlus className="w-4 h-4 mr-1" />
					注册
				</Button>
			</Link>
		</div>
	);
}
