import { NextRequest, NextResponse } from 'next/server';
import { createStoryGenerationStream } from '@/services/story-generation.service';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { query, ageGroup } = await request.json();

    if (!query) {
      return NextResponse.json({ error: '缺少查询内容' }, { status: 400 });
    }

    return createStoryGenerationStream(query, ageGroup, request.headers);
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
