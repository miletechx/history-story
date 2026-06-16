import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AdminUser {
  id: number;
  username: string;
}

function splitEnvList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isAdminUser(user: AdminUser): boolean {
  const adminIds = splitEnvList(process.env.ADMIN_USER_IDS);
  const adminUsernames = splitEnvList(process.env.ADMIN_USERNAMES);

  // TODO: 当前 schema 没有 role/is_admin 字段，先用环境变量做最小管理员保护。
  return adminIds.includes(String(user.id)) || adminUsernames.includes(user.username);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return null;
  }

  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId)) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', numericUserId)
    .single();

  if (error || !data) {
    return null;
  }

  const user: AdminUser = {
    id: Number(data.id),
    username: String(data.username),
  };

  return isAdminUser(user) ? user : null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/login');
  }

  return admin;
}

export function getRecentStartDate(days = 7): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
