import { NextRequest, NextResponse } from 'next/server';
import { createStoryRecord, getUserStoryRecords } from '@/services/story-record.service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ records: [] });
    }

    const records = await getUserStoryRecords(userId);
    return NextResponse.json({ records });
  } catch (error) {
    console.error('获取播放记录失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json({ error: '请先登录', needLogin: true }, { status: 401 });
    }

    const body = await request.json();
    const { story_name, story_id, duration } = body;

    if (!story_name || !story_id || !duration) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const record = await createStoryRecord(userId, { story_name, story_id, duration });
    return NextResponse.json({ success: true, message: '播放记录已保存', record });
  } catch (error) {
    console.error('保存播放记录失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
