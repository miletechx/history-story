import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedStory, saveGeneratedStory } from '@/services/generated-story.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getGeneratedStory(searchParams.get('query'), searchParams.get('ageGroup'));

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('查询已生成故事失败:', error);
    return NextResponse.json({ error: '查询已生成故事失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await saveGeneratedStory(body);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('保存已生成故事失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
