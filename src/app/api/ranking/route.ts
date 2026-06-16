import { NextResponse } from 'next/server';
import { getStoryRanking } from '@/services/ranking.service';

export async function GET() {
  try {
    const ranking = await getStoryRanking();
    return NextResponse.json({ ranking });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
